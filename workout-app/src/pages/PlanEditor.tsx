import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { exerciseLibrary } from '../lib/mockData'
import type { WorkoutPlan } from '../types'
import { Button, Card, Input, Select } from '../components/ui'

const protocolOptions = [
  { value: 'EMOM', label: 'EMOM' },
  { value: 'TABATA', label: 'Tabata' },
  { value: 'INTERVAL', label: 'Interval training' },
  { value: 'EDT', label: 'EDT (Escalating Density) ' },
  { value: 'AMRAP', label: 'AMRAP' },
  { value: 'CUSTOM', label: 'Custom' },
]

function createEmptyPlan(): WorkoutPlan {
  const now = new Date().toISOString()
  return {
    id: `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: '',
    description: '',
    protocol: 'EMOM',
    durationMinutes: 15,
    workSeconds: 40,
    restSeconds: 20,
    rounds: 15,
    amrapMinutes: 10,
    sets: [
      { id: `set-${Date.now()}-1`, exerciseId: exerciseLibrary[0].id, targetReps: 10 },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export default function PlanEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const plans = useAppStore((s) => s.plans)
  const createPlan = useAppStore((s) => s.createPlan)
  const updatePlan = useAppStore((s) => s.updatePlan)

  const existingPlan = useMemo(() => plans.find((p) => p.id === id), [plans, id])

  const [plan, setPlan] = useState<WorkoutPlan>(() => existingPlan ?? createEmptyPlan())

  useEffect(() => {
    if (existingPlan) {
      setPlan(existingPlan)
    }
  }, [existingPlan])

  function setField<K extends keyof WorkoutPlan>(key: K, value: WorkoutPlan[K]) {
    setPlan((prev) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }))
  }

  function updateSet(index: number, changes: Partial<WorkoutPlan['sets'][0]>) {
    setPlan((prev) => {
      const sets = [...prev.sets]
      sets[index] = { ...sets[index], ...changes }
      return { ...prev, sets, updatedAt: new Date().toISOString() }
    })
  }

  function addSet() {
    setPlan((prev) => ({
      ...prev,
      sets: [
        ...prev.sets,
        {
          id: `set-${Date.now()}-${prev.sets.length + 1}`,
          exerciseId: exerciseLibrary[0].id,
          targetReps: 10,
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  function removeSet(index: number) {
    setPlan((prev) => ({
      ...prev,
      sets: prev.sets.filter((_, idx) => idx !== index),
      updatedAt: new Date().toISOString(),
    }))
  }

  function handleSave() {
    if (!plan.name.trim()) {
      alert('Please add a name for the plan.')
      return
    }
    if (existingPlan) {
      updatePlan(plan)
    } else {
      createPlan(plan)
    }
    navigate('/admin')
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <h1>{existingPlan ? 'Modifica scheda' : 'Nuova scheda di allenamento'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Scegli un protocollo, aggiungi esercizi e salva.
        </p>
      </header>

      <Card>
        <div style={{ display: 'grid', gap: 14 }}>
          <label className="label">
            Nome
            <Input
              value={plan.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Press-up burner"
            />
          </label>

          <label className="label">
            Descrizione
            <Input
              value={plan.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Breve descrizione del workout"
            />
          </label>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <label className="label">
              Protocollo
              <Select
                value={plan.protocol}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField('protocol', e.target.value as any)
                }
              >
                {protocolOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="label">
              Durata (min)
              <Input
                type="number"
                value={plan.durationMinutes ?? 15}
                onChange={(e) => setField('durationMinutes', Number(e.target.value))}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <label className="label">
              Work (sec)
              <Input
                type="number"
                value={plan.workSeconds ?? 40}
                onChange={(e) => setField('workSeconds', Number(e.target.value))}
              />
            </label>
            <label className="label">
              Rest (sec)
              <Input
                type="number"
                value={plan.restSeconds ?? 20}
                onChange={(e) => setField('restSeconds', Number(e.target.value))}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <label className="label">
              Rounds
              <Input
                type="number"
                value={plan.rounds ?? 0}
                onChange={(e) => setField('rounds', Number(e.target.value))}
              />
            </label>
            <label className="label">
              AMRAP (min)
              <Input
                type="number"
                value={plan.amrapMinutes ?? 0}
                onChange={(e) => setField('amrapMinutes', Number(e.target.value))}
              />
            </label>
          </div>

          <div>
            <h2 style={{ margin: '0 0 10px' }}>Esercizi</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.sets.map((set, index) => (
                <div
                  key={set.id}
                  style={{
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: '1fr 1fr 100px 48px',
                    alignItems: 'center',
                  }}
                >
                  <label className="label" style={{ margin: 0 }}>
                    <span className="sr-only">Exercise</span>
                    <Select
                      value={set.exerciseId}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateSet(index, { exerciseId: e.target.value })
                      }
                    >
                      {exerciseLibrary.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="label" style={{ margin: 0 }}>
                    <span className="sr-only">Reps</span>
                    <Input
                      type="number"
                      min={1}
                      value={set.targetReps}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(index, { targetReps: Number(e.target.value) })
                      }
                    />
                  </label>
                  <Button
                    type="button"
                    style={{ padding: '10px 14px' }}
                    onClick={() => removeSet(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addSet}>
                + Add exercise
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
            <Button type="button" onClick={() => navigate('/admin')}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save plan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
