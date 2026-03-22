import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Card, Button } from '../components/ui'

export default function AdminLessons() {
  const lessons = useAppStore((s) => s.lessons)
  const bookings = useAppStore((s) => s.bookings)
  const cancelLesson = useAppStore((s) => s.cancelLesson)
  const removeLesson = useAppStore((s) => s.removeLesson)

  const lessonRows = useMemo(() => {
    return [...lessons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [lessons])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h1>Lezioni pianificate</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Gestione delle lezioni giovedì. Puoi visualizzare partecipanti, annullare e accedere al dettaglio.
          </p>
        </div>
        <Link to="/admin" className="btn">
          Torna alla dashboard
        </Link>
      </header>

      <section style={{ display: 'grid', gap: 12 }}>
        {lessonRows.length === 0 ? (
          <Card>
            <p>Nessuna lezione pianificata. Crea una lezione dalla dashboard principale.</p>
          </Card>
        ) : (
          lessonRows.map((lesson) => {
            const booked = bookings.filter((b) => b.lessonId === lesson.id).length
            const available = Math.max(0, lesson.capacity - booked)
            return (
              <Card key={lesson.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{new Date(lesson.date).toLocaleDateString()} - {lesson.startTime}</h3>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)' }}>
                      Stato: {lesson.status} | Prenotati: {booked}/{lesson.capacity} | Posti liberi: {available}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/admin/lesson/${lesson.id}`} className="btn" style={{ padding: '8px 10px' }}>
                      Dettaglio
                    </Link>
                    <Button
                      onClick={() => cancelLesson(lesson.id)}
                      disabled={lesson.status === 'cancelled'}
                      style={{ opacity: lesson.status === 'cancelled' ? 0.6 : 1 }}
                    >
                      {lesson.status === 'cancelled' ? 'Annullata' : 'Annulla'}
                    </Button>
                    <Button
                      onClick={() => {
                        if (window.confirm(`Eliminare definitivamente la lezione del ${new Date(lesson.date).toLocaleDateString()}?`)) {
                          removeLesson(lesson.id)
                        }
                      }}
                      style={{ backgroundColor: '#cc3333' }}
                    >
                      Elimina
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </section>
    </div>
  )
}
