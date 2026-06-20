// Pure helpers that turn the collected flow state into a backend request
// (scores + filters + a B1 user message) and a transparent reasoning list.

import { PILLAR_LABEL, lowestMiddel, ATTENTION_THRESHOLD } from '../data/leefstijl.js'

// When a middel is the user's aandachtspunt, name the concrete change goal so
// semantic retrieval can find matching support (e.g. "stoppen met roken").
// Middelen sliders are 0 = heel vaak ... 100 = nooit, so a LOW score means the
// substance is used a lot.
const MIDDEL_QUERY = {
  Roken: 'Ik rook en wil graag stoppen met roken.',
  Alcohol: 'Ik drink vaak alcohol en wil minderen of stoppen.',
  Drugs: 'Ik gebruik drugs en wil daarmee stoppen.',
  Medicijnen: 'Ik gebruik veel medicijnen en wil daar iets aan veranderen.',
}

export function buildScores(s) {
  const scores = { ...s.scores }
  scores.middelen = lowestMiddel(s.middelen).score
  return scores
}

export function buildFilters(s) {
  const f = {}
  const plek = s.answers.bewegen_plek
  if (plek === 'Binnen') f.binnenBuiten = 'binnen'
  else if (plek === 'Buiten') f.binnenBuiten = 'buiten'
  const samen = s.answers.bewegen_samen || s.answers.verbinding_groep
  if (samen === 'In een groep' || samen === 'Groep') f.groep = 'groep'
  else if (samen === 'Alleen' || samen === '1-op-1') f.groep = 'individueel'
  const age = parseInt(s.profile.leeftijd, 10)
  if (Number.isFinite(age)) f.age = age
  // Only Man/Vrouw constrain matching; 'Anders' / 'Zeg ik liever niet' /
  // unanswered send no gender filter, so they see every activity.
  if (s.profile.gender === 'Man') f.gender = 'man'
  else if (s.profile.gender === 'Vrouw') f.gender = 'vrouw'
  return f
}

export function buildUserMessage(s) {
  if (s.entryType === 'precies' && s.directQuery.trim()) return s.directQuery.trim()

  const parts = []
  if (s.topic) parts.push(`Ik wil vooral iets doen met ${(PILLAR_LABEL[s.topic] || s.topic).toLowerCase()}.`)

  const lows = Object.entries(s.scores)
    .filter(([, v]) => v < ATTENTION_THRESHOLD)
    .map(([k]) => (PILLAR_LABEL[k] || k).toLowerCase())
  if (lows.length) parts.push(`Ik vind ${lows.join(', ')} op dit moment lastig.`)

  // Middelen are scored on separate sliders (s.middelen), so the lowest middel
  // never reaches the query via `lows` above. In the nog_niet path that means
  // a low Roken/Alcohol/etc score otherwise contributes nothing to retrieval.
  const lowMid = lowestMiddel(s.middelen)
  if (lowMid.score < ATTENTION_THRESHOLD) {
    parts.push(MIDDEL_QUERY[lowMid.naam] || `Ik gebruik vaak ${lowMid.naam.toLowerCase()} en wil daar iets aan veranderen.`)
  }

  const plek = s.answers.bewegen_plek
  if (plek && plek !== 'Maakt niet uit') parts.push(`Ik doe dingen het liefst ${plek.toLowerCase()}.`)

  const samen = s.answers.bewegen_samen || s.answers.verbinding_groep
  if (samen && samen !== 'Maakt niet uit') {
    parts.push(`Ik doe liever iets ${(samen === 'In een groep' || samen === 'Groep') ? 'samen in een groep' : samen.toLowerCase()}.`)
  }

  for (const key of ['ontspanning_hobby', 'voeding_moeilijk', 'voeding_dieet_welke']) {
    if (typeof s.answers[key] === 'string' && s.answers[key].trim()) parts.push(s.answers[key].trim())
  }

  if (s.entryType === 'beetje' && s.chosenPillars.length) {
    parts.push(`Ik wil graag iets met ${s.chosenPillars.map((k) => (PILLAR_LABEL[k] || k).toLowerCase()).join(' en ')}.`)
  }
  if (Array.isArray(s.answers.middelen_welke) && s.answers.middelen_welke.length) {
    parts.push(`Ik gebruik ${s.answers.middelen_welke.join(', ').toLowerCase()} en wil daar misschien iets aan veranderen.`)
  }

  return parts.join(' ').trim() || 'Ik zoek een activiteit die bij mij past in de buurt.'
}

export function buildReasoning(s, matches) {
  const items = []
  // Sliders only exist in the 'nog_niet' path; in precies/beetje every score
  // is the untouched default of 50, so showing a pillar score there is
  // misleading. Only show it for nog_niet, with the real submitted score,
  // and call it "Lage score" only when it is actually below the threshold.
  if (s.entryType === 'nog_niet') {
    const lowMid = lowestMiddel(s.middelen)
    const all = { ...s.scores, middelen: lowMid.score }
    const [key, n] = Object.entries(all).sort((a, b) => a[1] - b[1])[0]
    // Name the concrete middel (e.g. roken) rather than the generic "middelen".
    const naam = key === 'middelen' ? lowMid.naam.toLowerCase() : (PILLAR_LABEL[key] || key).toLowerCase()
    const prefix = n < ATTENTION_THRESHOLD ? 'Lage score op' : 'Score op'
    items.push({ label: `${prefix} ${naam}:`, value: `${n}/100` })
  }
  if (s.topic) items.push({ label: 'Belangrijkste onderwerp:', value: PILLAR_LABEL[s.topic] })

  const plek = s.answers.bewegen_plek
  if (plek && plek !== 'Maakt niet uit') items.push({ label: 'Voorkeur:', value: plek.toLowerCase() })

  const samen = s.answers.bewegen_samen || s.answers.verbinding_groep
  if (samen && samen !== 'Maakt niet uit') {
    items.push({ label: 'Voorkeur:', value: (samen === 'In een groep' || samen === 'Groep') ? 'samen (groep)' : samen.toLowerCase() })
  }

  const limits = s.answers.bewegen_beperking
  if (Array.isArray(limits) && limits.filter((l) => l !== '__geen').length) {
    items.push({ label: 'Houdt rekening met:', value: limits.filter((l) => l !== '__geen').join(', ').toLowerCase() })
  }

  const wijken = [...new Set(matches.map((m) => m.locatie_wijk).filter(Boolean))]
  if (wijken.length) items.push({ label: 'Activiteiten in:', value: wijken.join(', ') })
  return items
}
