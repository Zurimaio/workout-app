import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Card, Button } from '../components/ui'

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const lesson = useAppStore((s) => s.lessons.find((l) => l.id === id))
  const bookings = useAppStore((s) => s.bookings)
  const markBookingCheckedIn = useAppStore((s) => s.markBookingCheckedIn)
  const setBookingPayment = useAppStore((s) => s.setBookingPayment)

  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amount, setAmount] = useState('15')
  const [info, setInfo] = useState('')

  const lessonBookings = useMemo(() => {
    if (!lesson) return []
    return bookings.filter((b) => b.lessonId === lesson.id)
  }, [lesson, bookings])

  if (!lesson) {
    return (
      <Card>
        <h2>Lezione non trovata</h2>
        <Button onClick={() => navigate('/admin')}>Torna indietro</Button>
      </Card>
    )
  }

  function handleCheckIn(bookingId: string) {
    markBookingCheckedIn(bookingId)
    setInfo(`Check-in registrato per ${bookingId}`)
  }

  function handleSavePayment(bookingId: string) {
    setBookingPayment(bookingId, paymentMethod, Number(amount))
    setInfo(`Pagamento registrato per ${bookingId}`)
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header>
        <h1>Lezione {new Date(lesson.date).toLocaleDateString()} alle {lesson.startTime}</h1>
        <p>
          Stato: {lesson.status}. Prenotazioni: {lessonBookings.length}/{lesson.capacity}
        </p>
      </header>

      {info && (
        <Card>
          <p>{info}</p>
        </Card>
      )}

      <section style={{ display: 'grid', gap: 12 }}>
        {lessonBookings.map((booking) => (
          <Card key={booking.id}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {booking.firstName} {booking.lastName}
                </span>
                <span>{booking.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button disabled={booking.status === 'checked_in'} onClick={() => handleCheckIn(booking.id)}>
                  Check-in
                </Button>
                <input
                  type="number"
                  style={{ width: 80 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Carta</option>
                  <option value="online">Online</option>
                </select>
                <Button onClick={() => handleSavePayment(booking.id)}>Registra pagamento</Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}
