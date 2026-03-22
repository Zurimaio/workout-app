import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default function AdminAnalytics() {
  const lessons = useAppStore((s) => s.lessons)
  const bookings = useAppStore((s) => s.bookings)
  const attendance = useAppStore((s) => s.attendance)

  const dataset = useMemo(() => {
    const grouped: Record<string, { date: string; participants: number; revenue: number }> = {}

    lessons
      .filter((l) => l.status === 'scheduled')
      .forEach((lesson) => {
        const key = lesson.date.split('T')[0]
        if (!grouped[key]) grouped[key] = { date: formatDate(lesson.date), participants: 0, revenue: 0 }
      })

    bookings.forEach((booking) => {
        const lesson = lessons.find((l) => l.id === booking.lessonId)
        if (!lesson) return
        const key = lesson.date.split('T')[0]
        if (!grouped[key]) grouped[key] = { date: formatDate(lesson.date), participants: 0, revenue: 0 }
        grouped[key].participants += 1
      })

    attendance.forEach((pay) => {
      const booking = bookings.find((b) => b.id === pay.bookingId)
      if (!booking) return
      const lesson = lessons.find((l) => l.id === booking.lessonId)
      if (!lesson) return
      const key = lesson.date.split('T')[0]
      if (!grouped[key]) grouped[key] = { date: formatDate(lesson.date), participants: 0, revenue: 0 }
      grouped[key].revenue += pay.amount
    })

    return Object.values(grouped).sort((a, b) => {
      const aDate = new Date(a.date.split('/').reverse().join('-'))
      const bDate = new Date(b.date.split('/').reverse().join('-'))
      return aDate.getTime() - bDate.getTime()
    })
  }, [lessons, bookings, attendance])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header>
        <h1>Analytics</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Trend partecipanti e ricavi per lezione.
        </p>
      </header>

      <Card style={{ height: 300 }}>
        <h2>Trend partecipanti</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataset}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="participants" stroke="#82ca9d" name="Partecipanti" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ height: 300 }}>
        <h2>Revenue</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataset}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
