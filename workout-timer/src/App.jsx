import React, { useState, useEffect } from "react";
import AdminPanel from "./components/admin/AdminPanel";
import AdminRoute from "./components/AdminRoute"
import ProtectedRoute from "./components/ProtectedRoute";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { user, loading } = useAuth(); 

 return (
    <Router>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard protetta per tutti gli utenti loggati */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rotta protetta solo per admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}