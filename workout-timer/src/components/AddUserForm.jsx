import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function AddUserForm({ onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Compila tutti i campi!");
      return;
    }

    try {
      const functions = getFunctions();
      const createClient = httpsCallable(functions, "createClient");
      const result = await createClient({ name, email });

      if (result.data.success) {
        const { user, password } = result.data;

       
        alert(
        `✅ Utente creato!\n\nEmail: ${user.email}\nPassword: ${password}\n\nCondividila con il cliente.`
         );    

        // Aggiungi subito l'utente alla lista senza ricaricare
      if (onUserCreated) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          onUserCreated({ id: user.uid, ...snap.data() });
        }

        }
        setName("");
        setEmail("");
      }
    } catch (err) {
      console.error("Errore creazione utente:", err);
      alert("❌ Errore durante la creazione: " + err.message);
    }
  };

  return (
    <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded bg-gray-100 text-brand">
      <h3 className="text-lg font-semibold mb-2">➕ Aggiungi nuovo cliente</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nome cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email cliente"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Salva Cliente
        </button>
      </div>
    </form>
  );
}
