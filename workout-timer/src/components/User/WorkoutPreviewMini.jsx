import React from "react";
import { Dumbbell } from "lucide-react";

export default function WorkoutPreviewMini({ workoutData }) {
  if (!workoutData?.groups) return null;

  // ---- Raggruppamento per Ambito ----
  const ambitoStats = {};

  Object.values(workoutData.groups).forEach(group => {
    const exercises = group.exercises || [];

    exercises.forEach(ex => {
      const ambito = ex.Ambito || "SENZA_AMBITO";

      if (!ambitoStats[ambito]) {
        ambitoStats[ambito] = {
          exercises: 0,
          sets: 0,
          volume: 0,
        };
      }

      ambitoStats[ambito].exercises += 1;
      ambitoStats[ambito].sets += ex.set || 1;

      // Volume totale (con fallback)
      if (typeof ex.Volume === "number") {
        ambitoStats[ambito].volume += ex.Volume;
      }
    });
  });

  return (
    <div className="bg-gray-900 p-5 rounded-xl shadow-lg mb-6">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-green-400" />
        Anteprima per Ambito
      </h3>

      <div className="space-y-2">
        {Object.entries(ambitoStats).map(([ambito, data]) => (
          <div
            key={ambito}
            className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="text-gray-200 font-medium">
                {ambito.replace("_", " ")}
              </span>
              <span className="text-gray-500 text-xs">
                {data.sets} set totali — Volume {data.volume}
              </span>
            </div>

            <span className="text-gray-400 text-sm">
              {data.exercises} esercizi
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
