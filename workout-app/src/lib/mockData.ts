import type { User, WorkoutPlan, Lesson } from '../types'

export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Coach Marco', phone: '333000111', role: 'admin' },
  { id: 'user-1', name: 'Luca', phone: '333000222', role: 'user' },
  { id: 'user-2', name: 'Sofia', phone: '333000333', role: 'user' },
]

export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    date: new Date(new Date().setDate(new Date().getDate() + ((4 - new Date().getDay() + 7) % 7 || 7))).toISOString(),
    startTime: '19:00',
    capacity: 10,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockPlans: WorkoutPlan[] = [
  {
    id: 'plan-emom-1',
    name: 'EMOM Strength Blast',
    description:
      'A quick EMOM routine to build strength while keeping the heart rate high.',
    protocol: 'EMOM',
    durationMinutes: 15,
    workSeconds: 40,
    restSeconds: 20,
    rounds: 15,
    sets: [
      { id: 'set-1', exerciseId: 'pushups', targetReps: 12 },
      { id: 'set-2', exerciseId: 'squats', targetReps: 15 },
      { id: 'set-3', exerciseId: 'plank', targetReps: 1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-tabata-1',
    name: 'Tabata Metcon',
    description: '4-minute Tabata with bodyweight movements.',
    protocol: 'TABATA',
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    sets: [
      { id: 'set-1', exerciseId: 'burpees', targetReps: 10 },
      { id: 'set-2', exerciseId: 'mountain_climbers', targetReps: 20 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const exerciseLibrary = [
  { id: 'pushups', name: 'Push-ups' },
  { id: 'squats', name: 'Air Squats' },
  { id: 'burpees', name: 'Burpees' },
  { id: 'mountain_climbers', name: 'Mountain Climbers' },
  { id: 'plank', name: 'Plank (60s)' },
  { id: 'jumping_jacks', name: 'Jumping Jacks' },
]
