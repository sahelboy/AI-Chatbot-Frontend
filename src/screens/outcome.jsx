import { useState, useEffect, useRef } from 'react'
import { Shell, Avatar, Kicker, Head, Typing, ChoiceGroup, TextField } from '../components/ui.jsx'
import { ResultCard, Reasoning } from '../components/results.jsx'
import { createUser, createContactRequest } from '../lib/apiClient.js'

export function MatchingScreen({ chrome }) {
  return (
    <Shell {...chrome} hideReset center>
      <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 18 }}>
        <Avatar size={80} />
        <Head>Ik zoek activiteiten die bij je passen…</Head>
        <Typing />
        <p className="muted" style={{ margin: 0 }}>Een ogenblik geduld.</p>
      </div>
    </Shell>
  )
}

export function ResultsScreen({ state, dispatch, chrome }) {
  const [remind, setRemind] = useState(false)
  const remindRef = useRef(null)
  // Don't silently advance to the account step with nothing selected (F-09);
  // prompt the user to pick an activity or to end the conversation instead.
  const goNext = () => {
    if (!state.selected.length) { setRemind(true); return }
    dispatch({ type: 'GOTO', screen: 'contact' })
  }
  // Move focus into the dialog on open and restore it on close (a11y: the
  // dialog asserts aria-modal, so focus must follow it).
  useEffect(() => {
    if (!remind) return
    const opener = document.activeElement
    remindRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setRemind(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); opener?.focus?.() }
  }, [remind])
  return (
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'GOTO', screen: 'matching' })}>↻ Andere suggesties</button>
          <div className="row wrap" style={{ gap: 10 }}>
            <span className="muted">Kies één of meerdere activiteiten — ze nemen contact met jou op</span>
            <button type="button" className="btn primary" onClick={goNext}>Volgende →</button>
          </div>
        </>
      }>
      <div className="container w1100">
        <Kicker>3 activiteiten voor jou</Kicker>
        <Head>Dit past bij wat je vertelde</Head>
        <div className="grid-3">
          {state.matches.map((a, i) => (
            <ResultCard key={a.id || i} activity={a} index={i}
              selected={state.selected.includes(a.id)}
              onToggle={() => dispatch({ type: 'TOGGLE_SELECT', id: a.id })} />
          ))}
        </div>
        <Reasoning items={state.reasoning} />
      </div>
      {remind && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Nog geen activiteit gekozen"
          onClick={() => setRemind(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="h-display" style={{ margin: '0 0 8px' }}>Je hebt nog niets gekozen</h2>
            <p style={{ marginTop: 0 }}>
              Kies één of meerdere activiteiten, dan kan de aanbieder contact met je opnemen. Wil je liever stoppen? Dan sluiten we het gesprek af.
            </p>
            <div className="row wrap" style={{ gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'GOTO', screen: 'done' })}>Gesprek beëindigen</button>
              <button ref={remindRef} type="button" className="btn primary" onClick={() => setRemind(false)}>Kies een activiteit</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}

export function AccountScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'GOTO', screen: 'done' })}>Nee, sluit af zonder te bewaren</button>
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'GOTO', screen: 'accountForm' })}>Ja, maak een account →</button>
        </>
      }>
      <div className="container w860">
        <Head>Wil je je antwoorden bewaren?</Head>
        <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>Niet verplicht. Standaard bewaren we niets — sluit je de pagina, dan vergeten we alles.</p>
        <div className="grid-2">
          <div className="box">
            <div className="h-card" style={{ marginBottom: 8 }}>Geen account</div>
            <ul><li>Niets wordt bewaard</li><li>Je begint volgende keer opnieuw</li><li>Geen gegevens nodig</li></ul>
          </div>
          <div className="box accent">
            <div className="h-card" style={{ marginBottom: 8 }}>Maak een account</div>
            <ul><li>Je antwoorden + 3 suggesties bewaard</li><li>Volgende keer verdergaan zonder opnieuw te beginnen</li><li>Op elk moment te verwijderen</li></ul>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function AccountFormScreen({ state, dispatch, chrome }) {
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
    } catch {
      // PoC: account store is optional (may be disabled or mid-migration on the
      // backend). Never strand the user; finish the conversation regardless.
    }
    dispatch({ type: 'GOTO', screen: 'done' })
  }

  return (
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'GOTO', screen: 'account' })}>← Terug</button>
          <button type="button" className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Maak account aan →'}</button>
        </>
      }>
      <div className="container w860">
        <Kicker>Account aanmaken</Kicker>
        <Head>Vul je gegevens in</Head>
        <div className="grid-2">
          <TextField id="acc-naam" label="Naam" placeholder="jouw voornaam en achternaam" value={naam} onChange={setNaam} />
          <TextField id="acc-leeftijd" label="Leeftijd" inputMode="numeric" maxLength={3} value={leeftijd} onChange={setLeeftijd} />
          <TextField id="acc-postcode" label="Postcode" inputMode="numeric" maxLength={4} value={postcode} onChange={setPostcode} />
          <div><ChoiceGroup label="Gender" options={['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet']} value={gender} onChange={setGender} /></div>
        </div>
        <div className="box dashed" style={{ marginTop: 16 }}>
          <div className="h-card" style={{ marginBottom: 8 }}>E-mailadres óf telefoonnummer</div>
          <div className="row wrap" style={{ gap: 10, alignItems: 'center' }}>
            <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" placeholder="jouw@email.nl" value={email} onChange={(e) => setEmail(e.target.value)} />
            <span className="muted">of</span>
            <input className="input" style={{ flex: 1, minWidth: 200 }} type="tel" placeholder="06 ── ── ──" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>Je gegevens worden veilig opgeslagen en zijn op elk moment weer te verwijderen.</p>
      </div>
    </Shell>
  )
}

