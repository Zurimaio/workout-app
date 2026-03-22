import type { SessionRecord, User, WorkoutPlan, Lesson, Booking, Attendance } from '../types'

const APP_KEY = 'workout-app/v1'

function safeParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function loadUsers(): User[] {
  return safeParse<User[]>(localStorage.getItem(`${APP_KEY}/users`)) || []
}

export function saveUsers(users: User[]) {
  localStorage.setItem(`${APP_KEY}/users`, JSON.stringify(users))
}

export function loadPlans(): WorkoutPlan[] {
  return safeParse<WorkoutPlan[]>(localStorage.getItem(`${APP_KEY}/plans`)) || []
}

export function savePlans(plans: WorkoutPlan[]) {
  localStorage.setItem(`${APP_KEY}/plans`, JSON.stringify(plans))
}

export function loadSessions(): SessionRecord[] {
  return safeParse<SessionRecord[]>(localStorage.getItem(`${APP_KEY}/sessions`)) || []
}

export function saveSessions(sessions: SessionRecord[]) {
  localStorage.setItem(`${APP_KEY}/sessions`, JSON.stringify(sessions))
}

export function loadLessons(): Lesson[] {
  return safeParse<Lesson[]>(localStorage.getItem(`${APP_KEY}/lessons`)) || []
}

export function saveLessons(lessons: Lesson[]) {
  localStorage.setItem(`${APP_KEY}/lessons`, JSON.stringify(lessons))
}

export function loadBookings(): Booking[] {
  return safeParse<Booking[]>(localStorage.getItem(`${APP_KEY}/bookings`)) || []
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(`${APP_KEY}/bookings`, JSON.stringify(bookings))
}

export function loadAttendance(): Attendance[] {
  return safeParse<Attendance[]>(localStorage.getItem(`${APP_KEY}/attendance`)) || []
}

export function saveAttendance(attendance: Attendance[]) {
  localStorage.setItem(`${APP_KEY}/attendance`, JSON.stringify(attendance))
}

export function clearStorage() {
  localStorage.removeItem(`${APP_KEY}/users`)
  localStorage.removeItem(`${APP_KEY}/plans`)
  localStorage.removeItem(`${APP_KEY}/sessions`)
  localStorage.removeItem(`${APP_KEY}/lessons`)
  localStorage.removeItem(`${APP_KEY}/bookings`)
  localStorage.removeItem(`${APP_KEY}/attendance`)
}
