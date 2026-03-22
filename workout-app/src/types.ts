export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  assignedPlanId?: string
}

export type LessonStatus = 'scheduled' | 'cancelled'

export interface Lesson {
  id: string
  date: string // ISO date for the Thursday lesson
  startTime: string
  capacity: number
  status: LessonStatus
  createdAt: string
  updatedAt: string
}

export type BookingStatus = 'booked' | 'checked_in'

export interface Booking {
  id: string
  lessonId: string
  userId: string
  firstName: string
  lastName: string
  phone: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  bookingId: string
  checkedInAt: string
  paymentMethod: string
  amount: number
  createdAt: string
}

export type ProtocolType =
  | 'EMOM'
  | 'TABATA'
  | 'INTERVAL'
  | 'EDT'
  | 'AMRAP'
  | 'CUSTOM'

export interface Exercise {
  id: string
  name: string
  description?: string
  defaultReps?: number
  defaultWeightKg?: number
}

export interface WorkoutSet {
  id: string
  exerciseId: string
  targetReps: number
  note?: string
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string
  protocol: ProtocolType
  durationMinutes?: number
  workSeconds?: number
  restSeconds?: number
  rounds?: number
  amrapMinutes?: number
  sets: WorkoutSet[]
  createdAt: string
  updatedAt: string
}

export interface SessionSetProgress {
  setId: string
  repsDone: number
  notes?: string
}

export interface SessionRecord {
  id: string
  userId: string
  planId: string
  startedAt: string
  finishedAt?: string
  durationSec?: number
  sets: SessionSetProgress[]
}
