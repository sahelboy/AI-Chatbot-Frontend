import { useEffect, useRef, useState } from 'react'
import logo from '../assets/padvinder-logo.png'
import { PILLAR_ICONS, TEXT_MAXLEN, GHOST } from '../data/leefstijl.js'

export function Avatar({ size = 40 }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <img src={logo} alt="Padvinder" />
    </span>
  )
}

export function PillarIcon({ pillar, size = 24, style }) {
  return <img src={PILLAR_ICONS[pillar]} alt="" aria-hidden="true"
    style={{ width: size, height: size, objectFit: 'contain', verticalAlign: 'middle', ...style }} />
}

export const Kicker = ({ children }) => <div className="kicker">{children}</div>
export const Head = ({ children, xl }) => <h1 className={`h-display${xl ? ' xl' : ''}`}>{children}</h1>

export function Typing() {
  return (
    <span className="typing" role="status" aria-label="Padvinder is aan het typen">
      <span></span><span></span><span></span>
    </span>
  )
}

/* App frame: top bar (org + anoniem + A+ + reset), optional pillar progress, body, footer. */
export function Shell({ children, footer, progress, hideReset, center, bigText, onToggleText, onReset }) {
  // On each screen mount, move focus to the heading so keyboard/screenreader
  // users are announced the new screen (App remounts this per step).
  const mainRef = useRef(null)
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const target = el.querySelector('h1') || el
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])
  return (
    <div className="shell wf">
      <header className="shell__top">
        <span className="logo"><img src={logo} alt="" aria-hidden="true" /> Sociaal Knooppunt</span>
        <div className="row wrap" style={{ gap: 8 }}>
          <span className="chip info">🔒 Anoniem gesprek</span>
          <button type="button" className="btn ghost" style={{ minHeight: 38, padding: '4px 12px' }}
            aria-pressed={bigText} onClick={onToggleText}>A+ tekst groter</button>
          {!hideReset && (
            <button type="button" className="btn ghost" style={{ minHeight: 38, padding: '4px 12px' }}
              onClick={onReset}>↻ Opnieuw</button>
          )}
        </div>
      </header>

      {progress && (
        <div className="shell__progress">
          <div className="kicker" style={{ marginBottom: 8 }}>Voortgang · 6 onderwerpen</div>
          <ol className="pillars-row" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {progress.map(({ pillar, label, state }) => (
              <li key={pillar} className="pillar-item">
                <span className={`pillar-dot ${state}`}><PillarIcon pillar={pillar} size={30} /></span>
                <span className="muted">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <main ref={mainRef} className={`shell__body${center ? ' center' : ''}`}>{children}</main>

      {footer && <footer className="shell__foot">{footer}</footer>}
    </div>
  )
}

/* Single-select choice button. variant 'choice' = full-width radio row; 'pill' = inline button. */
export function Choice({ selected, onSelect, children, variant = 'pill', value }) {
  const cls = variant === 'choice' ? 'btn choice' : 'btn'
  return (
    <button type="button" className={`${cls}${selected ? (variant === 'choice' ? ' sel' : ' primary') : ''}`}
      aria-pressed={selected} onClick={() => onSelect(value)}>
      {variant === 'choice' && <span className="dot" aria-hidden="true"></span>}
      {children}
    </button>
  )
}

/* A labelled group of single-select options (stacked vertically per Carla's feedback). */
export function ChoiceGroup({ label, hint, options, value, onChange, layout = 'row' }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      {label && <legend className="h-card" style={{ marginBottom: 8, padding: 0 }}>{label}</legend>}
      {hint && <p className="muted" style={{ marginTop: -4, marginBottom: 10 }}>{hint}</p>}
      <div className={layout === 'col' ? 'choice-list' : 'opt-row'}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value
          const lbl = typeof o === 'string' ? o : o.label
          const sel = value === v
          return layout === 'col' ? (
            <Choice key={v} variant="choice" value={v} selected={sel} onSelect={onChange}>
              <span style={{ flex: 1 }}>{lbl}</span>
            </Choice>
          ) : (
            <button type="button" key={v} className={`btn${sel ? ' primary' : ''}`}
              aria-pressed={sel} onClick={() => onChange(v)}>{lbl}</button>
          )
        })}
      </div>
    </fieldset>
  )
}

