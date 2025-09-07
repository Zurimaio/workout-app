import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import LoadingOverlay from "./LoadingOverlay";



export default function MyWorkouts({ onPreview, onStart }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, "workouts", user.uid, "userWorkouts");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(data);
      } catch (err) {
        console.error("Errore caricamento workout:", err);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  if (!user) return <p>Devi essere loggato per vedere i tuoi workout.</p>;
 /*  if (!loading) return <p>Caricamento in corso...</p>; */
  if (!workouts.length) return <p>Nessun workout salvato.</p>;


  return (
    
    <div>
    {/* Overlay */}
    <LoadingOverlay isVisible={loading} />  

      <h2 className="text-3xl font-bold mb-2">I miei workout</h2>
      
      <div className="space-y-2 bg-brand-light text-offwhite rounded shadow">
        {workouts.map(w => (
          <div key={w.id} className="flex justify-between items-center rounded shadow p-2 hover:bg-brand-light">
            <span>{w.name || `Workout ${w.id}`}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onPreview(w.groups)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                Preview
              </button>
              <button
                onClick={() => onStart(w.groups)}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Avvia
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}