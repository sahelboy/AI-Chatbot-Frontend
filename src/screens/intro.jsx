import { useState } from 'react'
import { Shell, Avatar, Kicker, Head, Choice, InfoModal } from '../components/ui.jsx'
import { FooterNav } from './nav.jsx'

const ENTRY_OPTIONS = [
  { value: 'precies', title: 'Ja, ik weet precies wat ik wil', sub: 'We gaan direct activiteiten zoeken' },
  { value: 'beetje', title: 'Ik heb een idee, maar weet het niet zeker', sub: 'We helpen je met kiezen' },
  { value: 'nog_niet', title: 'Nee, ik weet het nog niet', sub: 'We doen het hele gesprek samen' },
]

export function WelcomeScreen({ state, dispatch, chrome }) {
  const [info, setInfo] = useState(false)
  return (
    <>
      <Shell
        {...chrome} hideReset center
        footer={
          <>
            <span className="muted">Het kan ongeveer 5 minuten duren</span>
            <div className="row wrap" style={{ gap: 10 }}>
              <button type="button" className="btn ghost" onClick={() => setInfo(true)}>ⓘ Meer info</button>
              <button type="button" className="btn primary" onClick={() => dispatch({ type: 'NEXT' })}>Begin het gesprek →</button>
            </div>
          </>
        }
      >
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <Avatar size={92} />
          <Head xl>Hallo, ik ben Padvinder.</Head>
          <p style={{ maxWidth: 760, margin: 0 }}>
            Ik help je activiteiten te vinden die bij je passen in <strong>Boxtel, Esch, Lennisheuvel en Liempde</strong> voor gezondheid &amp; welzijn.
          </p>
          <p className="muted" style={{ margin: 0 }}>Ons gesprek is anoniem. Je hoeft geen persoonsgegevens in te vullen.</p>
          <div className="box" style={{ maxWidth: 760, marginTop: 6, textAlign: 'left' }}>
            <p style={{ margin: 0 }}><strong>Let op:</strong> Ik ben een AI-assistent en geef geen medisch advies. Raadpleeg altijd een arts of gekwalificeerde zorgverlener voor medische vragen of gezondheidsklachten.</p>
          </div>
        </div>
      </Shell>
      {info && <InfoModal onClose={() => setInfo(false)} />}
    </>
  )
}

export function ConsentScreen({ state, dispatch, chrome }) {
  return (
    <Shell
      {...chrome}
      footer={<FooterNav backLabel="← Terug" onBack={() => dispatch({ type: 'BACK' })}
        nextLabel="Ik begrijp het — start het gesprek →" onNext={() => dispatch({ type: 'NEXT' })} />}
    >
      <div className="container w900">
        <Kicker>Voor we beginnen</Kicker>
        <Head>Wat doen we wel en niet met je antwoorden?</Head>
        <div className="box accent" style={{ marginBottom: 16 }}>
          <strong>🔒 Dit gesprek is anoniem.</strong>
          <p style={{ margin: '6px 0 0' }}>
            We vragen <strong>geen naam, BSN, geboortedatum, e-mail of telefoonnummer</strong>. Alleen je leeftijd, gender en — als je wilt — een 4-cijferige postcode.
          </p>
        </div>
        <div className="grid-2">
          <div className="box">
            <span className="h-card">✓ Wat we wél doen</span>
            <ul>
              <li>Je antwoorden tijdens dit gesprek onthouden</li>
              <li>Daaruit 3 activiteiten zoeken</li>
              <li>Uitleggen waarom we die kiezen</li>
            </ul>
          </div>
          <div className="box">
            <span className="h-card">✗ Wat we niet doen</span>
            <ul>
              <li>Antwoorden opslaan na het gesprek</li>
              <li>Medische gegevens vragen of bewaren</li>
              <li>Je data delen of voor reclame gebruiken</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function EntryScreen({ state, dispatch, chrome }) {
  return (
    <Shell
      {...chrome}
      footer={<FooterNav hideBack
        note={state.entryType ? 'Je antwoord bepaalt hoe lang het gesprek duurt' : 'Kies eerst een optie hierboven om verder te gaan'}
        nextDisabled={!state.entryType} onNext={() => dispatch({ type: 'NEXT' })} />}
    >
      <div className="container w860">
        <Kicker>Vraag vooraf</Kicker>
        <Head>Weet je al wat je zou willen doen?</Head>
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
      </div>
    </Shell>
  )
}
