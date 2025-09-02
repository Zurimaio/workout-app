// src/components/UploadWorkout.jsx
import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function UploadWorkout({ userId }) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!title || !exercises) {
      setMessage("Compila tutti i campi.");
      return;
    }

    try {
      const workoutDoc = doc(db, "users", userId, "workouts", title);
      await setDoc(workoutDoc, {
        title,
        exercises: exercises.split("\n"), // ogni riga = un esercizio
        createdAt: new Date(),
      });

      setMessage("Workout salvato con successo!");
      setTitle("");
      setExercises("");
    } catch (err) {
      console.error("Errore salvataggio workout:", err);
      setMessage("Errore durante il salvataggio.");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Crea Workout per Utente</h2>

      <input
        type="text"
        placeholder="Titolo workout"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />

      <textarea
        placeholder="Inserisci esercizi, uno per riga"
        value={exercises}
        onChange={(e) => setExercises(e.target.value)}
        className="border p-2 rounded mb-2 w-full h-32"
      />

      {message && <p className="mb-2 text-sm text-gray-600">{message}</p>}

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Salva Workout
      </button>
    </div>
  );
}
