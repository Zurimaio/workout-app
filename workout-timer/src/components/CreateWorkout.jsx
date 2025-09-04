import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, getDocs, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // Assicurati che il context sia corretto

import UserProfile from "../hooks/UserProfile";


export default function CreateWorkout({ selectedUser, onGenerated }) {
  const { user } = useAuth(); // user loggato
  const [exerciseDB, setExerciseDB] = useState({});
  const [groups, setGroups] = useState({});
  const [currentGroup, setCurrentGroup] = useState("1");
  const [userList, setUserList] = useState([]);
  const { profile, loading } = UserProfile();
  const [currentExercise, setCurrentExercise] = useState({
    Tipologia: "",
    Ambito: "",
    Pilastro: "",
    Esercizio: "",
    set: 1,
    Volume: 30,
    Unita: "SEC",
    Rest: 15, 
    Note: ""
  });

  const [availableAmbiti, setAvailableAmbiti] = useState([]);
  const [availablePilastri, setAvailablePilastri] = useState([]);
  const [availableEsercizi, setAvailableEsercizi] = useState([]);
  const [workoutName, setWorkoutName] = useState("");

  // --- Carica gli utenti da Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserList(userList);
      } catch (err) {
        console.error("Errore caricamento utenti:", err);
      }
    };
    loadUsers();
  }, []);


  // --- Carica DB da Firestore
  useEffect(() => {
    const loadDb = async () => {
      try {
        const docRef = doc(db, "exerciseDB", "master");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExerciseDB(data);
          setAvailableAmbiti(Object.keys(data));
        }
      } catch (err) {
        console.error("Errore caricamento DB:", err);
      }
    };
    loadDb();
  }, []);

  // Aggiorna i pilastri disponibili quando cambia l'ambito
  useEffect(() => {
    if (currentExercise.Ambito && exerciseDB[currentExercise.Ambito]) {
      setAvailablePilastri(Object.keys(exerciseDB[currentExercise.Ambito]));
    } else {
      setAvailablePilastri([]);
    }
    setCurrentExercise((prev) => ({ ...prev, Pilastro: "", Esercizio: "" }));
  }, [currentExercise.Ambito, exerciseDB]);

  // Aggiorna gli esercizi disponibili quando cambia il pilastro
  useEffect(() => {
    if (
      currentExercise.Ambito &&
      currentExercise.Pilastro &&
      exerciseDB[currentExercise.Ambito] &&
      exerciseDB[currentExercise.Ambito][currentExercise.Pilastro]
    ) {
      setAvailableEsercizi(
        exerciseDB[currentExercise.Ambito][currentExercise.Pilastro].map(
          (ex) => ex.nome
        )
      );
    } else {
      setAvailableEsercizi([]);
    }
    setCurrentExercise((prev) => ({ ...prev, Esercizio: "" }));
  }, [currentExercise.Pilastro, currentExercise.Ambito, exerciseDB]);

  const handleExerciseChange = (field, value) => {
    setCurrentExercise((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddExercise = () => {
    if (!currentExercise.Ambito || !currentExercise.Pilastro || !currentExercise.Esercizio) {
      alert("Seleziona Ambito, Pilastro ed Esercizio prima di aggiungere.");
      return;
    }

    setGroups((prev) => {
      const groupExercises = prev[currentGroup] ? [...prev[currentGroup]] : [];
      groupExercises.push({ ...currentExercise });
      return { ...prev, [currentGroup]: groupExercises };
    });

    setCurrentExercise({
      Tipologia: "",
      Ambito: "",
      Pilastro: "",
      Esercizio: "",
      set: 1,
      Volume: 30,
      Unita: "SEC",
      Rest: 15, 
      Note: ""
    });
  };

  const handleAddGroup = () => {
    const newGroupId = Math.max(...Object.keys(groups).map(Number), 0) + 1;
    setCurrentGroup(newGroupId.toString());
  };

  const handleGenerateJSON = () => {
    onGenerated(groups);
  };

  const handleSaveWorkout = async () => {
    if (!workoutName) return alert("Inserisci un nome per il workout.");
    if (!user) return alert("Devi essere loggato per salvare il workout.");
    if (!selectedUser) return alert("Seleziona un utente a cui assegnare il workout.");

    try {
      // riferimento alla sottocollezione dei workout dell’utente selezionato
      const userWorkoutsRef = collection(db, "workouts", selectedUser.id, "userWorkouts");

      // aggiunge un nuovo documento con ID generato da Firestore
      await addDoc(userWorkoutsRef, {
        name: workoutName,
        createdAt: serverTimestamp(),
        groups
      });

      alert(`Workout salvato per ${selectedUser.email}!`);
      setGroups({});
      setWorkoutName("");


    } catch (err) {
      console.error("Errore salvataggio workout:", err);
      alert("Errore durante il salvataggio!");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto rounded shadow">
      <h2 className="text-xl font-bold mb-2">Crea Workout Avanzato per {selectedUser?.name}</h2>

      <div className="mb-2">

        <input
          type="text"
          placeholder="Nome workout"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="border p-2 rounded mb-2 w-full"
        />


        <span className="mr-2">Gruppo corrente: {currentGroup}</span>
        <button
          onClick={handleAddGroup}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Aggiungi nuovo gruppo
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Tipologia"
          value={currentExercise.Tipologia}
          onChange={(e) => handleExerciseChange("Tipologia", e.target.value)}
          className="border p-2 rounded text-brand"
        />

        <select
          value={currentExercise.Ambito}
          onChange={(e) => handleExerciseChange("Ambito", e.target.value)}
          className="border p-2 rounded text-brand"
        >
          <option value="">-- Seleziona Ambito --</option>
          {availableAmbiti.map((ambito) => (
            <option key={ambito} value={ambito}>{ambito}</option>
          ))}
        </select>

        <select
          value={currentExercise.Pilastro}
          onChange={(e) => handleExerciseChange("Pilastro", e.target.value)}
          className="border p-2 rounded text-brand"
          disabled={!currentExercise.Ambito}
        >
          <option value="">-- Seleziona Pilastro --</option>
          {availablePilastri.map((pilastro) => (
            <option key={pilastro} value={pilastro}>{pilastro}</option>
          ))}
        </select>

        <select
          value={currentExercise.Esercizio}
          onChange={(e) => handleExerciseChange("Esercizio", e.target.value)}
          className="border p-2 rounded text-brand"
          disabled={!currentExercise.Pilastro}
        >
          <option value="">-- Seleziona Esercizio --</option>
          {availableEsercizi.map((ex) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col flex-1 min-w-[100px]">
            <span>Set</span>
            <input
              type="number"
              placeholder="Set"
              value={currentExercise.set}
              onChange={(e) => handleExerciseChange("set", Number(e.target.value))}
              className="border p-2 rounded text-brand placeholder-text-brand-light w-full"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-[100px]">
            <span>Volume</span>
            <input
              type="number"
              placeholder="Volume"
              value={currentExercise.Volume}
              onChange={(e) => handleExerciseChange("Volume", Number(e.target.value))}
              className="border p-2 rounded text-brand placeholder-text-brand-light w-full"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-[120px]">
            <span>Unità</span>
            <select
              value={currentExercise.Unita}
              onChange={(e) => handleExerciseChange("Unita", e.target.value)}
              className="border p-2 rounded text-brand placeholder-text-brand-light w-full"
            >
              <option value="SEC">SEC</option>
              <option value="REPS">REPS</option>
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-[100px]">
            <span>Rest</span>
            <input
              type="number"
              placeholder="Rest (sec)"
              value={currentExercise.Rest}
              onChange={(e) => handleExerciseChange("Rest", Number(e.target.value))}
              className="border p-2 rounded text-brand-light placeholder-gray-400 w-full"
            />
          </div>


        </div>
        
        <div>
          <span>Note aggiuntive all'esercizio</span>
           <textarea
              placeholder="Note Aggiuntive"
              value={currentExercise.Note}
              onChange={(e) => handleExerciseChange("Note", e.target.value)}
              className="border p-2 rounded text-brand placeholder-text-brand-light w-full"
            />
        </div>


        <button
          onClick={handleAddExercise}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Aggiungi Esercizio al gruppo
        </button>
      </div>





      <button
        onClick={handleSaveWorkout}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition mb-4"
      >
        Salva Workout su DB
      </button>

      <h3 className="font-semibold mb-2">Preview Workout</h3>
      <div className="space-y-4 max-h-96 overflow-auto">
        {Object.entries(groups).map(([groupId, exercises]) => (
          <div key={groupId} className="bg-white shadow rounded p-4">
            <h4 className="font-bold mb-2">Gruppo {groupId}</h4>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Tipologia</th>
                  <th className="border px-2 py-1 text-left">Ambito</th>
                  <th className="border px-2 py-1 text-left">Pilastro</th>
                  <th className="border px-2 py-1 text-left">Esercizio</th>
                  <th className="border px-2 py-1 text-left">Set</th>
                  <th className="border px-2 py-1 text-left">Volume</th>
                  <th className="border px-2 py-1 text-left">Unità</th>
                  <th className="border px-2 py-1 text-left">Rest</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{ex.Tipologia}</td>
                    <td className="border px-2 py-1">{ex.Ambito}</td>
                    <td className="border px-2 py-1">{ex.Pilastro}</td>
                    <td className="border px-2 py-1">{ex.Esercizio}</td>
                    <td className="border px-2 py-1">{ex.set}</td>
                    <td className="border px-2 py-1">{ex.Volume}</td>
                    <td className="border px-2 py-1">{ex.Unita}</td>
                    <td className="border px-2 py-1">{ex.Rest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
