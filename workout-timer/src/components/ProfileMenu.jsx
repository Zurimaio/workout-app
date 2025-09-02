import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updatePassword } from "firebase/auth";

export default function ProfileMenu() {
const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        {user.email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10">
          <div className="px-4 py-2 text-gray-800">
            <p className="font-semibold">Email:</p>
            <p className="text-sm">{user.email}</p>
          </div>

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
                onClick={handleChangePassword}
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
              <button
                onClick={() => setShowChangePwd(true)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-500"
              >
                Cambia password
              </button>
                <button
                    onClick={async () => {
                        try {
                            await logout();
                        } catch (err) {
                            console.error("Errore logout:", err);
                            alert("Errore durante il logout");
                        }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
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
