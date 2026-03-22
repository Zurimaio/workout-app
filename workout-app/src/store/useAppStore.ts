import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionRecord, User, WorkoutPlan, Lesson, Booking, Attendance } from '../types'
import { mockPlans, mockUsers, mockLessons } from '../lib/mockData'
import {
  loadPlans,
  loadSessions,
  loadUsers,
  loadLessons,
  loadBookings,
  loadAttendance,
  savePlans,
  saveSessions,
  saveUsers,
  saveLessons,
  saveBookings,
  saveAttendance,
} from '../lib/storage'
import {
  getUsersFromFirestore,
  getLessonsFromFirestore,
  getBookingsFromFirestore,
  getAttendanceFromFirestore,
  setUserToFirestore,
  setLessonToFirestore,
  setBookingToFirestore,
  setAttendanceToFirestore,
  deleteUserFromFirestore,
  deleteLessonFromFirestore,
  deleteBookingFromFirestore,
  deleteAttendanceFromFirestore,
} from '../lib/firestore'
import { isFirebaseAvailable } from '../lib/firebase'

interface AppState {
  currentUser: User | null
  users: User[]
  plans: WorkoutPlan[]
  sessions: SessionRecord[]
  lessons: Lesson[]
  bookings: Booking[]
  attendance: Attendance[]
  init: () => void
  login: (userId: string) => void
  loginByPhone: (phone: string, name: string) => void
  logout: () => void
  createPlan: (plan: WorkoutPlan) => void
  updatePlan: (plan: WorkoutPlan) => void
  deletePlan: (planId: string) => void
  assignPlanToUser: (userId: string, planId: string | undefined) => void
  addSession: (session: SessionRecord) => void
  updateSession: (session: SessionRecord) => void
  createLesson: (lesson: Lesson) => void
  cancelLesson: (lessonId: string) => void
  removeLesson: (lessonId: string) => void
  bookLesson: (booking: Booking) => { success: boolean; message: string }
  markBookingCheckedIn: (bookingId: string) => void
  setBookingPayment: (bookingId: string, paymentMethod: string, amount: number) => void
  addUser: (user: Omit<User, 'id' | 'role'>) => Promise<{ success: boolean; message: string }>
  deleteUser: (userId: string) => Promise<void>
  createLessonsWindow: (months: number) => void
  syncFromFirestore: () => Promise<void>
  syncToFirestore: () => Promise<void>
}

