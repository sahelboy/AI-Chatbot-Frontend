import { useState, useEffect, useRef } from 'react'
import { MobileShell } from './MobileShell.jsx'
import { Avatar, Kicker, Head, Typing, ChoiceGroup, TextField } from '../../components/ui.jsx'
import { ResultCard, Reasoning } from '../../components/results.jsx'
import { createUser, createContactRequest } from '../../lib/apiClient.js'

export function MMatchingScreen({ chrome }) {
  return (
    <MobileShell {...chrome} chromeBar={false} center scroll={false}>
      <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <Avatar size={72} />
        <Head>Ik zoek activiteiten die bij je passen…</Head>
        <Typing />
        <p className="muted" style={{ margin: 0 }}>Een ogenblik geduld.</p>
      </div>
    </MobileShell>
  )
}

export function MResultsScreen({ state, dispatch, chrome }) {
  const [remind, setRemind] = useState(false)
  const remindRef = useRef(null)
  // F-09: never silently advance with nothing selected.
  const goNext = () => {
    if (!state.selected.length) { setRemind(true); return }
    dispatch({ type: 'GOTO', screen: 'contact' })
  }
  // Move focus into the dialog on open and restore it on close (a11y).
  useEffect(() => {
    if (!remind) return
    const opener = document.activeElement
    remindRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setRemind(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); opener?.focus?.() }
  }, [remind])
  return (
    <MobileShell {...chrome}
      header={<><Kicker>3 suggesties voor jou</Kicker><Head>Dit past bij wat je vertelde</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={goNext}>Volgende →</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'matching' })}>↻ Andere suggesties</button>
        </>
      }
      overlay={remind && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Nog geen activiteit gekozen"
          onClick={() => setRemind(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="h-display" style={{ margin: '0 0 8px' }}>Je hebt nog niets gekozen</h2>
            <p style={{ marginTop: 0 }}>
              Kies één of meerdere activiteiten, dan kan de aanbieder contact met je opnemen. Wil je liever stoppen? Dan sluiten we het gesprek af.
            </p>
            <div className="col" style={{ gap: 8, marginTop: 16 }}>
              <button ref={remindRef} type="button" className="btn primary block" style={{ justifyContent: 'center' }}
                onClick={() => setRemind(false)}>Kies een activiteit</button>
              <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
                onClick={() => dispatch({ type: 'GOTO', screen: 'done' })}>Gesprek beëindigen</button>
            </div>
          </div>
        </div>
      )}>
      <div className="col" style={{ gap: 10 }}>
        {state.matches.map((a, i) => (
          <ResultCard key={a.id || i} activity={a} index={i}
            selected={state.selected.includes(a.id)}
            onToggle={() => dispatch({ type: 'TOGGLE_SELECT', id: a.id })} />
        ))}
        <Reasoning items={state.reasoning} />
      </div>
    </MobileShell>
  )
}

export function MAccountScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome}
      header={
        <>
          <Head>Wil je je antwoorden bewaren?</Head>
          <p className="muted" style={{ margin: '4px 0 0' }}>Niet verplicht. Standaard bewaren we niets — sluit je de pagina, dan vergeten we alles.</p>
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'accountForm' })}>Ja, maak een account</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'done' })}>Nee, sluit af zonder bewaren</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        <div className="box">
          <div className="h-card" style={{ marginBottom: 4 }}>Geen account</div>
          <ul style={{ margin: 0 }}><li>Niets wordt bewaard</li><li>Je begint volgende keer opnieuw</li><li>Geen gegevens nodig</li></ul>
        </div>
        <div className="box accent">
          <div className="h-card" style={{ marginBottom: 4 }}>Wél een account</div>
          <ul style={{ margin: 0 }}><li>Je antwoorden + 3 suggesties bewaard</li><li>Volgende keer verdergaan zonder opnieuw te beginnen</li><li>Altijd weer te verwijderen</li></ul>
        </div>
      </div>
    </MobileShell>
  )
}

