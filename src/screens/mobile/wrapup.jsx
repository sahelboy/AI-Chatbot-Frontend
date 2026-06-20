import { MobileShell } from './MobileShell.jsx'
import { Kicker, Head, PillarIcon, ChoiceGroup, TextField } from '../../components/ui.jsx'
import { allDoneProgress } from '../nav.jsx'
import { PILLARS, scoreColor, lowestMiddel } from '../../data/leefstijl.js'

export function MSummaryScreen({ state, dispatch, chrome }) {
  const low = lowestMiddel(state.middelen)
  const rows = [
    ...PILLARS.filter((p) => p.key !== 'middelen').map((p) => ({ key: p.key, name: p.label, n: state.scores[p.key] ?? 50 })),
    { key: 'middelen', name: `Middelen — laagste: ${low.naam}`, n: low.score },
  ]
  return (
    <MobileShell {...chrome} progress={allDoneProgress()}
      header={<><Kicker>Samenvatting</Kicker><Head>Klopt dit?</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'NEXT' })}>Klopt — zoek activiteiten →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>Iets aanpassen</button>
        </>
      }>
      <div className="col" style={{ gap: 6 }}>
        {rows.map((r) => (
          <div key={r.key} className="box" style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '28px 1fr 70px', alignItems: 'center', gap: 8 }}>
            <PillarIcon pillar={r.key} size={24} />
            <div><strong>{r.name}</strong></div>
            <div className="scorebar" role="img" aria-label={`${r.name}: ${r.n} van 100`}>
              <span style={{ right: `${100 - r.n}%`, background: scoreColor(r.n) }} />
            </div>
          </div>
        ))}
        <p className="muted" style={{ margin: '2px 0 0' }}>
          Kleur: <span style={{ color: '#e2604a', fontWeight: 700 }}>rood</span> = lage score, <span style={{ color: '#5a9e2f', fontWeight: 700 }}>groen</span> = hoge.
        </p>
      </div>
    </MobileShell>
  )
}

export function MTopicScreen({ state, dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Nog een paar dingen</Kicker><Head>Welk onderwerp is nú het belangrijkst voor je?</Head></>}
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
      <div className="col" style={{ gap: 8 }}>
        {PILLARS.map((p) => {
          const sel = state.topic === p.key
          return (
            <button type="button" key={p.key} className={`btn${sel ? ' primary' : ''}`} aria-pressed={sel}
              style={{ justifyContent: 'flex-start', borderRadius: 10, padding: '12px 14px', width: '100%' }}
              onClick={() => dispatch({ type: 'SET_TOPIC', value: p.key })}>
              <PillarIcon pillar={p.key} size={22} /><span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </MobileShell>
  )
}

export function MProfileScreen({ state, dispatch, chrome }) {
  const set = (field) => (value) => dispatch({ type: 'SET_PROFILE', field, value })
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Voor betere matches</Kicker><Head>Een paar laatste vragen</Head></>}
      footer={
        <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
          onClick={() => dispatch({ type: 'NEXT' })}>Zoek mijn activiteiten →</button>
      }>
      <div className="col" style={{ gap: 14 }}>
        <TextField id="m-leeftijd" label="Leeftijd" inputMode="numeric" maxLength={3}
          placeholder="niet verplicht om in te vullen" value={state.profile.leeftijd} onChange={set('leeftijd')} />
        <TextField id="m-postcode" label="Postcode (voor reisafstand)" inputMode="numeric" maxLength={4}
          placeholder="4 cijfers, niet verplicht" value={state.profile.postcode} onChange={set('postcode')} />
        <ChoiceGroup label="Gender" options={['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet']}
          value={state.profile.gender} onChange={set('gender')} />
        {/* F-06: only relevant outside the precies path, where preferences are gathered. */}
        {state.entryType !== 'precies' && (
          <div className="box dashed">
            <ChoiceGroup label="Mag ik rekening houden met…?"
              options={['Mijn voorkeuren', 'Mijn belemmeringen', 'Allebei', 'Nee, hoeft niet']}
              value={state.profile.rekening} onChange={set('rekening')} />
          </div>
        )}
        <p className="muted" style={{ margin: 0 }}>Leeftijd en postcode zijn optioneel.</p>
      </div>
    </MobileShell>
  )
}
