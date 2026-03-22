import type { WorkoutPlan } from '../types'

export type PhaseType = 'work' | 'rest' | 'transition'

export interface TimelinePhase {
  id: string
  label: string
  type: PhaseType
  durationSec: number
  roundIndex: number
  setIndex: number
}

function uuid() {
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

export function buildTimeline(plan: WorkoutPlan): TimelinePhase[] {
  const phases: TimelinePhase[] = []
  const rounds = plan.rounds ?? 1
  const work = plan.workSeconds ?? 30
  const rest = plan.restSeconds ?? 15

  const setCount = plan.sets.length

  for (let round = 0; round < rounds; round += 1) {
    for (let setIndex = 0; setIndex < setCount; setIndex += 1) {
      phases.push({
        id: uuid(),
        label: `Round ${round + 1} · ${plan.sets[setIndex].targetReps} reps`,
        type: 'work',
        durationSec: work,
        roundIndex: round,
        setIndex,
      })
      if (setIndex < setCount - 1) {
        phases.push({
          id: uuid(),
          label: 'Rest',
          type: 'rest',
          durationSec: rest,
          roundIndex: round,
          setIndex,
        })
      }
    }
    if (round < rounds - 1) {
      phases.push({
        id: uuid(),
        label: 'Next round',
        type: 'transition',
        durationSec: 15,
        roundIndex: round,
        setIndex: setCount - 1,
      })
    }
  }

  return phases
}

export function formatTime(sec: number) {
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
