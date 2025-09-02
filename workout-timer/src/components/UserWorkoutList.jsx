import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function UserWorkoutList({ onSelect }) {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "workouts", "admin", "userWorkouts")
        );
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setWorkouts(data);
      } catch (err) {
        console.error("Errore caricamento workout:", err);
      }
    };
    loadWorkouts();
  }, []);

  if (workouts.length === 0) return <p>Nessun workout disponibile.</p>;

  return (
    <div className="flex flex-col gap-2 mt-4">
      {workouts.map((w) => (
        <div
          key={w.id}
          className="flex justify-between items-center p-2 bg-white rounded shadow"
        >
          <span>{w.name}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onSelect(w)}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Preview
            </button>
            <button
              onClick={() => onSelect(w, "start")}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Avvia
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
