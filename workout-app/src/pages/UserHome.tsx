import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Card, Button } from '../components/ui'

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

export default function UserHome() {
  const currentUser = useAppStore((s) => s.currentUser)
  const lessons = useAppStore((s) => s.lessons)
  const bookings = useAppStore((s) => s.bookings)
  const bookLesson = useAppStore((s) => s.bookLesson)

  const [feedback, setFeedback] = useState('')

  const sortedLessons = useMemo(() => {
    const now = new Date()
    return [...lessons]
      .filter((l) => new Date(l.date).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [lessons])

  const myBookings = useMemo(() => {
    if (!currentUser) return []
    return bookings.filter((b) => b.userId === currentUser.id)
  }, [currentUser, bookings])

  if (!currentUser) {
    return (
      <Card>
        <h2>Accesso richiesto</h2>
        <p>Effettua il login per vedere le tue lezioni.</p>
      </Card>
    )
  }

  function handleBooking(lessonId: string) {
    if (!currentUser) return
    const [firstName = '', ...rest] = currentUser.name.split(' ')
    const lastName = rest.join(' ') || ''
    const result = bookLesson({
      id: '',
      lessonId,
      userId: currentUser.id,
      firstName,
      lastName,
      phone: currentUser.phone ?? '',
      status: 'booked',
      createdAt: '',
      updatedAt: '',
    })
    setFeedback(result.message)
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header>
        <h1>Ciao {currentUser.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Prenota la lezione di calisthenics del giovedì, vedi i posti liberi e trova la tua prenotazione.
        </p>
      </header>

      {feedback && (
        <Card style={{ borderColor: 'var(--success)' }}>
          <p style={{ margin: 0 }}>{feedback}</p>
        </Card>
      )}

      <section>
        <h2>Le tue prenotazioni</h2>
        {myBookings.length === 0 ? (
          <Card>
            <p>Non hai ancora nessuna prenotazione. Scegli una lezione qui sotto.</p>
          </Card>
        ) : (
          myBookings.map((b) => {
            const lesson = lessons.find((l) => l.id === b.lessonId)
            return (
              <Card key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{lesson ? formatDate(lesson.date) : 'Lezione sconosciuta'}</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                      Stato: {b.status === 'checked_in' ? 'Ingresso registrato' : 'Prenotata'}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Non cancellabile</span>
                </div>
              </Card>
            )
          })
        )}
      </section>

      <section>
        <h2>Prossime lezioni</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {sortedLessons.length === 0 && (
            <Card>
              <p>Nessuna lezione pianificata per ora.</p>
            </Card>
          )}
          {sortedLessons.map((lesson) => {
            const lessonBookings = bookings.filter((b) => b.lessonId === lesson.id)
            const alreadyBooked = lessonBookings.some((b) => b.userId === currentUser.id)
            const availableSeats = Math.max(0, lesson.capacity - lessonBookings.length)
            return (
              <Card key={lesson.id}>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{formatDate(lesson.date)}</h3>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                        {lesson.startTime} - {lesson.status === 'cancelled' ? 'Annullata' : 'Attiva'}
                      </p>
                    </div>
                    <span>{availableSeats} posti liberi</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      onClick={() => handleBooking(lesson.id)}
                      disabled={alreadyBooked || availableSeats === 0 || lesson.status === 'cancelled'}
                      style={{
                        opacity:
                          alreadyBooked || availableSeats === 0 || lesson.status === 'cancelled' ? 0.6 : 1,
                      }}
                    >
                      {lesson.status === 'cancelled'
                        ? 'Lezione annullata'
                        : alreadyBooked
                        ? 'Già prenotato'
                        : availableSeats === 0
                        ? 'Pieno'
                        : 'Prenota'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

