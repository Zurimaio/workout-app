import React, { useState } from "react";

export default function ExerciseForm({ path, onSave, onCancel }) {
  const [value, setValue] = useState(path.nome || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (path.type === "esercizio") {
      onSave(path, { nome: value, unita: path.unita || "REPS" });
    } else {
      onSave(path, value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-gray-100 p-4 rounded">
      <input 
        type="text" 
        value={value} 
        onChange={e => setValue(e.target.value)} 
        className="border p-2 rounded w-full mb-2" 
        placeholder={path.type === "esercizio" ? "Nome Esercizio" : path.type}
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Salva</button>
        <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Annulla</button>
      </div>
    </form>
  );
}
