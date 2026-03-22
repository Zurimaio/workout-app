import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Button, Card } from '../components/ui'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const users = useAppStore((s) => s.users)
  const plans = useAppStore((s) => s.plans)
  const sessions = useAppStore((s) => s.sessions)
  const lessons = useAppStore((s) => s.lessons)
  const bookings = useAppStore((s) => s.bookings)
  const attendance = useAppStore((s) => s.attendance)
  const assignPlan = useAppStore((s) => s.assignPlanToUser)
  const deleteUser = useAppStore((s) => s.deleteUser)

  const user = users.find((u) => u.id === id)
  const assignedPlan = useMemo(() => {
    if (!user) return undefined
    return plans.find((p) => p.id === user.assignedPlanId)
  }, [user, plans])

  const userSessions = useMemo(() => {
    if (!user) return []
    return sessions
      .filter((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  }, [sessions, user])

  if (!user) {
    return <p>Utente non trovato.</p>
  }

  const userBookings = useMemo(() => {
    if (!user) return []
    return bookings.filter((b) => b.userId === user.id)
  }, [bookings, user])

  const bookingDetails = useMemo(() => {
    return userBookings.map((booking) => ({
      ...booking,
      lessonDate: new Date(lessons.find((l) => l.id === booking.lessonId)?.date ?? '').toLocaleDateString(),
      lessonTime: lessons.find((l) => l.id === booking.lessonId)?.startTime ?? '',
      checkedAt: attendance.find((a) => a.bookingId === booking.id)?.checkedInAt ?? null,
      payment: attendance.find((a) => a.bookingId === booking.id)
    }))
  }, [userBookings, lessons, attendance])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1>{user.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Assegna una scheda o vedi lo storico allenamenti.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/admin')}>Back</Button>
          <Button
            onClick={() => {
              if (window.confirm(`Eliminare l'utente ${user.name}?`)) {
                deleteUser(user.id)
                navigate('/admin')
              }
            }}
            style={{ backgroundColor: '#cc3333' }}
          >
            Elimina utente
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Assigned plan</p>
          <select
            value={user.assignedPlanId ?? ''}
            onChange={(event) => assignPlan(user.id, event.target.value || undefined)}
            className="input"
          >
            <option value="">-- Select plan --</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          {assignedPlan && (
            <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{assignedPlan.name}</p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.7)' }}>
                {assignedPlan.description}
              </p>
              <Button
                className=""
                onClick={() => navigate(`/plan/${assignedPlan.id}`)}
              >
                Edit plan
              </Button>
            </div>
          )}
        </div>
      </Card>

      <section>
        <h2>Prenotazioni e ingressi</h2>
        {bookingDetails.length === 0 ? (
          <Card>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
              Nessuna prenotazione ancora.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {bookingDetails.map((booking) => (
              <Card key={booking.id}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    {booking.lessonDate} {booking.lessonTime}
                  </p>
                  <p style={{ margin: 0 }}>
                    Stato: {booking.status}, Check-in:{' '}
                    {booking.checkedAt ? new Date(booking.checkedAt).toLocaleString() : 'non registrato'}
                  </p>
                  <p style={{ margin: 0 }}>
                    Pagamento: {booking.payment ? `${booking.payment.amount} ${booking.payment.paymentMethod}` : 'non registrato'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Session history</h2>
        {userSessions.length === 0 ? (
          <Card>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
              Nessuna sessione ancora.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {userSessions.slice(0, 5).map((session) => (
              <Card key={session.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      {new Date(session.startedAt).toLocaleString()}
                    </p>
                    <p style={{ margin: 0, fontWeight: 700 }}>
                      {plans.find((p) => p.id === session.planId)?.name ?? 'Workout'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
