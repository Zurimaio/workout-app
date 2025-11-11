// --- TimerCard.jsx ---
import React from "react";
import { CheckCircle } from "lucide-react";

export function TimerCard({
  isPrep,
  isRest,
  isExercisePhase,
  currentExercise,
  timeRemaining,
  currentSet,
  totalSets,
  onRepsDone,
  isFullScreen,
}) {
  const title = isPrep ? "Preparati" : isRest ? "Riposo" : currentExercise?.Esercizio || "Lavoro";

  return (
    <div
      className={`transition-all duration-500
        ${isPrep ? "bg-purple-700" : isRest ? "bg-blue-700" : "bg-green-700"}
        ${isFullScreen ? "w-full h-full flex flex-col justify-center items-center rounded-none mb-0 p-12" : "p-6 rounded-2xl shadow-lg mb-4 w-full max-w-sm mx-auto"}
      `}
    >
      {isExercisePhase && (
        <div className="text-2xl mt-2 text-gray-200">
          Set {currentSet} / {totalSets}
        </div>
      )}

      <h2 className={`font-bold mb-4 ${isFullScreen ? "text-4xl" : "text-2xl"}`}>{title}</h2>

      <div className={`font-extrabold tracking-widest ${isFullScreen ? "text-9xl" : "text-7xl"}`}>
        {isPrep || isRest
          ? `${timeRemaining}s`
          : currentExercise?.Unita === "REPS"
          ? `${currentExercise.Volume} reps`
          : timeRemaining !== null
          ? `${timeRemaining}s`
          : ""}
      </div>

      {!isPrep && !isRest && isExercisePhase && currentExercise?.Unita === "REPS" && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onRepsDone}
            className="bg-green-500 text-white px-8 py-3 rounded-xl text-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-green-600 transition"
          >
            <CheckCircle className="w-6 h-6" /> Fatto
          </button>
        </div>
      )}

      <div className="mt-4">
        {isPrep ? (
          <span className="text-purple-300 text-lg">Inizia tra poco...</span>
        ) : isRest ? (
          <span className="text-blue-300 text-lg">Recupera il fiato</span>
        ) : (
          <span className="text-green-300 text-lg">Spingi forte!</span>
        )}
      </div>
    </div>
  );
}
