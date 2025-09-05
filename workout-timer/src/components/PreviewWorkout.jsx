import { React, useEffect, useState } from "react";

export default function PreviewWorkout({ workoutData, onStart, onReload }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

 

  return (
    <div
      className={`p-4 transition-all duration-300 ${isFullScreen
          ? "fixed top-0 left-0 w-full h-full z-50 bg-brand-dark overflow-auto"
          : "max-w-3xl mx-auto"
        }`}
    >       <h1 className="text-2xl font-bold mb-4 text-offwhite">Workout</h1>

      {Object.entries(workoutData).map(([groupId, exercises]) => (
        <div key={groupId} className="bg-brand-dark p-4 text-offwhite rounded shadow mb-4">
          <h2 className="font-semibold mb-2">Gruppo {groupId}</h2>
          <ul className="list-disc list-inside">
            {exercises.map((ex, idx) => (
              <li key={idx} className="mb-1">
                <span className="font-medium">{ex.Esercizio}</span> –
                {ex.set} set – {ex.Volume}{ex.Unita} – Riposo {ex.Rest}s
                <div className="mt-4">
                  <span className="block text-sm font-semibold mb-1">Note aggiuntive:</span>
                  <p className="text-gray-700">{ex.Note || "—"}</p>
                </div>
              </li>
            ))}
          </ul>

        </div>
      ))}

      <div className="flex gap-4 justify-center mt-4">
        {/*   <button
          onClick={onStart}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          Avvia Workout (alfa-version)
        </button> */}

        <button
          onClick={handleFullScreen}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          {isFullScreen ? "Esci Full Screen" : "Full Screen"}        </button>
      </div>
    </div>
  );
}
