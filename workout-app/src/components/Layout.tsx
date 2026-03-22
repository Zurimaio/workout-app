import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import './Layout.css'

export function Layout({ children }: { children: ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  const logout = useAppStore((s) => s.logout)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Link to="/" className="brand-link">
            <span className="brand-logo">🏋️</span>
            <span className="brand-text">Calisthenics Coach</span>
          </Link>
        </div>
        <nav className="nav">
          {currentUser ? (
            <>
              {currentUser.role === 'admin' ? (
                <Link to="/admin">Dashboard</Link>
              ) : (
                <Link to="/user">My Workouts</Link>
              )}
              <button className="nav-logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/">Login</Link>
          )}
        </nav>
      </header>
      <main className="page">{children}</main>
      <footer className="footer">
        <span>Demo PWA workout planner • mock data</span>
      </footer>
    </div>
  )
}
