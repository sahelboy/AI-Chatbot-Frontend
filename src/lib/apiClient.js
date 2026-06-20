// API client for the Sociaal Knooppunt backend.
// Adapters between the design's state-model and the API:
//   - messages: design {id, role:'bot'|'user', text}  <->  API {role:'assistant'|'user', content}
//   - scores:   design {bewegen: 35, ...}             <->  API [{pillar:'bewegen', score:35}, ...]
//   - filters:  design {wijk, groep, binnenBuiten}    <->  API {wijk, individueel_groep, binnen_buiten}

// Anonymous session id is kept IN-MEMORY only (privacy by design: no
// localStorage/sessionStorage). It lives for the lifetime of the page.
let _sessionId = null

function getOrCreateSessionId() {
  if (!_sessionId) {
    const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2, 9)
    _sessionId = 'sess-' + rnd
  }
  return _sessionId
}

export function resetSession() {
  _sessionId = null
}

export function toApiMessages(messages) {
  return messages
    .filter((m) => m.text || m.content)
    .map((m) => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.text || m.content,
    }))
}

export function toApiScores(scores) {
  if (!scores) return undefined
  const out = Object.entries(scores)
    .filter(([, v]) => typeof v === 'number')
    .map(([pillar, score]) => ({ pillar, score }))
  return out.length ? out : undefined
}

export function toApiFilters({ wijk, groep, binnenBuiten, mobi, age, gender } = {}) {
  const out = {}
  if (wijk) out.wijk = wijk
  if (groep) out.individueel_groep = groep
  if (binnenBuiten) out.binnen_buiten = binnenBuiten
  if (mobi) out.mobility = mobi
  if (typeof age === 'number') out.age = age
  if (gender) out.gender = gender
  return Object.keys(out).length ? out : undefined
}

// streamChat: POST /chat/stream, parse SSE, dispatch callbacks.
// Returns a promise that resolves when the stream is done (or rejects on network error).
// callbacks: { onActivities, onDelta, onCrisis, onDone, onDebug }
export async function streamChat({ messages, scores, filters, callbacks = {}, sessionId, signal }) {
  const body = {
    messages: toApiMessages(messages),
    ...(toApiScores(scores) ? { scores: toApiScores(scores) } : {}),
    ...(toApiFilters(filters) ? { filters: toApiFilters(filters) } : {}),
  }

  const headers = { 'Content-Type': 'application/json' }
  const sid = sessionId || getOrCreateSessionId()
  if (sid) headers['X-Session-Id'] = sid

  const res = await fetch('/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('streamChat failed: ' + res.status + ' ' + text)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() // keep partial event in buffer
    for (const ev of events) {
      const line = ev.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      let payload
      try { payload = JSON.parse(line.slice(6)) } catch { continue }
      switch (payload.type) {
        case 'activities':
          callbacks.onActivities?.(payload.activities || [])
          callbacks.onDebug?.(payload.debug)
          break
        case 'delta':
          callbacks.onDelta?.(payload.content || '')
          break
        case 'crisis':
          callbacks.onCrisis?.(payload)
          break
        case 'done':
          callbacks.onDone?.()
          break
        default:
          // ignore unknown event types
      }
    }
  }
}

export async function getActivity(id) {
  const res = await fetch('/activities/' + encodeURIComponent(id))
  if (!res.ok) throw new Error('getActivity failed: ' + res.status)
  return res.json()
}

export async function listActivities(filters) {
  const q = new URLSearchParams()
  const f = toApiFilters(filters)
  if (f?.wijk) q.set('wijk', f.wijk)
  if (f?.individueel_groep) q.set('individueel_groep', f.individueel_groep)
  if (f?.binnen_buiten) q.set('binnen_buiten', f.binnen_buiten)
  if (f?.mobility) q.set('mobility', f.mobility)
  if (typeof f?.age === 'number') q.set('age', String(f.age))
  const res = await fetch('/activities?' + q.toString())
  if (!res.ok) throw new Error('listActivities failed: ' + res.status)
  return res.json()
}

export async function createUser({ naam, email, leeftijd, postcode4 }) {
  const body = { naam, email }
  if (typeof leeftijd === 'number') body.leeftijd = leeftijd
  if (postcode4) body.postcode_4 = postcode4
  const res = await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 503) {
    const err = new Error('contact feature disabled')
    err.code = 'FEATURE_DISABLED'
    throw err
  }
  if (!res.ok) throw new Error('createUser failed: ' + res.status)
  return res.json()
}

export async function createContactRequest(userId, activityId, notes) {
  const res = await fetch('/users/' + userId + '/contact-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activity_id: activityId, ...(notes ? { notes } : {}) }),
  })
  if (res.status === 503) {
    const err = new Error('contact feature disabled')
    err.code = 'FEATURE_DISABLED'
    throw err
  }
  if (!res.ok) throw new Error('createContactRequest failed: ' + res.status)
  return res.json()
}

export { getOrCreateSessionId }
