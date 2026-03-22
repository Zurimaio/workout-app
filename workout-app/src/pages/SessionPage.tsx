import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { buildTimeline, formatTime } from '../lib/protocols'
import { playClick } from '../lib/audio'
import { requestNotificationPermission, sendNotification } from '../lib/notifications'
import { exerciseLibrary } from '../lib/mockData'
import { Button, Card, Input } from '../components/ui'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessions = useAppStore((s) => s.sessions)
  const plans = useAppStore((s) => s.plans)
  const updateSession = useAppStore((s) => s.updateSession)

  const session = sessions.find((s) => s.id === id)
  const plan = useMemo(() => (session ? plans.find((p) => p.id === session.planId) : undefined), [plans, session])

  const timeline = useMemo(() => (plan ? buildTimeline(plan) : []), [plan])
  const [activeIndex, setActiveIndex] = useState(0)
  const [remaining, setRemaining] = useState(timeline[0]?.durationSec ?? 0)
  const [isRunning, setIsRunning] = useState(false)

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    if (!timeline.length) return
    setRemaining(timeline[activeIndex]?.durationSec ?? 0)
  }, [activeIndex, timeline])

  useEffect(() => {
    if (!isRunning) return

    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          playClick()
          const nextIndex = Math.min(activeIndex + 1, timeline.length - 1)
          const nextPhase = timeline[nextIndex]
          sendNotification('Next phase', {
            body: nextPhase?.label ?? 'Next',
          })
          setActiveIndex(nextIndex)
          return nextPhase?.durationSec ?? 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [activeIndex, isRunning, timeline])

  if (!session || !plan) {
    return (
      <div>
        <h1>Session not found</h1>
        <p>Verifica che la sessione esista e riprova.</p>
        <Button onClick={() => navigate('/')}>Go back</Button>
      </div>
    )
  }
  const currentSession = session
  const activePhase = timeline[activeIndex]


  function handleToggle() {
    setIsRunning((prev) => !prev)
    if (!isRunning) {
      playClick()
    }
  }

  function saveProgress() {
    const finishedAt = new Date().toISOString()
    const durationSec = Math.round((Date.now() - new Date(currentSession.startedAt).getTime()) / 1000)
    updateSession({ ...currentSession, finishedAt, durationSec })
    navigate('/user')
  }

  function updateReps(setId: string, reps: number) {
    updateSession({
      ...currentSession,
      sets: currentSession.sets.map((s) => (s.setId === setId ? { ...s, repsDone: reps } : s)),
    })
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <h1>Session</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Follow the timer, log reps, and finish the session when you&apos;re done.
        </p>
      </header>

      <Card>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Workout
              </p>
              <p style={{ margin: 0, fontWeight: 700 }}>{plan.name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Phase
              </p>
              <p style={{ margin: 0, fontWeight: 700 }}>{activePhase?.label || '—'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Time remaining
              </p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 36 }}>{formatTime(remaining)}</p>
            </div>
            <Button onClick={handleToggle} style={{ minWidth: 120 }}>
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Sets (tap to log reps)
            </p>
            {plan.sets.map((set) => {
              const progress = session.sets.find((s) => s.setId === set.id)
              const repsDone = progress?.repsDone ?? 0
              return (
                <div
                  key={set.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {exerciseLibrary.find((e) => e.id === set.exerciseId)?.name ?? 'Exercise'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      Target: {set.targetReps} reps
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={repsDone}
                    onChange={(e) => updateReps(set.id, Number(e.target.value))}
                  />
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{repsDone}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <Button onClick={() => navigate('/user')}>Back</Button>
            <Button onClick={saveProgress}>Finish session</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
