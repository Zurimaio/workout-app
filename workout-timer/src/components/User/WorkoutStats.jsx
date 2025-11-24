import { BarChart2, Timer, ListChecks } from "lucide-react";

export default function WorkoutStats({ stats }) {
  if (!stats) return null;

  const {
    totalExercises,
    setsTotal,
    estimatedDuration,
    ambitoPercent
  } = stats;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-6 shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-3">Statistiche</h2>

      <div className="grid grid-cols-3 text-center text-gray-300 mb-4">
        <div className="flex flex-col items-center gap-1">
          <ListChecks className="w-5 h-5 text-blue-400" />
          <span className="text-sm">{totalExercises} esercizi</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <BarChart2 className="w-5 h-5 text-purple-400" />
          <span className="text-sm">{setsTotal} set totali</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Timer className="w-5 h-5 text-yellow-300" />
          <span className="text-sm">{estimatedDuration} min</span>
        </div>
      </div>

      {/* Percentuale per ambito */}
      {ambitoPercent && (
        <div className="space-y-1 text-gray-400 text-sm">
          {Object.entries(ambitoPercent).map(([ambito, perc]) => (
            <div key={ambito} className="flex justify-between border-b border-gray-700 pb-1">
              <span>{ambito}</span>
              <span>{perc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
