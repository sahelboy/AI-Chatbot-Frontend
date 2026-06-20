import { useState } from 'react'
import { Shell, Kicker, Head, PillarIcon, TextArea } from '../components/ui.jsx'
import Slider from '../components/Slider.jsx'
import { FooterNav, progressFor } from './nav.jsx'
import { PILLARS, PILLAR_LABEL, MIDDELEN, lowestMiddel } from '../data/leefstijl.js'
import { QUESTIONS } from '../state/flow.js'
import { QuestionField } from '../components/questions.jsx'
import { streamChat } from '../lib/apiClient.js'

const SLIDER_HINT = 'Beweeg de cirkel met je muis naar de gewenste waarde tussen 0 en 100. Of typ de waarde in de cirkel en bevestig met Enter. Of gebruik de pijltoetsen ↑ en ↓.'

const PILLAR_INDEX = Object.fromEntries(PILLARS.map((p, i) => [p.key, i]))

export function SliderScreen({ state, dispatch, chrome, pillar }) {
  const cfg = PILLARS.find((p) => p.key === pillar)
  const idx = PILLAR_INDEX[pillar]
  const score = state.scores[pillar] ?? 50
  return (
    <Shell {...chrome} progress={progressFor(pillar)}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })}
        onSkip={() => dispatch({ type: 'SKIP' })} onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w760">
        <Kicker><PillarIcon pillar={pillar} size={22} /> {cfg.label} — vraag {idx + 1} / 6</Kicker>
        <Head>{cfg.question}</Head>
        {cfg.guide && <p className="muted" style={{ marginTop: 0 }}>{cfg.guide}</p>}
        <p style={{ marginTop: 0, marginBottom: 20 }}>{SLIDER_HINT}</p>
        <div className="box" style={{ padding: '30px 28px 18px' }}>
          <Slider score={score} ariaLabel={`${cfg.label}: ${cfg.question}`}
            onChange={(v) => dispatch({ type: 'SET_SCORE', pillar, value: v })} />
        </div>
      </div>
    </Shell>
  )
}

export function MiddelenScreen({ state, dispatch, chrome }) {
  const low = lowestMiddel(state.middelen)
  // Only name a specific middel once the user has moved a slider off the
  // default; otherwise all four are equal and "laagste" would arbitrarily pick
  // the first one (Roken).
  const touched = Object.values(state.middelen).some((v) => v !== 50)
  return (
    <Shell {...chrome} progress={progressFor('middelen')}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })}
        onSkip={() => dispatch({ type: 'SKIP' })} onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w860">
        <Kicker><PillarIcon pillar="middelen" size={22} /> Middelen — vraag 6 / 6</Kicker>
        <Head>Hoe vaak gebruik je deze middelen?</Head>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Zet per middel de cirkel op de waarde die het beste past: <strong>0 = heel vaak</strong>, <strong>100 = nooit</strong>. Beweeg de cirkel, typ de waarde, of gebruik de pijltoetsen ↑ en ↓.
        </p>
        <div className="col" style={{ gap: 12 }}>
          {MIDDELEN.map((m) => (
            <div key={m.naam} className="box" style={{ padding: '12px 20px' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div className="h-card">{m.naam}</div>
                <span className="muted">{m.richtlijn}</span>
              </div>
              <Slider score={state.middelen[m.naam] ?? 50} ariaLabel={`${m.naam}: hoe vaak gebruik je dit`}
                leftLabel="heel vaak" rightLabel="nooit" leftFace="" rightFace=""
                onChange={(v) => dispatch({ type: 'SET_MIDDEL', naam: m.naam, value: v })} />
            </div>
          ))}
        </div>
        <div className="box accent" style={{ marginTop: 14 }}>
          <p style={{ margin: 0 }}>
            {touched
              ? <>Het middel met de <strong>laagste waarde</strong> ({low.naam}) nemen we mee naar je resultaten.</>
              : <>Zodra je de cirkels verschuift, nemen we het middel met de <strong>laagste waarde</strong> mee naar je resultaten.</>}
          </p>
        </div>
      </div>
    </Shell>
  )
}

export const VRAGEN_HEAD = {
  bewegen: 'Wat past het best bij jou?',
  voeding: 'Een paar vragen over eten',
  ontspanning: 'Wat past het beste bij jou?',
  verbinding: 'Wat past het beste bij jou?',
  slaap: 'Wat past het beste bij jou?',
  middelen: 'Een paar vragen over middelen',
}

export function VragenScreen({ state, dispatch, chrome, pillar }) {
  const qs = QUESTIONS[pillar] || []
  const progress = state.entryType === 'nog_niet' ? progressFor(pillar) : null
  return (
    <Shell {...chrome} progress={progress}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })}
        onSkip={() => dispatch({ type: 'SKIP' })} onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w760">
        <Kicker><PillarIcon pillar={pillar} size={22} /> {PILLAR_LABEL[pillar]} — vervolgvragen</Kicker>
        <Head>{VRAGEN_HEAD[pillar] || 'Een paar vragen'}</Head>
        <div className="col" style={{ gap: 18 }}>
          {qs.filter((q) => !q.showIf || q.showIf(state.answers)).map((q) => (
            <QuestionField key={q.id} q={q} answers={state.answers} dispatch={dispatch} />
          ))}
        </div>
      </div>
    </Shell>
  )
}

export function PillarChoiceScreen({ state, dispatch, chrome }) {
  return (
    <Shell {...chrome}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })} note="Kies 1 of 2 onderwerpen die nu spelen"
        nextDisabled={state.chosenPillars.length === 0} onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w860">
        <Kicker>Een paar gerichte vragen</Kicker>
        <Head>Welke onderwerpen spelen nu?</Head>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>Kies 1 of 2 onderwerpen. Daarover stellen we een paar vragen.</p>
        <div className="grid-3">
          {PILLARS.map((p) => {
            const sel = state.chosenPillars.includes(p.key)
            return (
              <button type="button" key={p.key} className={`btn${sel ? ' primary' : ''}`} aria-pressed={sel}
                style={{ justifyContent: 'flex-start', borderRadius: 12, padding: '16px 18px' }}
                onClick={() => dispatch({ type: 'TOGGLE_PILLAR', key: p.key })}>
                <span className={`box-check${sel ? ' on' : ''}`} aria-hidden="true">{sel ? '✓' : ''}</span>
                <PillarIcon pillar={p.key} size={24} /><span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}

export function DirectQueryScreen({ state, dispatch, chrome }) {
  const [busy, setBusy] = useState(false)
  const switchToFull = () => { dispatch({ type: 'SET_ENTRY', value: 'nog_niet' }); dispatch({ type: 'GOTO_STEP', stepId: 'slider_bewegen' }) }
  // Crisis is detected server-side at the matching step, which in the precies
  // path sits behind the profile screen. To catch a crisis phrase typed here
  // immediately (F-05), run the same backend check on submit: it short-circuits
  // to a single crisis event with no LLM call. Abort as soon as we know.
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
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={switchToFull}>Liever toch het hele gesprek</button>
          <button type="button" className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Zoek meteen →'}</button>
        </>
      }>
      <div className="container w760">
        <Kicker>Direct zoeken</Kicker>
        <Head>Waar ben je naar op zoek?</Head>
        <p className="muted" style={{ marginTop: 0 }}>Typ het hieronder in. We zoeken er meteen activiteiten bij.</p>
        <TextArea id="direct" value={state.directQuery} onChange={(v) => dispatch({ type: 'SET_DIRECT', value: v })} />
      </div>
    </Shell>
  )
}
