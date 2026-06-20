import { Shell, Kicker, Head, PillarIcon, ChoiceGroup, TextField } from '../components/ui.jsx'
import { FooterNav, progressFor, allDoneProgress } from './nav.jsx'
import { PILLARS, scoreColor, lowestMiddel } from '../data/leefstijl.js'

const band = (n) => (n < 40 ? 'laag' : n < 70 ? 'gemiddeld' : 'hoog')

export function SummaryScreen({ state, dispatch, chrome }) {
  const low = lowestMiddel(state.middelen)
  const rows = [
    ...PILLARS.filter((p) => p.key !== 'middelen').map((p) => ({ key: p.key, name: p.label, n: state.scores[p.key] ?? 50 })),
    { key: 'middelen', name: `Middelen — laagste: ${low.naam}`, n: low.score },
  ]
  return (
    <Shell {...chrome} progress={allDoneProgress()}
      footer={<FooterNav backLabel="Iets aanpassen" onBack={() => dispatch({ type: 'BACK' })}
        nextLabel="Klopt — zoek mijn activiteiten →" onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w900">
        <Kicker>Samenvatting</Kicker>
        <Head>Klopt dit allemaal?</Head>
        <div className="box shadow" style={{ padding: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r.key} style={{ display: 'grid', gridTemplateColumns: '40px 1fr minmax(120px, 220px) 70px', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1.2px dashed var(--ink-3)' : 'none' }}>
              <PillarIcon pillar={r.key} size={30} />
              <div><strong>{r.name}</strong> <span className="muted">· {band(r.n)}</span></div>
              <div className="scorebar" role="img" aria-label={`${r.name}: ${r.n} van 100, ${band(r.n)}`}><span style={{ right: `${100 - r.n}%`, background: scoreColor(r.n) }} /></div>
              <div className="row" style={{ justifyContent: 'flex-end' }}><strong>{r.n}</strong><span className="muted" style={{ marginLeft: 4 }}>/100</span></div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          De kleur laat zien hoe je op een onderwerp staat: <span style={{ color: '#e2604a', fontWeight: 700 }}>rood</span> is een lage score, <span style={{ color: '#5a9e2f', fontWeight: 700 }}>groen</span> een hoge.
        </p>
      </div>
    </Shell>
  )
}

export function TopicScreen({ state, dispatch, chrome }) {
  return (
    <Shell {...chrome}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })} note="Hiermee bepalen we de volgorde van de suggesties"
        onSkip={() => dispatch({ type: 'SKIP' })} onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w860">
        <Kicker>Nog een paar dingen</Kicker>
        <Head>Welk onderwerp is nú het belangrijkst voor je?</Head>
        <div className="grid-3">
          {PILLARS.map((p) => {
            const sel = state.topic === p.key
            return (
              <button type="button" key={p.key} className={`btn${sel ? ' primary' : ''}`} aria-pressed={sel}
                style={{ justifyContent: 'flex-start', borderRadius: 12, padding: '16px 18px' }}
                onClick={() => dispatch({ type: 'SET_TOPIC', value: p.key })}>
                <PillarIcon pillar={p.key} size={24} /><span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}

export function ProfileScreen({ state, dispatch, chrome }) {
  const set = (field) => (value) => dispatch({ type: 'SET_PROFILE', field, value })
  return (
    <Shell {...chrome}
      footer={<FooterNav onBack={() => dispatch({ type: 'BACK' })} note="Leeftijd en postcode zijn optioneel"
        nextLabel="Zoek mijn activiteiten →" onNext={() => dispatch({ type: 'NEXT' })} />}>
      <div className="container w760">
        <Kicker>Voor betere matches</Kicker>
        <Head>Een paar laatste vragen</Head>
        <div className="col" style={{ gap: 18 }}>
          <TextField id="leeftijd" label="Leeftijd" inputMode="numeric" maxLength={3}
            placeholder="niet verplicht om in te vullen" value={state.profile.leeftijd} onChange={set('leeftijd')} />
          <TextField id="postcode" label="Postcode (voor reisafstand)" inputMode="numeric" maxLength={4}
            placeholder="4 cijfers, niet verplicht" value={state.profile.postcode} onChange={set('postcode')} />
          <ChoiceGroup label="Gender" options={['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet']}
            value={state.profile.gender} onChange={set('gender')} />
          {/* In the precies path no voorkeuren/belemmeringen were gathered, so
              this question would have nothing to act on (F-06). */}
          {state.entryType !== 'precies' && (
            <div className="box dashed">
              <ChoiceGroup label="Mag ik rekening houden met…?"
                options={['Mijn voorkeuren', 'Mijn belemmeringen', 'Allebei', 'Nee, hoeft niet']}
                value={state.profile.rekening} onChange={set('rekening')} />
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
