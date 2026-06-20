import { useState } from 'react'
import { MobileShell } from './MobileShell.jsx'
import { Avatar, Kicker, Head, Choice, InfoModal } from '../../components/ui.jsx'
import logo from '../../assets/padvinder-logo.png'

const ENTRY_OPTIONS = [
  { value: 'precies', title: 'Ja, ik weet precies wat ik wil', sub: 'We gaan direct activiteiten zoeken' },
  { value: 'beetje', title: 'Ik heb een idee, maar weet het niet zeker', sub: 'We helpen je met kiezen' },
  { value: 'nog_niet', title: 'Nee, ik weet het nog niet', sub: 'We doen het hele gesprek samen' },
]

export function MWelcomeScreen({ dispatch, chrome }) {
  const [info, setInfo] = useState(false)
  return (
    <>
      <MobileShell {...chrome} chromeBar={false} center
        footer={
          <>
            <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
              onClick={() => dispatch({ type: 'NEXT' })}>Begin het gesprek →</button>
            <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
              onClick={() => setInfo(true)}>ⓘ Meer info</button>
          </>
        }>
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 12 }}>
          <span className="logo"><img src={logo} alt="" aria-hidden="true" /> Sociaal Knooppunt</span>
          <Avatar size={72} />
          <Head>Hallo, ik ben Padvinder.</Head>
          <p style={{ margin: 0 }}>
            Ik help je activiteiten te vinden die bij je passen in <strong>Boxtel, Esch, Lennisheuvel en Liempde</strong> voor gezondheid &amp; welzijn.
          </p>
          <p className="muted" style={{ margin: 0 }}>Ons gesprek is anoniem. Je hoeft geen persoonsgegevens in te vullen.</p>
          <div className="box" style={{ textAlign: 'left' }}>
            <p style={{ margin: 0 }}><strong>Let op:</strong> ik ben een AI-assistent en geef geen medisch advies. Raadpleeg altijd een arts of zorgverlener voor medische vragen of klachten.</p>
          </div>
        </div>
      </MobileShell>
      {info && <InfoModal onClose={() => setInfo(false)} />}
    </>
  )
}

export function MConsentScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Voor we beginnen</Kicker><Head>Wat doen we met je antwoorden?</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'NEXT' })}>Ik begrijp het → start</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        <div className="box accent">
          <strong>🔒 Dit gesprek is anoniem.</strong>
          <p style={{ margin: '4px 0 0' }}>Geen naam, BSN, e-mail of geboortedatum. Alleen je leeftijd, gender en (optioneel) een 4-cijferige postcode.</p>
        </div>
        <div className="box">
          <span className="h-card">✓ Wat we wél doen</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li>Je antwoorden onthouden tijdens dit gesprek</li>
            <li>Daaruit 3 activiteiten zoeken</li>
            <li>Uitleggen waarom we die kiezen</li>
          </ul>
        </div>
        <div className="box">
          <span className="h-card">✗ Wat we niet doen</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li>Antwoorden opslaan na het gesprek</li>
            <li>Medische gegevens vragen of bewaren</li>
            <li>Je data delen of voor reclame gebruiken</li>
          </ul>
        </div>
      </div>
    </MobileShell>
  )
}

export function MEntryScreen({ state, dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={<><Kicker>Vraag vooraf</Kicker><Head>Weet je al wat je zou willen doen?</Head></>}
      footer={
        <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
          disabled={!state.entryType} onClick={() => dispatch({ type: 'NEXT' })}>Volgende →</button>
      }>
      <div className="choice-list">
        {ENTRY_OPTIONS.map((o) => (
          <Choice key={o.value} variant="choice" value={o.value}
            selected={state.entryType === o.value}
            onSelect={(v) => dispatch({ type: 'SET_ENTRY', value: v })}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block' }}><strong>{o.title}</strong></span>
              <span className="muted" style={{ display: 'block', marginTop: 2 }}>{o.sub}</span>
            </span>
          </Choice>
        ))}
      </div>
    </MobileShell>
  )
}