/* Multi-select checkbox group. */
export function CheckRow({ checked, onToggle, children }) {
  return (
    <div className="check-row" role="checkbox" aria-checked={checked} tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle() } }}>
      <span className={`box-check${checked ? ' on' : ''}`} aria-hidden="true">{checked ? '✓' : ''}</span>
      <span>{children}</span>
    </div>
  )
}

/* Free-text input with character limit + counter + B1 ghost. */
export function TextArea({ value, onChange, label, placeholder = GHOST, maxLength = TEXT_MAXLEN, id }) {
  return (
    <div>
      {label && <label className="h-card" htmlFor={id} style={{ display: 'block', marginBottom: 8 }}>{label}</label>}
      <textarea id={id} className="input" value={value} placeholder={placeholder}
        maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
      <div className="counter">{value.length} / {maxLength}</div>
    </div>
  )
}

export function TextField({ value, onChange, label, placeholder, id, inputMode, maxLength, hint }) {
  return (
    <div>
      {label && <label className="h-card" htmlFor={id} style={{ display: 'block', marginBottom: 6 }}>{label}</label>}
      <input id={id} className="input" type="text" value={value} placeholder={placeholder}
        inputMode={inputMode} maxLength={maxLength} style={{ maxWidth: 320 }}
        onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="muted" style={{ margin: '6px 0 0' }}>{hint}</p>}
    </div>
  )
}

/* "Wat is Padvinder?" info modal (from the disclaimer Carla supplied). */
export function InfoModal({ onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (opener && opener.focus) opener.focus()
    }
  }, [onClose])
  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Wat is Padvinder?" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 6 }}>
          <h2 className="h-display" style={{ margin: 0 }}>Wat is Padvinder?</h2>
          <button ref={closeRef} className="btn ghost" style={{ minHeight: 38 }} onClick={onClose}>✕ Sluiten</button>
        </div>
        <p>Padvinder is de chatbot van Stichting Sociaal Knooppunt: de digitale gids voor een fijn en gezond leven in onze gemeente. Samen met jou zoek ik naar lokale activiteiten of ondersteuning die écht bij je passen.</p>
        <p>We zoeken 3 lokale activiteiten of vormen van ondersteuning die het beste passen bij jouw wensen en mogelijkheden. Padvinder gebruikt daarvoor algemene leefstijlinformatie en de pijlers van het Leefstijlroer van ©Vereniging Arts en Leefstijl.</p>
        <div className="box accent" style={{ marginTop: 8 }}>
          <div className="h-card" style={{ marginBottom: 4 }}>We stellen GEEN diagnose en geven GEEN medisch advies</div>
          <p style={{ margin: 0 }}>Padvinder is een informatiebron, geen medisch hulpmiddel. De informatie vervangt nooit de blik van een arts of andere zorgverlener.</p>
        </div>
        <div className="box" style={{ marginTop: 12 }}>
          <div className="h-card" style={{ marginBottom: 4 }}>Bel altijd je huisarts bij medische vragen</div>
          <p style={{ margin: 0 }}>Heb je medische vragen, gezondheidsklachten of psychische problemen? Neem dan altijd contact op met je huisarts of een andere passende zorgverlener. Doe dat ook als je twijfelt over je gezondheid.</p>
        </div>
        <div className="box" style={{ marginTop: 12 }}>
          <div className="h-card" style={{ marginBottom: 4 }}>Eigen risico en privacy</div>
          <p style={{ margin: '0 0 6px' }}>Meedoen aan adviezen of activiteiten is voor je eigen risico.</p>
          <p style={{ margin: 0 }}>Je gegevens worden veilig verwerkt (AVG). Persoonsgegevens die per ongeluk worden gedeeld, halen we automatisch uit de berichten. Deel via Padvinder geen gevoelige gegevens, zoals je BSN of medisch dossier.</p>
        </div>
      </div>
    </div>
  )
}
