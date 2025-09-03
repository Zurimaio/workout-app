// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Caricamento...</p>; // loader opzionale

  // Se non loggato → redirect al login
  if (!user) return <Navigate to="/login" replace />;

  // Se serve admin ma l’utente non lo è → redirect alla Dashboard
  if (requireAdmin && role !== "admin") return <Navigate to="/" replace />;

  return children;
}
