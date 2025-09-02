import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ExerciseList from "./ExerciseList";

export default function AdminPanel({ onBack }) {
  const [exerciseDB, setExerciseDB] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDb = async () => {
      try {
        const docRef = doc(db, "exerciseDB", "master");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setExerciseDB(docSnap.data());
      } catch (err) {
        console.error("Errore caricamento DB:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDb();
  }, []);

  const saveDb = async () => {
    try {
      await setDoc(doc(db, "exerciseDB", "master"), exerciseDB);
      alert("Database salvato correttamente!");
    } catch (err) {
      alert("Errore salvataggio DB: " + err.message);
    }
  };

  const handleJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setExerciseDB(data);
      await setDoc(doc(db, "exerciseDB", "master"), data);
      alert("JSON caricato correttamente su Firestore!");
    } catch (err) {
      alert("Errore nel caricamento del JSON: " + err.message);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(exerciseDB, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exerciseDB.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Caricamento DB...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pannello Admin - Exercise DB</h1>

      {/* Upload JSON */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Carica JSON</label>
        <input 
          type="file" 
          accept=".json" 
          onChange={handleJSONUpload} 
          className="border p-2 rounded"
        />
      </div>

      {/* Export JSON */}
      <div className="mb-4">
        <button 
          onClick={handleExportJSON} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Esporta JSON
        </button>
      </div>

      {/* Lista esercizi editabile */}
      <ExerciseList exerciseDB={exerciseDB} setExerciseDB={setExerciseDB} />

      {/* Salva DB */}
      <button 
        onClick={saveDb} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Salva DB
      </button>
    </div>
  );
}
