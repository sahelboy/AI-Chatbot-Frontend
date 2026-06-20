import { Shell, Kicker, Head } from '../components/ui.jsx'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Bibliotheek+Boxtel+Burgakker+4+Boxtel'

export function CrisisScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome} hideReset center
      footer={<><span /><button type="button" className="btn danger" onClick={() => dispatch({ type: 'RESET' })}>Sluit gesprek</button></>}>
      <div className="container w900">
        <div className="crisis">
          <Head>Wat fijn dat je het deelt.</Head>
          <p style={{ margin: '4px 0 0', color: '#3a1a1a' }}>
            Praat met iemand. Je kunt 24 uur per dag bellen of chatten met:
          </p>
          <div className="grid-3" style={{ marginTop: 14 }}>
            <a className="box" href="tel:112" style={{ background: '#fff', borderColor: '#8a2727', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <strong>Direct medische hulp</strong>
              <div className="h-display" style={{ color: '#8a2727', margin: '4px 0 0' }}>112</div>
              <div className="muted">bij direct levensgevaar</div>
            </a>
            <a className="box" href="tel:0900-0113" style={{ background: '#fff', borderColor: '#8a2727', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <strong>Zelfmoordpreventie</strong>
              <div className="h-display" style={{ color: '#8a2727', margin: '4px 0 0' }}>113</div>
              <div className="muted">of chat via 113.nl — 24/7</div>
            </a>
            <a className="box" href="tel:0800-2000" style={{ background: '#fff', borderColor: '#8a2727', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <strong>Veilig Thuis</strong>
              <div className="h-display" style={{ color: '#8a2727', margin: '4px 0 0' }}>0800-2000</div>
              <div className="muted">bij geweld of zorgen om iemand</div>
            </a>
          </div>
          <p style={{ marginTop: 14, marginBottom: 0, color: '#5a1a1a' }}>Padvinder is geen hulpverlener. Bovenstaande mensen wel.</p>
        </div>
      </div>
    </Shell>
  )
}

export function SkippedScreen({ state, dispatch, chrome }) {
  return (
    <Shell {...chrome} center
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'GOTO_STEP', stepId: state.stepId })}>← Toch beantwoorden</button>
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'CONFIRM_SKIP' })}>Ga verder →</button>
        </>
      }>
      <div className="container w760">
        <Kicker>Vraag overgeslagen</Kicker>
        <Head>Je hebt deze vraag overgeslagen</Head>
        <div className="box">
          <p style={{ margin: 0 }}>
            Dat mag altijd. Houd er wel rekening mee: hoe minder je invult, hoe <strong>kleiner de kans</strong> dat we activiteiten vinden die echt bij je passen. Je kunt deze vraag later alsnog beantwoorden.
          </p>
        </div>
      </div>
    </Shell>
  )
}

export function LowScoreScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome} hideReset center
      footer={<><span /><button type="button" className="btn danger" onClick={() => dispatch({ type: 'RESET' })}>Sluit gesprek</button></>}>
      <div className="container w860">
        <div className="crisis" style={{ padding: '24px 28px' }}>
          <Kicker>Even iets belangrijks</Kicker>
          <Head>Het lijkt erop dat het op dit moment niet goed met je gaat</Head>
          <p style={{ margin: '8px 0 0', color: '#3a1a1a' }}>
            Je gaf op alle onderwerpen een lage score. Dat kan een teken zijn dat er echt iets aan de hand is. Is er geen noodsituatie? Neem dan contact op met je <strong>huisarts</strong>. Die kan met je meedenken.
          </p>
          <div className="box" style={{ background: '#fff', borderColor: '#8a2727', marginTop: 14 }}>
            <p style={{ margin: 0, color: '#3a1a1a' }}>
              <strong>Padvinder is geen medische hulpverlener.</strong> Ik kan je wel helpen met lokale activiteiten en ondersteuning, maar voor je gezondheid is je huisarts de juiste plek.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function NoMatchScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome}
      footer={<><button type="button" className="btn ghost" onClick={() => dispatch({ type: 'RESET' })}>↻ Opnieuw beginnen</button><span /></>}>
      <div className="container w900">
        <Kicker>Geen passende match</Kicker>
        <Head>Geen zorgen — we helpen je verder</Head>
        <div className="grid-2">
          <div className="box accent">
            <div className="h-card" style={{ marginBottom: 6 }}>Kom langs bij een inloop</div>
            <p style={{ margin: 0 }}>Samen kijken we wat er wél past, op een plek bij jou in de buurt.</p>
            <button type="button" className="btn primary block" style={{ justifyContent: 'center', marginTop: 12 }}
              onClick={() => dispatch({ type: 'GOTO', screen: 'inloop' })}>Toon inlooplocatie</button>
          </div>
          <div className="box">
            <div className="h-card" style={{ marginBottom: 6 }}>Laat ons contact opnemen</div>
            <p style={{ margin: 0 }}>We bellen of mailen je op een werkdag om mee te denken.</p>
            <button type="button" className="btn block" style={{ justifyContent: 'center', marginTop: 12 }}
              onClick={() => dispatch({ type: 'GOTO', screen: 'contact' })}>Neem contact met mij op</button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function InloopScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'BACK_SCREEN' })}>← Terug</button>
          <a className="btn primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Open in Google Maps →</a>
        </>
      }>
      <div className="container w860">
        <Kicker>Inlooplocatie bij jou in de buurt</Kicker>
        <Head>De Inloop — Zelfregiecentrum Boxtel</Head>
        <div className="col" style={{ gap: 14 }}>
          <p style={{ margin: 0 }}>
            Een warme plek voor en door inwoners van Boxtel, Esch, Lennisheuvel en Liempde. Vind een luisterend oor, schuif aan voor een kop koffie of thee, en ontmoet mensen met ervaringskennis. Je hoeft je niet aan te melden — loop gewoon binnen.
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
      </div>
    </Shell>
  )
}
