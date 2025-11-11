// --- WorkoutEndModal.jsx ---
import React from "react";

export function WorkoutEndModal({ show, currentTotalSet, currentGroupName, onFinish }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center p-6 z-50">
      <h2 className="text-4xl font-bold text-green-400 mb-4">Workout completato! 🎉</h2>
      <p className="text-lg text-gray-300 mb-6">
        Hai completato tutti i {currentTotalSet} set del gruppo {currentGroupName}.
      </p>
      <button
        onClick={onFinish}
        className="bg-green-600 px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-md hover:bg-green-700"
      >
        Termina sessione
      </button>
    </div>
  );
}
