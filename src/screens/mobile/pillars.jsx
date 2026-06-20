import { useState } from 'react'
import { MobileShell } from './MobileShell.jsx'
import { Kicker, Head, PillarIcon, TextArea } from '../../components/ui.jsx'
import Slider from '../../components/Slider.jsx'
import { QuestionField } from '../../components/questions.jsx'
import { progressFor } from '../nav.jsx'
import { PILLARS, PILLAR_LABEL, MIDDELEN, lowestMiddel } from '../../data/leefstijl.js'
import { QUESTIONS } from '../../state/flow.js'
import { VRAGEN_HEAD } from '../pillars.jsx'
import { streamChat } from '../../lib/apiClient.js'

// Touch-only hint: no mouse, no arrow keys (neither exists on a phone).
const SLIDER_HINT = 'Sleep de cirkel naar de gewenste waarde, of typ de waarde in de cirkel.'

export function MSliderScreen({ state, dispatch, chrome, pillar }) {
  const cfg = PILLARS.find((p) => p.key === pillar)
  const idx = PILLARS.findIndex((p) => p.key === pillar)
  const score = state.scores[pillar] ?? 50
  return (
    <MobileShell {...chrome} progress={progressFor(pillar)}
      header={
        <>
          <Kicker><PillarIcon pillar={pillar} size={18} /> {cfg.label} · {idx + 1} / 6</Kicker>
          <Head>{cfg.question}</Head>
          {cfg.guide && <p className="muted" style={{ margin: '6px 0 0' }}>{cfg.guide}</p>}
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'NEXT' })}>Bevestig →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'SKIP' })}>Sla deze vraag over</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 12 }}>
        <p className="muted" style={{ margin: 0 }}>{SLIDER_HINT}</p>
        <div className="box" style={{ padding: '22px 14px 14px' }}>
          <Slider score={score} ariaLabel={`${cfg.label}: ${cfg.question}`}
            onChange={(v) => dispatch({ type: 'SET_SCORE', pillar, value: v })} />
        </div>
      </div>
    </MobileShell>
  )
}

export function MMiddelenScreen({ state, dispatch, chrome }) {
  const low = lowestMiddel(state.middelen)
  const touched = Object.values(state.middelen).some((v) => v !== 50)
  return (
    <MobileShell {...chrome} progress={progressFor('middelen')}
      header={
        <>
          <Kicker><PillarIcon pillar="middelen" size={18} /> Middelen · 6 / 6</Kicker>
          <Head>Hoe vaak gebruik je deze middelen?</Head>
          <p className="muted" style={{ margin: '6px 0 0' }}>0 = heel vaak, 100 = nooit. Sleep of typ per middel de waarde.</p>
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'NEXT' })}>Bevestig →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'SKIP' })}>Sla deze vraag over</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        {MIDDELEN.map((m) => (
          <div key={m.naam} className="box" style={{ padding: '10px 14px' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <div className="h-card">{m.naam}</div>
              <span className="muted" style={{ fontSize: '13px' }}>{m.richtlijn}</span>
            </div>
            <Slider score={state.middelen[m.naam] ?? 50} ariaLabel={`${m.naam}: hoe vaak gebruik je dit`}
              leftLabel="heel vaak" rightLabel="nooit" leftFace="" rightFace=""
              onChange={(v) => dispatch({ type: 'SET_MIDDEL', naam: m.naam, value: v })} />
          </div>
        ))}
        <div className="box accent">
          <p style={{ margin: 0 }}>
            {touched
              ? <>Het middel met de <strong>laagste waarde</strong> ({low.naam}) nemen we mee naar je resultaten.</>
              : <>Zodra je de cirkels verschuift, nemen we het middel met de <strong>laagste waarde</strong> mee.</>}
          </p>
        </div>
      </div>
    </MobileShell>
  )
}

export function MVragenScreen({ state, dispatch, chrome, pillar }) {
  const qs = QUESTIONS[pillar] || []
  const progress = state.entryType === 'nog_niet' ? progressFor(pillar) : null
  return (
    <MobileShell {...chrome} progress={progress}
      header={
        <>
          <Kicker style={{ letterSpacing: 0 }}><PillarIcon pillar={pillar} size={18} /> {PILLAR_LABEL[pillar]} · vervolgvragen</Kicker>
          <Head>{VRAGEN_HEAD[pillar] || 'Een paar vragen'}</Head>
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'NEXT' })}>Volgende →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'SKIP' })}>Sla deze vraag over</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 16 }}>
        {qs.filter((q) => !q.showIf || q.showIf(state.answers)).map((q) => (
          <QuestionField key={q.id} q={q} answers={state.answers} dispatch={dispatch} />
        ))}
      </div>
    </MobileShell>
  )
}

export function MPillarChoiceScreen({ state, dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={
        <>
          <Kicker>Een paar gerichte vragen</Kicker>
          <Head>Welke onderwerpen spelen nu?</Head>
          <p className="muted" style={{ margin: '4px 0 0' }}>Kies 1 of 2 onderwerpen. Daarover stellen we een paar vragen.</p>
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            disabled={state.chosenPillars.length === 0} onClick={() => dispatch({ type: 'NEXT' })}>Volgende →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 8 }}>
        {PILLARS.map((p) => {
          const sel = state.chosenPillars.includes(p.key)
          return (
            <button type="button" key={p.key} className={`btn${sel ? ' primary' : ''}`} aria-pressed={sel}
              style={{ justifyContent: 'flex-start', borderRadius: 12, padding: '12px 14px', width: '100%' }}
              onClick={() => dispatch({ type: 'TOGGLE_PILLAR', key: p.key })}>
              <span className={`box-check${sel ? ' on' : ''}`} style={{ flexShrink: 0 }} aria-hidden="true">{sel ? '✓' : ''}</span>
              <PillarIcon pillar={p.key} size={22} /><span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </MobileShell>
  )
}

export function MDirectQueryScreen({ state, dispatch, chrome }) {
  const [busy, setBusy] = useState(false)
  const switchToFull = () => { dispatch({ type: 'SET_ENTRY', value: 'nog_niet' }); dispatch({ type: 'GOTO_STEP', stepId: 'slider_bewegen' }) }
  // F-05: same immediate crisis pre-check as the desktop direct-query screen.
  const submit = async () => {
    const q = state.directQuery.trim()
    if (!q) { dispatch({ type: 'NEXT' }); return }
    setBusy(true)
    const ctrl = new AbortController()
    let crisis = null
    try {
      await streamChat({
        messages: [{ role: 'user', text: q }], signal: ctrl.signal,
        callbacks: { onCrisis: (p) => { crisis = p; ctrl.abort() }, onActivities: () => ctrl.abort() },
      })
    } catch { /* AbortError after we have our answer is expected, not a failure */ }
    if (crisis) { dispatch({ type: 'MATCH_CRISIS', message: crisis.content }); return }
    setBusy(false)
    dispatch({ type: 'NEXT' })
  }
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Direct zoeken</Kicker><Head>Waar ben je naar op zoek?</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Zoek meteen →'}</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={switchToFull}>Liever toch het hele gesprek</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        <p className="muted" style={{ margin: 0 }}>Typ het hieronder in. We zoeken er meteen activiteiten bij.</p>
        <TextArea id="direct" value={state.directQuery}
          onChange={(v) => dispatch({ type: 'SET_DIRECT', value: v })} />
      </div>
    </MobileShell>
  )
}
