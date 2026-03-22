import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPhoneNumber } from 'firebase/auth'
import { useAppStore } from '../store/useAppStore'
import { getFirebaseAuth, createRecaptchaVerifier, isFirebaseAvailable } from '../lib/firebase'
import { getUserByPhoneFromFirestore } from '../lib/firestore'
import { Button } from '../components/ui'

export default function Login() {
  const init = useAppStore((s) => s.init)
  const loginByPhone = useAppStore((s) => s.loginByPhone)
  const addUser = useAppStore((s) => s.addUser)
  const syncFromFirestore = useAppStore((s) => s.syncFromFirestore)
  const users = useAppStore((s) => s.users)
  const currentUser = useAppStore((s) => s.currentUser)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<'phone' | 'code'>('phone')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)


  useEffect(() => {
    init()
    if (isFirebaseAvailable()) {
      syncFromFirestore().catch((err) => {
        console.warn('Sync from Firestore failed', err)
      })
    }
  }, [init, syncFromFirestore])

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/user', { replace: true })
    }
  }, [currentUser, navigate])

  const normalizedPhone = (phoneValue: string) => {
    const digits = phoneValue.replace(/\D/g, '')
    if (digits.startsWith('39')) return `+${digits}`
    if (digits.length === 10) return `+39${digits}`
    if (digits.startsWith('00')) return `+${digits.slice(2)}`
    if (digits.startsWith('+')) return digits
    return `+${digits}`
  }

  const existingUser = users.find((user) => user.phone === phone.trim())

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault()
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setMessage('Inserisci un numero di telefono valido.')
      return
    }
    if (!isFirebaseAvailable()) {
      setMessage('Firebase non configurato, login offline')
      if (existingUser) {
        loginByPhone(trimmedPhone, existingUser.name)
      } else if (name.trim()) {
        await addUser({ name: name.trim(), phone: trimmedPhone })
        loginByPhone(trimmedPhone, name.trim())
      } else {
        setMessage('Nuovo utente: inserisci il tuo nome per completare la registrazione.')
      }
      return
    }

    try {
      const auth = getFirebaseAuth()
      const verifier = createRecaptchaVerifier('recaptcha-container')
      const phoneE164 = normalizedPhone(trimmedPhone)
      const confirmation = await signInWithPhoneNumber(auth, phoneE164, verifier)
      setConfirmationResult(confirmation)
      setStage('code')
      setMessage('Codice inviato al numero. Inseriscilo qui sotto.')
    } catch (error) {
      console.error(error)
      setMessage('Impossibile inviare il codice. Verifica il numero e riprova.')
    }
  }

  async function handleConfirmCode(event: React.FormEvent) {
    event.preventDefault()
    if (!confirmationResult || !code.trim()) {
      setMessage('Inserisci il codice di verifica.')
      return
    }

    try {
      await confirmationResult.confirm(code.trim())
      const firebaseUserPhone = normalizedPhone(phone.trim())
      const remoteUser = isFirebaseAvailable() ? await getUserByPhoneFromFirestore(firebaseUserPhone) : null

      if (remoteUser) {
        loginByPhone(remoteUser.phone ?? firebaseUserPhone, remoteUser.name)
      } else {
        const local = users.find((u) => u.phone === firebaseUserPhone)
        if (local) {
          const phoneToUse = local.phone ?? firebaseUserPhone
          loginByPhone(phoneToUse, local.name)
        } else {
          if (!name.trim()) {
            setMessage('Nuovo utente: inserisci il tuo nome.')
            setStage('phone')
            return
          }
          await addUser({ name: name.trim(), phone: firebaseUserPhone })
          loginByPhone(firebaseUserPhone, name.trim())
        }
      }
    } catch (error) {
      console.error(error)
      setMessage('Codice non valido o scaduto. Ritenta.')
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1>Benvenuto</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
        Inserisci il tuo nome e numero di telefono per accedere. La registrazione è semplice senza password.
      </p>

      <form onSubmit={stage === 'phone' ? handleSendCode : handleConfirmCode} style={{ display: 'grid', gap: 14 }}>
        <label className="label">
          Telefono
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="3331234567"
            disabled={stage === 'code'}
          />
        </label>

        {stage === 'code' && (
          <label className="label">
            Codice OTP
            <input
              className="input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
            />
          </label>
        )}

        {!existingUser && stage === 'phone' && phone.trim() && (
          <label className="label">
            Nome (solo per nuovo utente)
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome"
            />
          </label>
        )}

        <Button type="submit">{stage === 'phone' ? 'Invia OTP' : 'Conferma codice'}</Button>
      </form>
      <div id="recaptcha-container"></div>
      {message && <p style={{ color: 'var(--danger)', marginTop: 6 }}>{message}</p>}
      {existingUser && <p style={{ color: 'var(--success)', marginTop: 6 }}>Utente trovato: {existingUser.name}. Accedi con il tuo numero.</p>}


      <section style={{ marginTop: 32, opacity: 0.8 }}>
        <h2>Come funziona</h2>
        <ul style={{ paddingLeft: 20, marginTop: 8, color: 'rgba(255,255,255,0.7)' }}>
          <li>Prenota la lezione del giovedì in pochi secondi.</li>
          <li>Ritrovi automaticamente la tua prenotazione quando rientri.</li>
          <li>Il coach gestisce i posti, il check-in e i pagamenti sul dashboard.</li>
        </ul>
      </section>
    </div>
  )
}
