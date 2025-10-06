import React, { useState, useEffect } from "react";
import { Edit2, Plus, Save, Trash2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";

export default function WorkoutEditor({ selectedUser, initialData = null, onSave }) {
    const [workoutName, setWorkoutName] = useState(initialData?.name || "");
    const [groups, setGroups] = useState(initialData?.groups || {});
    const [currentGroup, setCurrentGroup] = useState("1");
    const [editingExercise, setEditingExercise] = useState(null); // {groupId, index}
    const [exerciseDB, setExerciseDB] = useState({});
    const [editedWorkout, setEditedWorkout] = useState(false);

    // --- Carica DB esercizi
    useEffect(() => {
        const loadDb = async () => {
            try {
                const docRef = doc(db, "exerciseDB", "master");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setExerciseDB(docSnap.data());
            } catch (err) {
                console.error("Errore caricamento DB:", err);
            }
        };
        loadDb();
    }, []);

    // --- Normalizza vecchi dati caricati (retrocompatibilità)
useEffect(() => {
    if (groups && typeof groups === "object") {
        const fixedGroups = {};
        for (const [id, value] of Object.entries(groups)) {
            if (Array.isArray(value)) {
                // Vecchio formato: era un array di esercizi
                fixedGroups[id] = { name: `Gruppo ${id}`, exercises: value };
            } else {
                // Nuovo formato: già corretto
                fixedGroups[id] = value;
            }
        }
        setGroups(fixedGroups);
    }
}, []);

    // --- Aggiungi gruppo
    const handleAddGroup = () => {
        const newId = Math.max(...Object.keys(groups).map(Number), 0) + 1;
        setGroups(prev => ({
            ...prev,
            [newId]: { name: `Gruppo ${newId}`, exercises: [] }
        }));
        setCurrentGroup(newId.toString());
    };

    // --- Rimuovi gruppo
    const handleRemoveGroup = groupId => {
        const updated = { ...groups };
        delete updated[groupId];
        setGroups(updated);
    };

    // --- Aggiungi esercizio
    const handleAddExercise = groupId => {
        const newExercise = {
            Tipologia: "",
            Ambito: "",
            Pilastro: "",
            Esercizio: "",
            set: 1,
            Volume: 30,
            Unita: "SEC",
            Rest: 15,
            Note: "",
            preSaved: true,
        };
        setGroups(prev => {
            const newGroupExercises = [...(prev[groupId]?.exercises || []), newExercise];
            setEditingExercise({ groupId, index: newGroupExercises.length - 1 });
            return {
                ...prev,
                [groupId]: { ...prev[groupId], exercises: newGroupExercises }
            };
        });
    };

    // --- Rimuovi esercizio
    const handleRemoveExercise = (groupId, index) => {
        setGroups(prev => {
            const updatedGroup = [...prev[groupId].exercises];
            updatedGroup.splice(index, 1);
            return {
                ...prev,
                [groupId]: { ...prev[groupId], exercises: updatedGroup }
            };
        });
    };

    // --- Modifica esercizio
    const handleChangeExercise = (groupId, index, field, value) => {
        setGroups(prev => {
            const updatedGroup = [...prev[groupId].exercises];
            updatedGroup[index] = { ...updatedGroup[index], [field]: value };

            if (field === "Ambito") {
                updatedGroup[index].Pilastro = "";
                updatedGroup[index].Esercizio = "";
            }
            if (field === "Pilastro") updatedGroup[index].Esercizio = "";

            setEditedWorkout(true);
            return {
                ...prev,
                [groupId]: { ...prev[groupId], exercises: updatedGroup }
            };
        });
    };

    // --- Salva esercizio pre-saved
    const handleSaveExercise = (groupId, index) => {
        setGroups(prev => {
            const updatedGroup = [...prev[groupId].exercises];
            updatedGroup[index].preSaved = false;
            return {
                ...prev,
                [groupId]: { ...prev[groupId], exercises: updatedGroup }
            };
        });
        setEditingExercise(null);
    };

    // --- Cambia nome gruppo
    const handleChangeGroupName = (groupId, value) => {
        setGroups(prev => ({
            ...prev,
            [groupId]: { ...prev[groupId], name: value }
        }));
    };

    // --- Filtri dinamici dal DB
    const getAvailablePilastri = ambito => (ambito && exerciseDB[ambito] ? Object.keys(exerciseDB[ambito]) : []);
    const getAvailableEsercizi = (ambito, pilastro) => ambito && pilastro && exerciseDB[ambito]?.[pilastro]
        ? exerciseDB[ambito][pilastro].map(ex => ex.nome)
        : [];

    // --- Salva workout completo su Firestore
    const handleSaveWorkout = async () => {
        if (!workoutName) return alert("Inserisci un nome per il workout");
        if (!selectedUser) return alert("Seleziona un utente");
        const userWorkoutsRef = collection(db, "workouts", selectedUser.id, "userWorkouts");
        try {
            if (initialData?.id) {
                const workoutDocRef = doc(userWorkoutsRef, initialData?.id);
                await setDoc(
                    workoutDocRef,
                    {
                        name: workoutName,
                        groups,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
                alert("Workout modificato correttamente!");
            } else {
                await addDoc(userWorkoutsRef, {
                    name: workoutName,
                    createdAt: serverTimestamp(),
                    groups,
                });
                alert("Workout salvato correttamente!");
            }
            if (onSave) onSave();
        } catch (err) {
            console.error(err);
            alert("Errore salvataggio workout");
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Workout Editor per {selectedUser?.name}</h2>

            <input
                type="text"
                placeholder="Nome workout"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                className="border p-2 rounded w-full mb-4 text-brand"
            />

            {Object.entries(groups).map(([groupId, group]) => (
                <div key={groupId} className="mb-6 rounded-lg p-4 bg-brand">
                    <div className="flex justify-between items-center mb-2">
                        <input
                            type="text"
                            value={group.name}
                            onChange={e => handleChangeGroupName(groupId, e.target.value)}
                            className="font-semibold text-lg border-b border-gray-300 bg-transparent w-full"
                            placeholder={`Nome gruppo ${groupId}`}
                        />
                        <button
                            onClick={() => handleRemoveGroup(groupId)}
                            className="text-red-500 hover:text-red-700 ml-2"
                        >
                            <Trash2 />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {(group.exercises || []).map((ex, idx) => {
                            const isEditing = ex.preSaved || (editingExercise?.groupId === groupId && editingExercise?.index === idx);
                            return (
                                <div
                                    key={idx}
                                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-10 gap-2 p-2 rounded border-brand-light ${ex.preSaved ? "bg-brand-light" : "bg-brand-dark"}`}
                                >
                                    {/* Tipologia */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Tipologia</span>
                                        <input
                                            type="text"
                                            value={ex.Tipologia}
                                            onChange={e => handleChangeExercise(groupId, idx, "Tipologia", e.target.value)}
                                            className="p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    {/* Ambito */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Ambito</span>
                                        <select
                                            value={ex.Ambito}
                                            onChange={e => handleChangeExercise(groupId, idx, "Ambito", e.target.value)}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        >
                                            <option value="">-- Seleziona Ambito --</option>
                                            {Object.keys(exerciseDB).map(amb => <option key={amb} value={amb}>{amb}</option>)}
                                        </select>
                                    </div>

                                    {/* Pilastro */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Pilastro</span>
                                        <select
                                            value={ex.Pilastro}
                                            onChange={e => handleChangeExercise(groupId, idx, "Pilastro", e.target.value)}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing || !ex.Ambito}
                                        >
                                            <option value="">-- Seleziona Pilastro --</option>
                                            {getAvailablePilastri(ex.Ambito).map(pil => <option key={pil} value={pil}>{pil}</option>)}
                                        </select>
                                    </div>

                                    {/* Esercizio */}
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-xs font-semibold">Esercizio</span>
                                        <select
                                            value={ex.Esercizio}
                                            onChange={e => handleChangeExercise(groupId, idx, "Esercizio", e.target.value)}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing || !ex.Pilastro}
                                        >
                                            <option value="">-- Seleziona Esercizio --</option>
                                            {getAvailableEsercizi(ex.Ambito, ex.Pilastro).map(nome => <option key={nome} value={nome}>{nome}</option>)}
                                        </select>
                                    </div>

                                    {/* Set */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Set</span>
                                        <input
                                            type="number"
                                            value={ex.set}
                                            onChange={e => handleChangeExercise(groupId, idx, "set", Number(e.target.value))}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    {/* Volume */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Volume</span>
                                        <input
                                            type="number"
                                            value={ex.Volume}
                                            onChange={e => handleChangeExercise(groupId, idx, "Volume", Number(e.target.value))}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    {/* Unità */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Unità</span>
                                        <select
                                            value={ex.Unita}
                                            onChange={e => handleChangeExercise(groupId, idx, "Unita", e.target.value)}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        >
                                            <option value="SEC">SEC</option>
                                            <option value="REPS">REPS</option>
                                        </select>
                                    </div>

                                    {/* Rest */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Rest</span>
                                        <input
                                            type="number"
                                            value={ex.Rest}
                                            onChange={e => handleChangeExercise(groupId, idx, "Rest", Number(e.target.value))}
                                            className="border p-1 rounded text-brand"
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    {/* Note */}
                                    <div className="flex flex-col col-span-full">
                                        <span className="text-xs font-semibold">Note</span>
                                        <textarea
                                            value={ex.Note}
                                            onChange={e => handleChangeExercise(groupId, idx, "Note", e.target.value)}
                                            disabled={!isEditing}
                                            className="border p-1 rounded w-full text-brand"
                                        />
                                    </div>

                                    {/* Azioni */}
                                    <div className="flex items-center gap-1">
                                        {isEditing ? (
                                            <button
                                                onClick={() => handleSaveExercise(groupId, idx)}
                                                className="bg-green-500 text-white px-2 py-1 rounded flex items-center"
                                            >
                                                <Save size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setEditingExercise({ groupId, index: idx })}
                                                className="bg-blue-500 text-white px-2 py-1 rounded flex items-center"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleRemoveExercise(groupId, idx)}
                                            className="bg-red-500 text-white px-2 py-1 rounded flex items-center"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                </div>
                            );
                        })}

                        <button
                            onClick={() => handleAddExercise(groupId)}
                            className="mt-2 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 flex items-center gap-2"
                        >
                            <Plus size={16} /> Aggiungi esercizio
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={handleAddGroup}
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
                <Plus size={16} /> Aggiungi gruppo
            </button>

            <button
                onClick={handleSaveWorkout}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                Salva Workout su DB
            </button>
        </div>
    );
}
