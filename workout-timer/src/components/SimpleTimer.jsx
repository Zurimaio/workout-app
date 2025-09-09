import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Dumbbell,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SimpleTimer({ workoutData, onFinish }) {
  const groupIds = Object.keys(workoutData);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);

  const currentGroup = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroup[currentExerciseIndex];

  // countdown timer
  useEffect(() => {
    if (!isRunning) return;

    if (timeRemaining <= 0) {
      // beep più lungo
      playBeep(220, 500);

      if (!isRest && currentExercise.Unita === "SEC") {
        // finito esercizio -> vai a riposo
        setIsRest(true);
        setTimeRemaining(currentExercise.Rest || 30);
      } else if (isRest || currentExercise.Unita === "REPS") {
        // finito riposo o completato REPS -> prossimo esercizio
        goNextExercise();
      }
      return;
    }

     // beep solo negli ultimi 3 secondi
    if (timeRemaining <= 3) {
      playBeep(880, 150);
    }

    const timerId = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeRemaining, isRunning, isRest, currentExercise]);


  // attiva MediaSession API al mount
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Elev8 Timer",
        artist: "Scheda di Allenamento",
        album: "Allenamento",
        artwork: [{ src: "/icons/workout.png", sizes: "512x512", type: "image/png" }],
      });

      navigator.mediaSession.setActionHandler("play", () => setIsRunning(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsRunning(false));
      navigator.mediaSession.setActionHandler("stop", () => onFinish());
    }
  }, [onFinish]);

  const startExercise = () => {
    if (currentExercise.Unita === "SEC") {
      setTimeRemaining(currentExercise.Volume);
      setIsRunning(true);
      setIsRest(false);
    } else {
      setTimeRemaining(null); // esercizi a ripetizioni → no timer
      setIsRunning(false);
      setIsRest(false);
    }
  };

  const startRest = () => {
    setTimeRemaining(currentExercise.Rest || 30);
    setIsRunning(true);
    setIsRest(true);
  };

  const goNext = () => {
    if (isRest) {
      // Passa al prossimo esercizio o set
      if (currentExerciseIndex < currentGroup.length - 1) {
        setCurrentExerciseIndex((i) => i + 1);
      } else if (currentSet < currentExercise.set) {
        setCurrentExerciseIndex(0);
        setCurrentSet((s) => s + 1);
      } else if (currentGroupIndex < groupIds.length - 1) {
        setCurrentGroupIndex((g) => g + 1);
        setCurrentExerciseIndex(0);
        setCurrentSet(1);
      } else {
        onFinish();
      }
      setIsRest(false);
    } else {
      startRest();
    }
  };

  const goPrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((i) => i - 1);
    } else if (currentSet > 1) {
      setCurrentExerciseIndex(currentGroup.length - 1);
      setCurrentSet((s) => s - 1);
    } else if (currentGroupIndex > 0) {
      const prevGroup = workoutData[groupIds[currentGroupIndex - 1]];
      setCurrentGroupIndex((g) => g - 1);
      setCurrentExerciseIndex(prevGroup.length - 1);
      setCurrentSet(1);
    }
    setIsRest(false);
    setTimeRemaining(null);
    setIsRunning(false);
  };

  const handleManualComplete = () => {
    // Per esercizi a REPS → vai subito al riposo
    startRest();
  };

  const handleStop = () => {
    if (window.confirm("Vuoi terminare il workout?")) {
      onFinish();
    }
  };


  function playBeep(frequency = 440, duration = 200) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency; // Hz
  oscillator.start();

  gainNode.gain.setValueAtTime(1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

  oscillator.stop(ctx.currentTime + duration / 1000);
}

  // Avvia automaticamente il primo esercizio al cambio
  useEffect(() => {
    startExercise();
  }, [currentExerciseIndex, currentSet, currentGroupIndex]);

  return (
    <div className="text-center text-white">
      <h2 className="text-xl font-bold mb-2">
        Gruppo {groupIds[currentGroupIndex]} – Set {currentSet}
      </h2>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2 mb-4">
          {isRest ? (
            <>
              <Clock className="w-5 h-5 text-yellow-400" /> Riposo
            </>
          ) : (
            <>
              <Dumbbell className="w-5 h-5 text-green-400" />{" "}
              {currentExercise.Esercizio}
            </>
          )}
        </h3>

        <div className="text-4xl font-bold mb-2">
          {currentExercise.Unita === "SEC" || isRest ? (
            <span>{timeRemaining !== null ? `${timeRemaining}s` : "--"}</span>
          ) : (
            <span>{currentExercise.Volume} reps</span>
          )}
        </div>

        {!isRest && currentExercise.Unita === "REPS" && (
          <button
            onClick={handleManualComplete}
            className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="w-5 h-5" /> Fatto
          </button>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={goPrev}
          className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-full hover:bg-gray-500"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        {isRunning ? (
          <button
            onClick={() => setIsRunning(false)}
            className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500"
          >
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500"
          >
            <Play className="w-6 h-6" />
          </button>
        )}

        <button
          onClick={goNext}
          className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-500"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={handleStop}
          className="bg-red-600 px-6 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-2 mx-auto"
        >
          <XCircle className="w-5 h-5" /> Termina Workout
        </button>
      </div>
    </div>
  );
}
