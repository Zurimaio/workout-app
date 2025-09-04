import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const navigate = useNavigate();

  const createUserProfile = async (user, email) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const tokenResult = await user.getIdTokenResult(true);
      return tokenResult.claims.role || "user";
    } else {
      await setDoc(docRef, {
        email,
        role: "user",
        createdAt: serverTimestamp(),
      });
      return "user";
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      const role = await createUserProfile(user, email);
      setIsAdmin(role === "admin");
      await user.getIdToken(true);

      // Nascondi form con animazione
      setShowForm(false);

      // Redirect dopo animazione overlay (500ms)
      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/");
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-brand-light">
      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="p-4 max-w-md bg-brand rounded-2xl shadow p-10 z-10"
          >
            <h2 className="text-xl font-bold mb-4">Login </h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded mb-2 w-full text-brand-light placeholder-gray-400"
            />

            <div className="relative w-full mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded mb-2 w-full text-brand-light placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bg-white rounded-none shadow-none right-2 top-1/2 transform -translate-y-1/2 text-gray-500 p-0 hover:bg-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {loading ? "Caricamento..." : "Login"}
              </button>
            </div>

            {isAdmin && (
              <p className="mt-4 text-green-600 font-semibold">
                Sei loggato come ADMIN
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20"
          >
            <motion.div
              className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            ></motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
