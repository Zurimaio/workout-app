import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore'
import { getFirebase_db, isFirebaseAvailable } from './firebase'
import type { User, Lesson, Booking, Attendance } from '../types'

function getDB(): Firestore {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase non disponibile')
  }
  return getFirebase_db()
}

export async function getUsersFromFirestore(): Promise<User[]> {
  const db = getDB()
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<User, 'id'>) }))
}

export async function getUserByPhoneFromFirestore(phone: string): Promise<User | null> {
  const db = getDB()
  const q = query(collection(db, 'users'), where('phone', '==', phone))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const d = snapshot.docs[0]
  return { id: d.id, ...(d.data() as Omit<User, 'id'>) }
}

export async function setUserToFirestore(user: User): Promise<void> {
  const db = getDB()
  await setDoc(doc(db, 'users', user.id), {
    name: user.name,
    phone: user.phone,
    role: user.role,
    assignedPlanId: user.assignedPlanId ?? null,
  })
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const db = getDB()
  await deleteDoc(doc(db, 'users', userId))
}

export async function getLessonsFromFirestore(): Promise<Lesson[]> {
  const db = getDB()
  const snapshot = await getDocs(collection(db, 'lessons'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Lesson, 'id'>) }))
}

export async function setLessonToFirestore(lesson: Lesson): Promise<void> {
  const db = getDB()
  await setDoc(doc(db, 'lessons', lesson.id), lesson)
}

export async function deleteLessonFromFirestore(lessonId: string): Promise<void> {
  const db = getDB()
  await deleteDoc(doc(db, 'lessons', lessonId))
}

export async function getBookingsFromFirestore(): Promise<Booking[]> {
  const db = getDB()
  const snapshot = await getDocs(collection(db, 'bookings'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Booking, 'id'>) }))
}

export async function setBookingToFirestore(booking: Booking): Promise<void> {
  const db = getDB()
  await setDoc(doc(db, 'bookings', booking.id), booking)
}

export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  const db = getDB()
  await deleteDoc(doc(db, 'bookings', bookingId))
}

export async function getAttendanceFromFirestore(): Promise<Attendance[]> {
  const db = getDB()
  const snapshot = await getDocs(collection(db, 'attendance'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Attendance, 'id'>) }))
}

export async function setAttendanceToFirestore(att: Attendance): Promise<void> {
  const db = getDB()
  await setDoc(doc(db, 'attendance', att.id), att)
}

export async function deleteAttendanceFromFirestore(attendanceId: string): Promise<void> {
  const db = getDB()
  await deleteDoc(doc(db, 'attendance', attendanceId))
}
