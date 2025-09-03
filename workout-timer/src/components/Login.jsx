// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const {login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();


  const checkUserRole = async (uid, email) => {
    const docRef = doc(db, "admins", uid);
    console.log("uid:" ,uid);
    const docSnap = await getDoc(docRef);
    console.log("docSnap.data(): ", docSnap.data());

    if (docSnap.exists()) {
      return docSnap.data().role; // "admin" o "user"
    } else {
      // Se è un nuovo utente, creiamo il profilo base
      await setDoc(docRef, {
        email,
        role: "user", // default
        createdAt: serverTimestamp()
      });
      return "user";
    }
  };

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      /*const role = await checkUserRole(user.uid, email);*/
      const role = "user";
  
       // Redirect automatico in base al ruolo
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
    
  };

  const handleSignup = async () => {
    try {
      const user = await signup(email, password);
      // Al momento il ruolo è sempre "user"
      const role = await checkUserRole(user.uid, email);
      setIsAdmin(role === "admin");
    } catch (err) {
      setError(err.message);
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
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
        <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2 rounded">Registrati</button>
      </div>

      {isAdmin && (
        <p className="mt-4 text-green-600 font-semibold">Sei loggato come ADMIN</p>
      )}
    </div>
  );
}