export function MAccountFormScreen({ state, dispatch, chrome }) {
  const [naam, setNaam] = useState('')
  const [leeftijd, setLeeftijd] = useState(state.profile.leeftijd || '')
  const [postcode, setPostcode] = useState(state.profile.postcode || '')
  const [gender, setGender] = useState(state.profile.gender || null)
  const [email, setEmail] = useState(state.contact.email || '')
  const [phone, setPhone] = useState(state.contact.phone || '')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      const age = parseInt(leeftijd, 10)
      await createUser({ naam: naam || 'Onbekend', email: email || `${phone || 'geen'}@padvinder.local`,
        leeftijd: Number.isFinite(age) ? age : undefined, postcode4: /^\d{4}$/.test(postcode) ? postcode : undefined })
    } catch { /* PoC: account store optional; never strand the user */ }
    dispatch({ type: 'GOTO', screen: 'done' })
  }

  return (
    <MobileShell {...chrome}
      header={<><Kicker>Account aanmaken</Kicker><Head>Vul je gegevens in</Head></>}
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Maak account aan →'}</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'GOTO', screen: 'account' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 12 }}>
        <TextField id="m-acc-naam" label="Naam" placeholder="jouw voornaam en achternaam" value={naam} onChange={setNaam} />
        <TextField id="m-acc-leeftijd" label="Leeftijd" inputMode="numeric" maxLength={3} value={leeftijd} onChange={setLeeftijd} />
        <TextField id="m-acc-postcode" label="Postcode" inputMode="numeric" maxLength={4} value={postcode} onChange={setPostcode} />
        <ChoiceGroup label="Gender" options={['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet']} value={gender} onChange={setGender} />
        <div className="box dashed">
          <div className="h-card" style={{ marginBottom: 8 }}>E-mailadres óf telefoonnummer</div>
          <div className="col" style={{ gap: 8 }}>
            <input className="input" type="email" placeholder="jouw@email.nl" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="muted" style={{ textAlign: 'center' }}>— of —</div>
            <input className="input" type="tel" placeholder="06 ── ── ──" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>Je gegevens worden veilig opgeslagen en zijn op elk moment weer te verwijderen.</p>
      </div>
    </MobileShell>
  )
}

export function MContactScreen({ state, dispatch, chrome }) {
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    try {
      const user = await createUser({ naam: 'Onbekend',
        email: state.contact.email || `${state.contact.phone || 'geen'}@padvinder.local` })
      for (const id of state.selected) {
        try { await createContactRequest(user.id ?? user.user_id, id) } catch { /* best-effort */ }
      }
    } catch { /* PoC: store may be off; proceed */ }
    dispatch({ type: 'GOTO', screen: 'account' })
  }
  return (
    <MobileShell {...chrome}
      header={
        <>
          <Kicker>Bijna klaar</Kicker><Head>Hoe mogen de aanbieders je bereiken?</Head>
          <p className="muted" style={{ margin: '4px 0 0' }}>Laat één manier achter.</p>
        </>
      }
      footer={
        <>
          <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
            onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Verstuur mijn keuze →'}</button>
          <button type="button" className="btn ghost block" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'BACK_SCREEN' })}>← Terug</button>
        </>
      }>
      <div className="col" style={{ gap: 10 }}>
        <div className="box dashed">
          <div className="h-card" style={{ marginBottom: 8 }}>E-mailadres óf telefoonnummer</div>
          <div className="col" style={{ gap: 8 }}>
            <input className="input" type="email" placeholder="jouw@email.nl"
              value={state.contact.email} onChange={(e) => dispatch({ type: 'SET_CONTACT', field: 'email', value: e.target.value })} />
            <div className="muted" style={{ textAlign: 'center' }}>— of —</div>
            <input className="input" type="tel" placeholder="06 ── ── ──"
              value={state.contact.phone} onChange={(e) => dispatch({ type: 'SET_CONTACT', field: 'phone', value: e.target.value })} />
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>We gebruiken dit alleen om de gekozen aanbieders contact met je te laten opnemen. Verder bewaren we niets.</p>
      </div>
    </MobileShell>
  )
}

export function MDoneScreen({ dispatch, chrome }) {
  return (
    <MobileShell {...chrome} chromeBar={false} center scroll={false}
      footer={
        <button type="button" className="btn primary block" style={{ justifyContent: 'center' }}
          onClick={() => dispatch({ type: 'RESET' })}>↻ Start een nieuw gesprek</button>
      }>
      <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
        <Avatar size={72} />
        <Head>Bedankt! We wensen je veel succes. 👋</Head>
        <p style={{ margin: 0 }}>Je kunt dit gesprek altijd opnieuw starten als je andere activiteiten wilt zoeken.</p>
      </div>
    </MobileShell>
  )
}