export function ContactScreen({ state, dispatch, chrome }) {
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
    <Shell {...chrome}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'BACK_SCREEN' })}>← Terug</button>
          <button type="button" className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Bezig…' : 'Verstuur mijn keuze →'}</button>
        </>
      }>
      <div className="container w720">
        <Kicker>Bijna klaar</Kicker>
        <Head>Hoe mogen de aanbieders je bereiken?</Head>
        <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>
          Je deed dit gesprek anoniem. Dit invullen is vrijwillig: we gebruiken het alleen om de aanbieder die jij koos contact met je te laten opnemen. Laat één manier achter.
        </p>
        <div className="box dashed">
          <div className="h-card" style={{ marginBottom: 8 }}>E-mailadres óf telefoonnummer</div>
          <div className="row wrap" style={{ gap: 10, alignItems: 'center' }}>
            <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" placeholder="jouw@email.nl"
              value={state.contact.email} onChange={(e) => dispatch({ type: 'SET_CONTACT', field: 'email', value: e.target.value })} />
            <span className="muted">of</span>
            <input className="input" style={{ flex: 1, minWidth: 200 }} type="tel" placeholder="06 ── ── ──"
              value={state.contact.phone} onChange={(e) => dispatch({ type: 'SET_CONTACT', field: 'phone', value: e.target.value })} />
          </div>
        </div>
        <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>We gebruiken dit alleen om de gekozen aanbieders contact met je te laten opnemen. Verder bewaren we niets.</p>
      </div>
    </Shell>
  )
}

export function DoneScreen({ dispatch, chrome }) {
  return (
    <Shell {...chrome} hideReset center
      footer={<><span className="muted">Tot ziens 👋</span>
        <button type="button" className="btn primary" onClick={() => dispatch({ type: 'RESET' })}>↻ Start een nieuw gesprek</button></>}>
      <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <Avatar size={84} />
        <Head xl>Bedankt! We wensen je veel succes.</Head>
        <p style={{ maxWidth: 640, margin: 0 }}>Je kunt dit gesprek altijd opnieuw starten als je andere activiteiten wilt zoeken.</p>
      </div>
    </Shell>
  )
}
