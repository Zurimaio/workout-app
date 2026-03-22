import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export function ProtectedRoute({
  children,
  requireAdmin,
}: {
  children: ReactElement
  requireAdmin?: boolean
}) {
  const currentUser = useAppStore((s) => s.currentUser)

  if (!currentUser) {
    return <Navigate to="/" replace />
  }
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/user" replace />
  }
  return children
}
