import React, { useState, useEffect } from "react";
import { FaPlay,FaPause } from "react-icons/fa";
import { MdNavigateNext, MdArrowBackIos } from "react-icons/md";


export default function Timer({ workoutData, onExit }) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRest, setIsRest] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [waitingNextGroup, setWaitingNextGroup] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);

  const [startTime] = useState(() => Date.now());

  const groupIds = Object.keys(workoutData);
  const currentGroup = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroup?.[currentExerciseIndex];

  if (!currentExercise) return <p>Nessun esercizio disponibile.</p>;

  const exerciseDuration = isRest ? currentExercise.Rest : currentExercise.Volume;
  const exerciseProgress =
    currentExercise.Unita === "SEC" || isRest
      ? Math.min(100, ((exerciseDuration - timeLeft) / exerciseDuration) * 100)
      : 0;

  // Timer automatico solo per SEC o Rest
  useEffect(() => {
    if (!currentExercise || isPaused || waitingNextGroup || showSummary) return;

    // Inizializza timeLeft per SEC
    if (timeLeft === null && currentExercise.Unita === "SEC") {
      setTimeLeft(currentExercise.Volume);
      setIsRest(false);
    }

    const tick = () => {
      if (timeLeft === 0) {
        if (!isRest) {
          // Passaggio a riposo
          setIsRest(true);
          setTimeLeft(currentExercise.Rest);
        } else {
          handleAdvance();
        }
      } else {
        setTimeLeft((prev) => prev - 1);
      }
    };

    const timer = setInterval(() => {
      if (!isPaused && (currentExercise.Unita === "SEC" || isRest)) {
        tick();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentExercise,
    timeLeft,
    isRest,
    isPaused,
    waitingNextGroup,
    showSummary,
  ]);

  const handleAdvance = () => {
    // Passa al prossimo esercizio, set o gruppo
    if (currentExerciseIndex < currentGroup.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsRest(false);
      setTimeLeft(currentGroup[currentExerciseIndex + 1].Unita === "SEC"
        ? currentGroup[currentExerciseIndex + 1].Volume
        : null);
    } else if (currentSet < currentExercise.set) {
      setCurrentExerciseIndex(0);
      setCurrentSet(currentSet + 1);
      setIsRest(false);
      setTimeLeft(currentGroup[0].Unita === "SEC" ? currentGroup[0].Volume : null);
    } else if (currentGroupIndex < groupIds.length - 1) {
      setWaitingNextGroup(true);
      setIsPaused(true);
    } else {
      // Fine workout
      const endTime = Date.now();
      setTotalDuration(Math.floor((endTime - startTime) / 1000));

      const summary = Object.entries(workoutData).map(([groupId, exercises]) => {
        const exercisesWithDuration = exercises.map(e => {
          const perSetDuration = e.Unita === "SEC" ? e.Volume + e.Rest : e.Rest;
          return {
            name: e.Esercizio,
            pilastro: e.Pilastro || "",
            sets: e.set,
            volume: e.Volume,
            unit: e.Unita,
            rest: e.Rest,
            totalDuration: perSetDuration * e.set
          };
        });
        const groupTotalDuration = exercisesWithDuration.reduce((acc, ex) => acc + ex.totalDuration, 0);
        return { groupId, exercises: exercisesWithDuration, groupTotalDuration };
      });

      setSummaryData(summary);
      setShowSummary(true);
    }
  };

  const handleFinishReps = () => {
    // Solo per REPS: vai a riposo
    setIsRest(true);
    setTimeLeft(currentExercise.Rest);
  };

  const handleNextExercise = () => {
    if (currentExercise.Unita === "REPS" && !isRest) {
      handleFinishReps();
    } else {
      handleAdvance();
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setIsRest(false);
      setTimeLeft(currentGroup[currentExerciseIndex - 1].Unita === "SEC"
        ? currentGroup[currentExerciseIndex - 1].Volume
        : null);
    }
  };

  const handleNextSet = () => {
    if (currentSet < currentExercise.set) {
      setCurrentSet(currentSet + 1);
      setCurrentExerciseIndex(0);
      setIsRest(false);
      setTimeLeft(currentGroup[0].Unita === "SEC" ? currentGroup[0].Volume : null);
    } else if (currentGroupIndex < groupIds.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setWaitingNextGroup(false);
      setIsPaused(false);
      setTimeLeft(workoutData[groupIds[currentGroupIndex + 1]][0].Unita === "SEC"
        ? workoutData[groupIds[currentGroupIndex + 1]][0].Volume
        : null);
    }
  };

  if (showSummary) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Workout completato! 💪</h1>
        <p className="mb-4">Durata totale: {Math.floor(totalDuration / 60)}m {totalDuration % 60}s</p>
        {summaryData.map(group => (
          <div key={group.groupId} className="bg-gray-100 p-4 rounded shadow mb-4">
            <h2 className="font-semibold mb-2">
              Gruppo {group.groupId} – Durata stimata: {Math.floor(group.groupTotalDuration/60)}m {group.groupTotalDuration%60}s
            </h2>
            <ul className="list-disc list-inside">
              {group.exercises.map(ex => (
                <li key={ex.name}>
                  {ex.name} ({ex.pilastro}) – {ex.sets} set – {ex.volume}{ex.unit} – Riposo {ex.rest}s – Durata stimata: {Math.floor(ex.totalDuration/60)}m {ex.totalDuration%60}s
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
        >
          Chiudi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 text-center max-w-xl mx-auto text-offwhite max-h-xl">
      <h1 className="text-2xl font-bold mb-2">Workout in corso</h1>
      <h2 className="text-xl font-semibold mb-1">
        Gruppo {groupIds[currentGroupIndex]} – Set {currentSet} di {currentExercise.set}
      </h2>
      <h3>
        {currentExercise.Esercizio}
      </h3>

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
            {currentExercise.Unita === "SEC" || isRest ? timeLeft + "s" : ""}
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-300 h-3 rounded mb-4">
        <div
          className="bg-green-500 h-3 rounded"
          style={{ width: `${(currentSet / currentExercise.set) * 100}%` }}
        />
      </div>

      {waitingNextGroup ? (
        <button
          onClick={handleNextSet}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
        >
          Avvia prossimo gruppo
        </button>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {currentExercise.Unita === "REPS" && !isRest && (
            <button
              onClick={handleFinishReps}
              className="px-4 py-2 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
            >
              Fine esercizio / Vai a riposo
            </button>
          )}
          <button
            onClick={handlePrevExercise}
            className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
            disabled={currentExerciseIndex === 0}
          >
            <MdArrowBackIos  />
          </button>
          <button
            onClick={handleNextExercise}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            <MdNavigateNext />
          </button>
          <button
            onClick={handleNextSet}
            className="px-4 py-2 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
          >
            Salta al prossimo set
          </button>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
          >
            {isPaused ? <FaPlay /> : <FaPause />}
          </button>
          
        </div>
      )}
      <div className="relative bottom-0 left-50">
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
        >
          Termina Workout
        </button>
      </div>
    </div>
  );
}
