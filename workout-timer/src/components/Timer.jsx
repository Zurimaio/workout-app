import React, { useEffect } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';

export default function Timer({ workoutData, onExit }) {
  const {
    timerState,
    timeRemaining,
    currentGroup,
    currentExercise,
    currentSet,
    currentGroupIndex,
    isRest,
    groupIds,
    startTime,
    exerciseDuration,
    exerciseProgress,
    handleStartWorkout,
    nextExercise,
    prevExercise,
    skipSet,
    skipGroup,
    handlePauseResume,
    handleStopWorkout
  } = useWorkoutTimer(workoutData);

  // Gestione totale workout finito
  if (!groupIds.length) return <div className="p-4">Nessun workout fornito.</div>;
  if (timerState === "finished") {
    const totalDuration = Math.floor((Date.now() - startTime) / 1000);
    return (
      <div className="p-4 max-w-xl mx-auto text-offwhite">
        <h1 className="text-2xl font-bold mb-4">Workout completato! 💪</h1>
        <p className="mb-4">Durata totale: {Math.floor(totalDuration / 60)}m {totalDuration % 60}s</p>
        <button onClick={onExit} className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition">Chiudi</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brand-dark text-offwhite z-50 flex flex-col items-center justify-center p-4">

      {/* Pulsante Avvio */}
      {timerState === "idle" && (
        <button
          onClick={handleStartWorkout}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-lg font-semibold"
        >
          Avvia Workout
        </button>
      )}

      {/* Countdown preparazione */}
      {timerState === "preparing" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preparati!</h1>
          <p className="text-6xl font-extrabold text-yellow-400">{Math.ceil(timeRemaining)}</p>
        </div>
      )}

      {/* Stato workout attivo */}
      {["running","paused","resting","waiting_next_group"].includes(timerState) && (
        <>
          <h1 className="text-2xl font-bold mb-2">Workout in corso</h1>
          <h2 className="text-lg mb-4">
            Gruppo {groupIds[currentGroupIndex]} – Set {currentSet} di {currentExercise?.Serie || 1}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise?.Esercizio + currentSet + currentGroupIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white text-black p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{isRest ? "Riposo" : currentExercise?.Esercizio}</h3>

              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="15" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={isRest ? "#f59e0b" : "#3b82f6"}
                    strokeWidth="15"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 * (1 - exerciseProgress / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <p className="text-lg font-bold mb-1">{isRest ? "Riposo" : "Work"}</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {currentExercise?.Unita === "SEC" || isRest ? `${Math.ceil(timeRemaining)}s` : `${currentExercise?.Volume} reps`}
                  </p>
                </div>
              </div>

              {/* Prossimo gruppo */}
              {timerState === "waiting_next_group" ? (
                <button
                  onClick={() => skipGroup('next')}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  Avvia prossimo gruppo
                </button>
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-4 mb-4">
                    <button onClick={prevExercise} className="w-12 h-12 flex items-center justify-center bg-gray-400 text-white rounded-full shadow hover:bg-gray-500 transition"
                      disabled={currentExerciseIndex === 0 && currentSet === 1 && currentGroupIndex === 0 && !isRest}>
                      <MdNavigateBefore size={28}/>
                    </button>

                    <button onClick={nextExercise} className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition">
                      <MdNavigateNext size={28}/>
                    </button>

                    <button onClick={() => skipSet('prev')} className="px-3 py-1 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
                      disabled={currentSet === 1}>← Set</button>

                    <button onClick={() => skipSet('next')} className="px-3 py-1 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
                      disabled={currentSet === (currentExercise?.Serie || 1) && currentGroupIndex === groupIds.length-1}>Set →</button>

                    <button onClick={() => skipGroup('prev')} className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                      disabled={currentGroupIndex === 0}>← Gruppo</button>

                    <button onClick={() => skipGroup('next')} className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                      disabled={currentGroupIndex === groupIds.length-1}>Gruppo →</button>

                    <button onClick={handlePauseResume} className="w-12 h-12 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow hover:bg-yellow-600 transition">
                      {timerState === "paused" ? <FaPlay size={22}/> : <FaPause size={22}/>}
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="block text-sm font-semibold mb-1">Note aggiuntive:</span>
                    <p className="text-gray-700">{currentExercise?.Note || "—"}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6">
            <button onClick={handleStopWorkout} className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition flex items-center gap-2 mx-auto">
              <FaStop /> Termina Workout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
