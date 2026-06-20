/* Shared pillar follow-up question renderers.
   Used by BOTH the desktop (screens/pillars.jsx) and mobile
   (screens/mobile/pillars.jsx) Vragen screens so the question behaviour —
   including the F-10 conditional diet field and the limits/multi logic —
   stays identical across layouts. */
import { ChoiceGroup, CheckRow, TextArea } from './ui.jsx'
import { LIMIT_GROUPS } from '../data/leefstijl.js'

export function LimitsQuestion({ q, value, dispatch }) {
  const arr = Array.isArray(value) ? value : []
  const geen = arr.includes('__geen')
  const toggleItem = (item) => {
    const next = arr.includes(item) ? arr.filter((v) => v !== item) : [...arr.filter((v) => v !== '__geen'), item]
    dispatch({ type: 'SET_ANSWER', id: q.id, value: next })
  }
  const toggleGeen = () => dispatch({ type: 'SET_ANSWER', id: q.id, value: geen ? [] : ['__geen'] })
  return (
    <div className="box dashed">
      <div className="h-card" style={{ marginBottom: 4 }}>{q.label}</div>
      {q.hint && <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>{q.hint}</p>}
      <div className="col" style={{ gap: 12 }}>
        {LIMIT_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="muted" style={{ marginBottom: 6, fontWeight: 600 }}>{g.label}</div>
            <div className="col" style={{ gap: 6 }}>
              {g.items.map((item) => (
                <CheckRow key={item} checked={arr.includes(item)} onToggle={() => toggleItem(item)}>{item}</CheckRow>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1.5px dashed var(--ink-3)' }}>
        <CheckRow checked={geen} onToggle={toggleGeen}><strong>Geen van bovenstaande</strong> — ik heb geen beperkingen</CheckRow>
      </div>
    </div>
  )
}

export function MultiQuestion({ q, value, dispatch }) {
  const arr = Array.isArray(value) ? value : []
  return (
    <div>
      <div className="h-card" style={{ marginBottom: q.hint ? 4 : 8 }}>{q.label}</div>
      {q.hint && <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>{q.hint}</p>}
      <div className="opt-row">
        {q.options.map((o) => {
          const on = arr.includes(o)
          return (
            <button type="button" key={o} className={`btn${on ? ' primary' : ''}`} aria-pressed={on}
              onClick={() => dispatch({ type: 'TOGGLE_ANSWER', id: q.id, value: o })}>
              <span className={`box-check${on ? ' on' : ''}`} aria-hidden="true">{on ? '✓' : ''}</span>{o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* Render a single follow-up question by type. */
export function QuestionField({ q, answers, dispatch }) {
  if (q.type === 'limits') return <LimitsQuestion q={q} value={answers[q.id]} dispatch={dispatch} />
  if (q.type === 'multi') return <MultiQuestion q={q} value={answers[q.id]} dispatch={dispatch} />
  if (q.type === 'text') {
    return (
      <TextArea id={q.id} label={q.label} value={answers[q.id] || ''}
        onChange={(v) => dispatch({ type: 'SET_ANSWER', id: q.id, value: v })} />
    )
  }
  return (
    <ChoiceGroup label={q.label} options={q.options} layout={q.layout || 'row'}
      value={answers[q.id]} onChange={(v) => dispatch({ type: 'SET_ANSWER', id: q.id, value: v })} />
  )
}
