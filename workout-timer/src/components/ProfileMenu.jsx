import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import UserProfile from "../hooks/UserProfile";

export default function ProfileMenu() {
const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const { profile, loading } = UserProfile();
  const navigate = useNavigate();

  if (!user) return null;

  const handleChangePassword = async () => {
    try {
      await updatePassword(user, newPassword);
      setMessage("Password aggiornata con successo ✅");
      setNewPassword("");
      setShowChangePwd(false);
    } catch (err) {
      setMessage("Errore: " + err.message);
    }
  };

   const handleLogout = async () => {
    await logout();
    navigate("/login"); // redirect alla pagina di login
  };


// --- Carica gli utenti da Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
      } catch (err) {
        console.error("Errore caricamento utenti:", err);
      }
    };
    loadUsers();
  }, []);

  return (
   <div className="relative w-full flex justify-center"> {/* sidebar-relative + centrato */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-brand text-white px-4 py-2 rounded hover:bg-gray-800 w-full text-center"
      >
        {profile.name || "Profilo"}
      </button>

      {open && (
      <div className="absolute top-full mb-2 w-56 bg-brand-light rounded shadow-lg z-20">
         {showChangePwd ? (
            <div className="px-4 py-2">
              <input
                type="password"
                placeholder="Nuova password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border px-2 py-1 rounded w-full mb-2"
              />
              <button
                onClick={() => {
                  // logica cambio password
                  setMessage("Password aggiornata!");
                  setShowChangePwd(false);
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded w-full mb-2"
              >
                Aggiorna password
              </button>
              <button
                onClick={() => setShowChangePwd(false)}
                className="text-gray-600 underline text-sm"
              >
                Annulla
              </button>
            </div>
          ) : (
            <div>
              {/* TODO: da spostare in altra sezione (profilo magari) */}
              {/*
              <button
                onClick={() => setShowChangePwd(true)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-500"
              >
                Cambia password
              </button> */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 bg-brand-light hover:bg-brand-light text-offwhite"
              >
                Logout
              </button>
            </div>
          )}

          {message && (
            <p className="px-4 py-2 text-sm text-green-600">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
