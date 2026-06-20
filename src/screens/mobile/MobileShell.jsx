import { useEffect, useRef } from 'react'
import logo from '../../assets/padvinder-logo.png'
import { PillarIcon } from '../../components/ui.jsx'

/* Mobile app frame. The real device IS the phone, so unlike the design's
   mockup `M` wrapper there is no fake bezel or status bar — this fills the
   viewport. Header (logo + A+/reset), optional pillar progress dots,
   scrollable body, and a stacked full-width footer.
   Reuses the production padvinder.css classes; .mshell* adds only layout. */
export function MobileShell({
  children, footer, header, progress,
  center, scroll = true, hideReset, chromeBar = true, overlay,
  bigText, onToggleText, onReset,
}) {
  // Move focus to the heading on mount so each new screen is announced. The
  // heading can sit in the header (most screens) or in the body (welcome,
  // crisis), so query from the shell root, not just <main>.
  const rootRef = useRef(null)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const target = el.querySelector('h1') || el
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])

  return (
    <div className="mshell wf" ref={rootRef}>
      {chromeBar && (
        <header className="mshell__top">
          <span className="logo"><img src={logo} alt="" aria-hidden="true" /> Sociaal Knooppunt</span>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="btn ghost" style={{ minHeight: 34, padding: '2px 11px' }}
              aria-pressed={bigText} onClick={onToggleText}>A+</button>
            {!hideReset && (
              <button type="button" className="btn ghost" style={{ minHeight: 34, padding: '2px 11px' }}
                aria-label="Opnieuw beginnen" onClick={onReset}>↻</button>
            )}
          </div>
        </header>
      )}

      {progress && (
        <div className="mshell__progress">
          <ol className="pillars-row" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {progress.map(({ pillar, label, state }) => (
              <li key={pillar} className={`pillar-dot ${state}`} aria-label={label}>
                <PillarIcon pillar={pillar} size={22} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {header && <div className="mshell__head">{header}</div>}

      <main className={`mshell__body${center ? ' center' : ''}`}
        style={{ overflowY: scroll ? 'auto' : 'hidden' }}>
        {children}
      </main>

      {footer && <footer className="mshell__foot">{footer}</footer>}
      {overlay}
    </div>
  )
}
