/* Activity result card + match-reasoning panel.
   Renders ONLY fields that exist in activities.json (no invented details). */

const META_ICON = { wijk: '📍', tijd: '🕐', kosten: '💶' }

export function ResultCard({ activity, index, selected, onToggle }) {
  const a = activity
  return (
    <div className={`box shadow${selected ? ' sel' : ''}`} style={{ padding: 14 }}>
      <div className="placeholder" style={{ height: 96, marginBottom: 10 }}>foto</div>
      <div className="h-card">{index + 1}. {a.naam}</div>
      {a.beschrijving && <p className="muted" style={{ margin: '6px 0 8px' }}>{a.beschrijving}</p>}
      <div className="meta">
        {a.locatie_wijk && <span className="chip">{META_ICON.wijk} {a.locatie_wijk}</span>}
        {a.tijdstip && <span className="chip">{META_ICON.tijd} {a.tijdstip}</span>}
        {a.kosten && <span className="chip">{META_ICON.kosten} {a.kosten}</span>}
        {a.individueel_of_groep && <span className="chip">{a.individueel_of_groep}</span>}
      </div>
      <div className="check-row" role="checkbox" aria-checked={selected} tabIndex={0}
        style={{ marginTop: 12, paddingTop: 10, borderTop: '1.2px dashed var(--ink-3)' }}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle() } }}>
        <span className={`box-check${selected ? ' on' : ''}`} aria-hidden="true">{selected ? '✓' : ''}</span>
        <span>Laat deze aanbieder contact opnemen</span>
      </div>
    </div>
  )
}

// items: array of { label, value? } — value is shown bold. Rendered as plain
// React nodes (no innerHTML) since reasoning is derived from the user's own answers.
export function Reasoning({ items, title = 'Waarom past dit bij jou?' }) {
  if (!items || !items.length) return null
  return (
    <div className="reasoning" style={{ marginTop: 16 }}>
      <div className="lbl">{title}</div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it.label}{it.value != null && <> <strong>{it.value}</strong></>}</li>
        ))}
      </ul>
    </div>
  )
}