const initialUsers = loadUsers()
const initialPlans = loadPlans()
const initialSessions = loadSessions()
const initialLessons = loadLessons()
const initialBookings = loadBookings()
const initialAttendance = loadAttendance()

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: initialUsers.length ? initialUsers : mockUsers,
      plans: initialPlans.length ? initialPlans : mockPlans,
      sessions: initialSessions,
      lessons: initialLessons.length ? initialLessons : mockLessons,
      bookings: initialBookings,
      attendance: initialAttendance,
      init: () => {
        // no-op for now: state is initialized from storage/mock data automatically
      },
      login: (userId) => {
        const users = get().users
        const user = users.find((u) => u.id === userId) ?? null
        set({ currentUser: user })
      },
      loginByPhone: (phone, name) => {
        const existing = get().users.find((u) => u.phone === phone)
        if (existing) {
          set({ currentUser: existing })
          return
        }
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name,
          phone,
          role: 'user',
        }
        const users = [...get().users, newUser]
        set({ users, currentUser: newUser })
        saveUsers(users)
      },
      logout: () => set({ currentUser: null }),
      syncFromFirestore: async () => {
        if (!isFirebaseAvailable()) return
        const users = await getUsersFromFirestore()
        const lessons = await getLessonsFromFirestore()
        const bookings = await getBookingsFromFirestore()
        const attendance = await getAttendanceFromFirestore()
        set({ users, lessons, bookings, attendance })
        saveUsers(users)
        saveLessons(lessons)
        saveBookings(bookings)
        saveAttendance(attendance)
      },
      syncToFirestore: async () => {
        if (!isFirebaseAvailable()) return
        const stateUsers = get().users
        const stateLessons = get().lessons
        const stateBookings = get().bookings
        const stateAttendance = get().attendance

        await Promise.all(stateUsers.map((u) => setUserToFirestore(u)))
        await Promise.all(stateLessons.map((l) => setLessonToFirestore(l)))
        await Promise.all(stateBookings.map((b) => setBookingToFirestore(b)))
        await Promise.all(stateAttendance.map((a) => setAttendanceToFirestore(a)))
      },
      createPlan: (plan) => {
        const plans = [...get().plans, plan]
        set({ plans })
        savePlans(plans)
      },
      updatePlan: (plan) => {
        const plans = get().plans.map((p) => (p.id === plan.id ? plan : p))
        set({ plans })
        savePlans(plans)
      },
      deletePlan: (planId) => {
        const plans = get().plans.filter((p) => p.id !== planId)
        set({ plans })
        savePlans(plans)
      },
      assignPlanToUser: (userId, planId) => {
        const users = get().users.map((u) =>
          u.id === userId ? { ...u, assignedPlanId: planId } : u,
        )
        set({ users })
        saveUsers(users)
      },
      addUser: async (user) => {
        const existing = get().users.find((u) => u.phone === user.phone)
        if (existing) {
          return { success: false, message: 'Numero di telefono già registrato' }
        }
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: user.name,
          phone: user.phone,
          role: 'user',
        }
        const users = [...get().users, newUser]
        set({ users })
        saveUsers(users)
        if (isFirebaseAvailable()) {
          await setUserToFirestore(newUser)
        }
        return { success: true, message: 'Nuovo cliente aggiunto' }
      },
      deleteUser: async (userId) => {
        const users = get().users.filter((u) => u.id !== userId)
        const sessions = get().sessions.filter((s) => s.userId !== userId)
        const bookings = get().bookings.filter((b) => b.userId !== userId)
        const attendance = get().attendance.filter((a) => {
          const b = get().bookings.find((booking) => booking.id === a.bookingId)
          return b ? b.userId !== userId : true
        })
        set({ users, sessions, bookings, attendance })
        saveUsers(users)
        saveSessions(sessions)
        saveBookings(bookings)
        saveAttendance(attendance)
        if (isFirebaseAvailable()) {
          await deleteUserFromFirestore(userId)
          await Promise.all(bookings.map((b) => deleteBookingFromFirestore(b.id)))
          await Promise.all(attendance.map((a) => deleteAttendanceFromFirestore(a.id)))
        }
        if (get().currentUser?.id === userId) {
          set({ currentUser: null })
        }
      },
      createLessonsWindow: (months) => {
        const now = new Date()
        const lessons: Lesson[] = []

        for (let m = 0; m < months; m++) {
          const base = new Date(now.getFullYear(), now.getMonth() + m, 1)
          // ogni giovedì del mese
          for (let d = 1; d <= new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate(); d++) {
            const day = new Date(base.getFullYear(), base.getMonth(), d)
            if (day.getDay() === 4) {
              const id = `lesson-${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`
              lessons.push({
                id,
                date: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 19, 0, 0, 0).toISOString(),
                startTime: '19:00',
                capacity: 10,
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          }
        }

        const existingLessons = get().lessons
        const newLessons = [...existingLessons]
        lessons.forEach((lesson) => {
          if (!existingLessons.some((existing) => existing.id === lesson.id)) {
            newLessons.push(lesson)
          }
        })

        set({ lessons: newLessons })
        saveLessons(newLessons)
      },
      removeLesson: async (lessonId) => {
        const lessons = get().lessons.filter((l) => l.id !== lessonId)
        const bookings = get().bookings.filter((b) => b.lessonId !== lessonId)
        const attendance = get().attendance.filter((a) => {
          const booking = get().bookings.find((b) => b.id === a.bookingId)
          return booking ? booking.lessonId !== lessonId : true
        })
        set({ lessons, bookings, attendance })
        saveLessons(lessons)
        saveBookings(bookings)
        saveAttendance(attendance)
        if (isFirebaseAvailable()) {
          await deleteLessonFromFirestore(lessonId)
          await Promise.all(bookings.map((b) => deleteBookingFromFirestore(b.id)))
          await Promise.all(attendance.map((a) => deleteAttendanceFromFirestore(a.id)))
        }
      },
      addSession: (session) => {
        const sessions = [...get().sessions, session]
        set({ sessions })
        saveSessions(sessions)
      },
      updateSession: (session) => {
        const sessions = get().sessions.map((existing) =>
          existing.id === session.id ? session : existing,
        )
        set({ sessions })
        saveSessions(sessions)
      },
      createLesson: (lesson) => {
        const lessons = [...get().lessons, lesson]
        set({ lessons })
        saveLessons(lessons)
        if (isFirebaseAvailable()) {
          setLessonToFirestore(lesson).catch(() => null)
        }
      },
      cancelLesson: (lessonId) => {
        const lessons = get().lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, status: 'cancelled' as Lesson['status'], updatedAt: new Date().toISOString() }
            : lesson,
        )
        set({ lessons })
        saveLessons(lessons)
        const updated = lessons.find((lesson) => lesson.id === lessonId)
        if (isFirebaseAvailable() && updated) {
          setLessonToFirestore(updated).catch(() => null)
        }
      },
      bookLesson: (booking) => {
        const lessons = get().lessons
        const lesson = lessons.find((l) => l.id === booking.lessonId)
        if (!lesson || lesson.status === 'cancelled') {
          return { success: false, message: 'La lezione non è disponibile.' }
        }
        const existingBookings = get().bookings.filter((b) => b.lessonId === lesson.id)
        if (existingBookings.length >= lesson.capacity) {
          return { success: false, message: 'La lezione ha raggiunto la capacità massima.' }
        }
        if (existingBookings.some((b) => b.phone === booking.phone)) {
          return { success: false, message: 'Hai già una prenotazione per questa lezione.' }
        }
        const newBooking = {
          ...booking,
          id: `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          status: 'booked' as Booking['status'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const bookings = [...get().bookings, newBooking]
        set({ bookings })
        saveBookings(bookings)
        if (isFirebaseAvailable()) {
          setBookingToFirestore(newBooking).catch(() => null)
        }
        return { success: true, message: 'Prenotazione completata con successo.' }
      },
      markBookingCheckedIn: (bookingId) => {
        const bookings = get().bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'checked_in' as Booking['status'], updatedAt: new Date().toISOString() }
            : booking,
        )
        set({ bookings })
        saveBookings(bookings)
        const updatedBooking = bookings.find((b) => b.id === bookingId)
        if (isFirebaseAvailable() && updatedBooking) {
          setBookingToFirestore(updatedBooking).catch(() => null)
        }
      },
      setBookingPayment: (bookingId, paymentMethod, amount) => {
        const newAttendance = {
          id: `attendance-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          bookingId,
          checkedInAt: new Date().toISOString(),
          paymentMethod,
          amount,
          createdAt: new Date().toISOString(),
        }
        const attendance = [...get().attendance, newAttendance]
        set({ attendance })
        saveAttendance(attendance)
        if (isFirebaseAvailable()) {
          setAttendanceToFirestore(newAttendance).catch(() => null)
        }
      },
    }),
    {
      name: 'workout-app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        plans: state.plans,
        sessions: state.sessions,
        lessons: state.lessons,
        bookings: state.bookings,
        attendance: state.attendance,
      }),
    },
  ),
)
