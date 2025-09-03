// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const {login, auth, role, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();


    // Crea il profilo base in users/{uid} e ritorna il ruolo
  const createUserProfile = async (user, email) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const tokenResult = await user.getIdTokenResult(true);
      return tokenResult.claims.role || "user"; // "admin" o "user"
    } else {
      await setDoc(docRef, {
        email,
        role: "user", // default
        createdAt: serverTimestamp(),
      });
      return "user";
    }
  };

    const handleLogin = async () => {
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      // Recupera ruolo da Firestore
      const role = await createUserProfile(user, email);
      setIsAdmin(role === "admin");

      console.log("Ruolo: ", role);
      await user.getIdToken(true);

     // Redirect automatico in base al ruolo
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    }
    
  };

  const handleSignup = async () => {
    setError("");
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      const role = await createUserProfile(user.uid, email);
      setIsAdmin(role === "admin");

      await user.getIdToken(true);

      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Questa email è già registrata. Prova a fare login.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
     <div className="p-4 max-w-md mx-auto bg-gray-50 rounded shadow mt-20">
      <h2 className="text-xl font-bold mb-4">Login / Registrati</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={handleSignup}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Registrati
        </button>
      </div>

      {isAdmin && (
        <p className="mt-4 text-green-600 font-semibold">Sei loggato come ADMIN</p>
      )}
    </div>
  );
}
