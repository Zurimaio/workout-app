import React, { useState } from "react";

export default function ExerciseList({ exerciseDB, setExerciseDB }) {
  const [expandedAmbito, setExpandedAmbito] = useState(null);
  const [expandedPilastro, setExpandedPilastro] = useState({});

  const toggleAmbito = (ambito) => {
    setExpandedAmbito(expandedAmbito === ambito ? null : ambito);
  };

  const togglePilastro = (ambito, pilastro) => {
    setExpandedPilastro({
      ...expandedPilastro,
      [ambito]: expandedPilastro[ambito] === pilastro ? null : pilastro
    });
  };

  const handleExerciseChange = (ambito, pilastro, idx, value) => {
    const updatedDB = { ...exerciseDB };
    updatedDB[ambito][pilastro][idx].nome = value;
    setExerciseDB(updatedDB);
  };

  const addExercise = (ambito, pilastro) => {
    const updatedDB = { ...exerciseDB };
    if (!updatedDB[ambito][pilastro]) updatedDB[ambito][pilastro] = [];
    updatedDB[ambito][pilastro].push({ nome: "" });
    setExerciseDB(updatedDB);
    setExpandedAmbito(ambito);
    setExpandedPilastro({ ...expandedPilastro, [ambito]: pilastro });
  };

  return (
    <div className="space-y-4">
      {Object.keys(exerciseDB).map((ambito) => (
        <div key={ambito} className="border rounded shadow p-2 bg-white">
          <div
            className="font-bold cursor-pointer flex justify-between items-center"
            onClick={() => toggleAmbito(ambito)}
          >
            {ambito} <span>{expandedAmbito === ambito ? "▼" : "▶"}</span>
          </div>

          {expandedAmbito === ambito && (
            <div className="pl-4 mt-2 space-y-2">
              {Object.keys(exerciseDB[ambito]).map((pilastro) => (
                <div key={pilastro} className="border rounded p-2 bg-gray-50">
                  <div
                    className="font-semibold cursor-pointer flex justify-between items-center"
                    onClick={() => togglePilastro(ambito, pilastro)}
                  >
                    {pilastro} <span>{expandedPilastro[ambito] === pilastro ? "▼" : "▶"}</span>
                  </div>

                  {expandedPilastro[ambito] === pilastro && (
                    <div className="pl-4 mt-1 space-y-2">
                      <ul className="space-y-2">
                        {exerciseDB[ambito][pilastro].map((exercise, idx) => (
                          <li key={idx}>
                            <input
                              type="text"
                              value={exercise.nome}
                              onChange={(e) =>
                                handleExerciseChange(ambito, pilastro, idx, e.target.value)
                              }
                              className="border px-2 py-1 rounded w-64"
                            />
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => addExercise(ambito, pilastro)}
                        className="mt-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        + Aggiungi esercizio
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
