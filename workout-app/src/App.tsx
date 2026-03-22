import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import UserHome from './pages/UserHome'
import UserDetail from './pages/UserDetail'
import PlanEditor from './pages/PlanEditor'
import SessionPage from './pages/SessionPage'
import LessonDetail from './pages/LessonDetail'
import AdminLessons from './pages/AdminLessons'
import AdminAnalytics from './pages/AdminAnalytics'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:id"
            element={
              <ProtectedRoute requireAdmin>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/new"
            element={
              <ProtectedRoute requireAdmin>
                <PlanEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <ProtectedRoute requireAdmin>
                <PlanEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:id"
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/lesson/:id"
            element={
              <ProtectedRoute requireAdmin>
                <LessonDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/lessons"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
