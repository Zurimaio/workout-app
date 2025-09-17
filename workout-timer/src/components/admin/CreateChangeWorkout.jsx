import React, { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

export default function CreateChangeWorkout({ selectedUser, initialData = null, onGenerated }) {
  // Stato: se ho dati iniziali li uso, altrimenti vuoti
  const [name, setName] = useState(initialData?.name || "");
  
  
  const normalizeGroups = (groupsObj = {}) => {
  console.log("Esercizi in arrivo: ", groupsObj)
  const normalized = {};
  for (const [id, group] of Object.entries(groupsObj)) {
    normalized[id] = {
    ...group,
      // prendi gli esercizi se ci sono, altrimenti fallback []
      exercises: Array.isArray(group.exercises) ? group.exercises : []
    };
  }
  return normalized;
};
  
const [groups, setGroups] = useState(() => normalizeGroups(initialData?.groups));
  
  // Aggiungi un nuovo gruppo
  const handleAddGroup = () => {
    const newId = Object.keys(groups).length + 1;
    setGroups({
      ...groups,
      [newId]: { exercises: [] }
    });
  };

  // Elimina un gruppo
  const handleRemoveGroup = (groupId) => {
    const updated = { ...groups };
    delete updated[groupId];
    setGroups(updated);
  };

  // Aggiungi esercizio dentro un gruppo
  const handleAddExercise = (groupId) => {
    const updated = { ...groups };
    updated[groupId].exercises.push({
      Esercizio: "",
      set: 3,
      Volume: 10,
      Unita: "REPS",
      Rest: 60,
      Note: ""
    });
    setGroups(updated);
  };

  // Modifica campo esercizio
  const handleChangeExercise = (groupId, index, field, value) => {
    const updated = { ...groups };
    updated[groupId].exercises[index][field] = value;
    setGroups(updated);
  };

  // Rimuovi esercizio
  const handleRemoveExercise = (groupId, index) => {
    const updated = { ...groups };
    updated[groupId].exercises.splice(index, 1);
    setGroups(updated);
  };

  // Salva
  const handleSave = () => {
    const workout = { name, groups };
    onGenerated(workout);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        {initialData ? "✏️ Modifica Workout" : "🆕 Crea Nuovo Workout"}
      </h2>

      {/* Nome workout */}
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Nome Workout</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Inserisci nome..."
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Gruppi */}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupId, group]) => (
          <div key={groupId} className="bg-gray-800 p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-green-400">Gruppo {groupId}</h3>
              <button
                onClick={() => handleRemoveGroup(groupId)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {group.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 p-3 rounded-lg grid grid-cols-2 md:grid-cols-6 gap-2"
                >
                  <input
                    type="text"
                    placeholder="Esercizio"
                    value={ex.Esercizio}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "Esercizio", e.target.value)
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Set"
                    value={ex.set}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "set", Number(e.target.value))
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Volume"
                    value={ex.Volume}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "Volume", Number(e.target.value))
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  />
                  <select
                    value={ex.Unita}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "Unita", e.target.value)
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  >
                    <option value="REPS">REPS</option>
                    <option value="SEC">SEC</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Riposo"
                    value={ex.Rest}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "Rest", Number(e.target.value))
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  />
                  <input
                    type="text"
                    placeholder="Note"
                    value={ex.Note}
                    onChange={(e) =>
                      handleChangeExercise(groupId, idx, "Note", e.target.value)
                    }
                    className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                  />
                  <button
                    onClick={() => handleRemoveExercise(groupId, idx)}
                    className="col-span-2 md:col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddExercise(groupId)}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} /> Aggiungi esercizio
            </button>
          </div>
        ))}
      </div>

      {/* Aggiungi gruppo */}
      <div className="mt-6">
        <button
          onClick={handleAddGroup}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={18} /> Aggiungi gruppo
        </button>
      </div>

      {/* Salva */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
        >
          <Save size={18} /> {initialData ? "Aggiorna Workout" : "Salva Workout"}
        </button>
      </div>
    </div>
  );
}
