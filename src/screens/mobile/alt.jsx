import { MobileShell } from './MobileShell.jsx'
import { Kicker, Head } from '../../components/ui.jsx'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Bibliotheek+Boxtel+Burgakker+4+Boxtel'

const CRISIS_LINES = [
  { title: 'Direct medische hulp', num: '112', tel: 'tel:112', sub: 'bij direct levensgevaar' },
  { title: 'Zelfmoordpreventie', num: '113', tel: 'tel:0900-0113', sub: 'of chat via 113.nl — 24/7' },
  { title: 'Veilig Thuis', num: '0800-2000', tel: 'tel:0800-2000', sub: 'bij geweld of zorgen om iemand' },
]

// F-01 / F-05: concise static crisis copy (no backend referral paragraph).
export function MCrisisScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome} chromeBar={false} hideReset
      footer={
        <>
          <a className="btn primary block" href="tel:0900-0113"
            style={{ justifyContent: 'center', textDecoration: 'none', background: '#8a2727', borderColor: '#8a2727' }}>Bel 113 nu</a>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'RESET' })}>Sluit gesprek</button>
        </>
      }>
      <div className="col" style={{ gap: 8 }}>
        <div className="crisis" style={{ padding: '12px 14px' }}>
          <Head>Wat fijn dat je het deelt.</Head>
          <p style={{ margin: '4px 0 0', color: '#3a1a1a' }}>Praat met iemand. Je kunt 24 uur per dag bellen of chatten met:</p>
        </div>
        {CRISIS_LINES.map((c) => (
          <a key={c.num} className="box" href={c.tel}
            style={{ borderColor: '#8a2727', background: '#fff', textDecoration: 'none', color: 'inherit', display: 'block', padding: '10px 14px' }}>
            <strong>{c.title}</strong>
            <div className="h-display" style={{ color: '#8a2727', margin: '2px 0 0', lineHeight: 1.05 }}>{c.num}</div>
            <div className="muted">{c.sub}</div>
          </a>
        ))}
        <p className="muted" style={{ textAlign: 'center', margin: 0, color: '#5a1a1a' }}>Padvinder is geen hulpverlener. Bovenstaande mensen wel.</p>
      </div>
    </MobileShell>
  )
}

// F-02: skip confirmation interstitial.
export function MSkippedScreen({ state, dispatch, chrome }) {
  return (
    <MobileShell {...chrome} center
      header={<><Kicker>Vraag overgeslagen</Kicker><Head>Je hebt deze vraag overgeslagen</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'CONFIRM_SKIP' })}>Ga verder →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'GOTO_STEP', stepId: state.stepId })}>← Toch beantwoorden</button>
        </>
      }>
      <div className="box">
        <p style={{ margin: 0 }}>
          Dat mag altijd. Houd er wel rekening mee: hoe minder je invult, hoe <strong>kleiner de kans</strong> dat we activiteiten vinden die echt bij je passen. Je kunt deze vraag later alsnog beantwoorden.
        </p>
      </div>
    </MobileShell>
  )
}

export function MLowScoreScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome} chromeBar={false} hideReset center
      footer={
        <button type="button" className="btn primary block" style={{ justifyContent: 'center', background: '#8a2727', borderColor: '#8a2727' }}
          onClick={() => dispatch({ type: 'RESET' })}>Sluit gesprek</button>
      }>
      <div className="col" style={{ gap: 8 }}>
        <div className="crisis" style={{ padding: '12px 14px' }}>
          <Kicker style={{ color: '#a23b22' }}>Even iets belangrijks</Kicker>
          <Head>Het gaat nu even niet goed met je</Head>
          <p style={{ margin: '6px 0 0', color: '#3a1a1a' }}>
            Je gaf op alle onderwerpen een lage score. Dat kan een teken zijn dat er echt iets aan de hand is. Is er geen noodsituatie? Neem dan contact op met je <strong>huisarts</strong>. Die kan met je meedenken.
          </p>
        </div>
        <div className="box" style={{ background: '#fff', borderColor: '#8a2727' }}>
          <p style={{ margin: 0, color: '#3a1a1a' }}>
            <strong>Padvinder is geen medische hulpverlener.</strong> Voor je gezondheid is je huisarts de juiste plek.
          </p>
        </div>
        <p className="muted" style={{ margin: 0, color: '#5a1a1a' }}>Direct gevaar? Bel <strong>112</strong>.</p>
      </div>
    </MobileShell>
  )
}

export function MNoMatchScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Geen passende match</Kicker><Head>Geen zorgen — we helpen je verder</Head></>}>
      <div className="col" style={{ gap: 10 }}>
        <div className="box accent">
          <div className="h-card" style={{ marginBottom: 4 }}>Kom langs bij een inloop</div>
          <p style={{ margin: 0 }}>Samen kijken we wat er wél past. Dit heeft onze voorkeur.</p>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center', marginTop: 10 }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'inloop' })}>Toon inlooplocatie</button>
        </div>
        <div className="box">
          <div className="h-card" style={{ marginBottom: 4 }}>Laat ons contact opnemen</div>
          <p style={{ margin: 0 }}>We bellen of mailen je op een werkdag om mee te denken.</p>
          <button type="button" className="btn block" style={{ justifyContent: 'center', marginTop: 10 }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'contact' })}>Neem contact met mij op</button>
        </div>
      </div>
    </MobileShell>
  )
}

export function MInloopScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Inlooplocatie</Kicker><Head>De Inloop — Zelfregiecentrum Boxtel</Head></>}
      footer={
        <>
          <a className="btn primary block" href={MAPS_URL} target="_blank" rel="noopener noreferrer"
            style={{ justifyContent: 'center', textDecoration: 'none' }}>Open in Google Maps →</a>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK_SCREEN' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        <p style={{ margin: 0 }}>
          Een warme plek voor en door inwoners van Boxtel, Esch, Lennisheuvel en Liempde. Vind een luisterend oor en schuif aan voor een kop koffie of thee. Je hoeft je niet aan te melden — loop gewoon binnen.
        </p>
        <div className="box accent">
          <div className="h-card" style={{ marginBottom: 4 }}>🕐 Openingstijden</div>
          <p style={{ margin: 0 }}>Elke zaterdag van <strong>11:00 tot 14:00 uur</strong>. Gratis toegang.</p>
        </div>
        <div className="box">
          <div className="h-card" style={{ marginBottom: 4 }}>📍 Adres</div>
          <p style={{ margin: 0 }}>Bibliotheek Boxtel (1e etage)<br />Burgakker 4, Boxtel</p>
        </div>
      </div>
    </MobileShell>
  )
}
