import { PILLARS } from '../data/leefstijl.js'

// Footer navigation used across wizard screens (Vorige / Skip / Volgende).
export function FooterNav({
  onBack, onSkip, onNext,
  nextLabel = 'Volgende →', backLabel = '← Vorige', skipLabel = 'Sla deze vraag over',
  nextDisabled, note, hideBack,
}) {
  return (
    <>
      {hideBack ? <span /> : <button type="button" className="btn ghost" onClick={onBack}>{backLabel}</button>}
      <div className="row wrap" style={{ gap: 10 }}>
        {note && <span className="muted">{note}</span>}
        {onSkip && <button type="button" className="btn ghost" onClick={onSkip}>{skipLabel}</button>}
        <button type="button" className="btn primary" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>
      </div>
    </>
  )
}

// Pillar progress dots for the Shell header.
export function progressFor(activeKey) {
  const activeIdx = PILLARS.findIndex((p) => p.key === activeKey)
  return PILLARS.map((p, i) => ({
    pillar: p.key, label: p.label,
    state: activeIdx === -1 ? '' : i < activeIdx ? 'done' : i === activeIdx ? 'active' : '',
  }))
}

export const allDoneProgress = () => PILLARS.map((p) => ({ pillar: p.key, label: p.label, state: 'done' }))
