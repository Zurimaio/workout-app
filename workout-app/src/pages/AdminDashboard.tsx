import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Card, Button } from '../components/ui'

export default function AdminDashboard() {
  const users = useAppStore((s) => s.users)
  const plans = useAppStore((s) => s.plans)
  const sessions = useAppStore((s) => s.sessions)
  const lessons = useAppStore((s) => s.lessons)
  const bookings = useAppStore((s) => s.bookings)
  const cancelLesson = useAppStore((s) => s.cancelLesson)
  const deleteUser = useAppStore((s) => s.deleteUser)
  const createLessonsWindow = useAppStore((s) => s.createLessonsWindow)

  const summary = useMemo(() => {
    return users.map((user) => {
      const userSessions = sessions.filter((s) => s.userId === user.id)
      const lastSession = userSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
      return {
        ...user,
        sessionCount: userSessions.length,
        lastSession,
        assignedPlan: plans.find((p) => p.id === user.assignedPlanId),
      }
    })
  }, [users, plans, sessions])

  const totalBookings = bookings.length
  const checkedIn = bookings.filter((b) => b.status === 'checked_in').length
  const topUsers = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const user = users.find((u) => u.id === b.userId)
      if (!user) return acc
      acc[user.name] = (acc[user.name] || 0) + 1
      return acc
    }, {}),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const addUser = useAppStore((s) => s.addUser)
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [userMessage, setUserMessage] = useState('')

  async function handleAddUser() {
    if (!newUserPhone.trim() || !newUserName.trim()) {
      setUserMessage('Inserisci nome e telefono del cliente')
      return
    }
    const result = await addUser({ name: newUserName.trim(), phone: newUserPhone.trim() })
    setUserMessage(result.message)
    if (result.success) {
      setNewUserName('')
      setNewUserPhone('')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline' }}>
        <div>
          <h1>Dashboard Coach</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Gestisci lezioni, prenotazioni, ingressi e pagamenti.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => createLessonsWindow(3)}>Crea 3 mesi lezioni</Button>
          <Link to="/admin/lessons" className="btn">
            Visualizza lezioni
          </Link>
          <Link to="/admin/analytics" className="btn">
            Analytics
          </Link>
        </div>
      </header>

      <Card>
        <h2>Aggiungi nuovo cliente (registrazione)</h2>
        <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
          <input
            className="input"
            value={newUserName}
            placeholder="Nome"
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <input
            className="input"
            value={newUserPhone}
            placeholder="Telefono"
            onChange={(e) => setNewUserPhone(e.target.value)}
          />
          <Button onClick={handleAddUser}>Crea cliente</Button>
          {userMessage && <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>{userMessage}</p>}
        </div>
      </Card>

      <section style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <Card>
          <p>Totale prenotazioni</p>
          <h2>{totalBookings}</h2>
        </Card>
        <Card>
          <p>Totale check-in</p>
          <h2>{checkedIn}</h2>
        </Card>
        <Card>
          <p>Lezioni programmate</p>
          <h2>{lessons.filter((l) => l.status === 'scheduled').length}</h2>
        </Card>
      </section>

      <section style={{ display: 'grid', gap: 18 }}>
        <h2>Utenti</h2>
        {summary.map((user) => (
          <Card key={user.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                  {user.assignedPlan ? user.assignedPlan.name : 'No plan assegnato'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/user/${user.id}`} className="btn" style={{ padding: '10px 14px' }}>
                  Dettagli
                </Link>
                <Button
                  onClick={() => {
                    if (window.confirm(`Eliminare l'utente ${user.name}?`)) {
                      deleteUser(user.id)
                    }
                  }}
                  style={{ padding: '10px 14px' }}
                >
                  Elimina
                </Button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Sessioni</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{user.sessionCount}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Ultima sessione</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
                  {user.lastSession ? new Date(user.lastSession.startedAt).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <h2>Top partecipanti</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {topUsers.map(([name, count]) => (
            <li key={name} style={{ marginBottom: 6 }}>
              {name}: {count} prenotazioni
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Lezioni attive</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {lessons.map((lesson) => {
            const lessonBookings = bookings.filter((b) => b.lessonId === lesson.id)
            const free = Math.max(0, lesson.capacity - lessonBookings.length)
            return (
              <Card key={lesson.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{new Date(lesson.date).toLocaleDateString()}</strong> {lesson.startTime}
                    <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.7)' }}>
                      {free} posti liberi / {lesson.capacity}
                    </p>
                  </div>
                  {lesson.status === 'scheduled' ? (
                    <Button onClick={() => cancelLesson(lesson.id)}>Annulla</Button>
                  ) : (
                    <span style={{ color: 'rgba(255,99,71,0.8)' }}>Annullata</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
