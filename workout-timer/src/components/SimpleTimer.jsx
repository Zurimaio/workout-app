import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Dumbbell,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SimpleTimer({ workoutData, onFinish, audioCtx, prepTime = 5 }) {
  // PREP_TIME ora è parametrizzabile via prop (default 5s)
  const PREP_TIME = prepTime;
  const groupIds = Object.keys(workoutData || {});
  if (!groupIds.length) return <div>Nessun workout.</div>;

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState(PREP_TIME);
  const [isRunning, setIsRunning] = useState(true); // parte automaticamente in prep
  const [isRest, setIsRest] = useState(false);
  const [isPrep, setIsPrep] = useState(true);

  const currentGroup = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroup?.[currentExerciseIndex];


    useEffect(()=>{console.log(workoutData)})

  // playBeep: aggiorna per fare resume() se audioCtx sospeso
  const playBeep = async (frequency = 440, duration = 200) => {
    if (!audioCtx) return;
    console.log("▶️ Beep", frequency, "Hz - ctx state:", audioCtx?.state);

    try {
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
    } catch (e) {
      // se resume fallisce non rompere il flusso
      // console.warn("audioCtx.resume() fallita:", e);
      return;
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    // piccolo fade out per evitare click
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);

    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
  };

  // --- Quando cambia esercizio / set / gruppo, inizializza PREP ---
  useEffect(() => {
    // protezione se currentExercise non definito
    if (!currentExercise) return;

    if (currentExerciseIndex === 0 && currentSet === 1) {
    setIsPrep(true);
    setIsRest(false);
    setIsRunning(true);
    setTimeRemaining(PREP_TIME);
  } else {
    // no prep: entri direttamente in esercizio
    setIsPrep(false);
    setIsRest(false);
    if (currentExercise.Unita === "SEC") {
      setTimeRemaining(currentExercise.Volume);
      setIsRunning(true);
    } else {
      setTimeRemaining(null);
      setIsRunning(false);
    }
  }
  }, [currentExerciseIndex, currentSet, currentGroupIndex]);

  // Countdown principale (prep / exercise / rest)
  useEffect(() => {
    if (!isRunning) return;
    if (timeRemaining === null) return;

    // tempo finito
    if (timeRemaining <= 0) {
      if (isPrep) {
        // fine preparazione -> avvia esercizio (o mostra REPS)
        playBeep(880, 700); // beep più lungo (es. 700ms, freq 880Hz)
        setIsPrep(false);
        if (!currentExercise) return;
        if (currentExercise.Unita === "SEC") {
          setTimeRemaining(currentExercise.Volume);
          setIsRunning(true);
        } else {
          // REPS: nessun timer per le ripetizioni, attendi interazione utente
          setTimeRemaining(null);
          setIsRunning(false);
        }
        return;
      }

      // fine esercizio / rest
      // beep di fine
      void playBeep(880, 500);

      if (!isRest && currentExercise && currentExercise.Unita === "SEC") {
        // fine esercizio a tempo -> vai a riposo
        setIsRest(true);
        setTimeRemaining(currentExercise.Rest ?? 30);
        setIsRunning(true);
      } else {
        // fine riposo o REPS -> avanza al prossimo esercizio
        goNextExercise();
      }
      return;
    }

    // beep negli ultimi 3 secondi (anche durante prep se lo vuoi)
    if (timeRemaining <= 3 && timeRemaining > 0) {
      void playBeep(880, 120);
    }

    const t = setTimeout(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isRunning, isPrep, isRest, currentExercise]); // dipende da currentExercise per Volume/Rest

  // Funzione che calcola e imposta il prossimo esercizio (dopo rest o REPS)
  const goNextExercise = useCallback(() => {
    // copia stati attuali
    let g = currentGroupIndex;
    let e = currentExerciseIndex + 1;
    let s = currentSet;

    const group = workoutData[groupIds[g]];
    const isEndOfGroup = e >= group.length;
    const isEndOfSet = s >= (currentExercise?.set ?? 1);

    if (isEndOfGroup) {
      if (!isEndOfSet) {
        // nuova ripetizione per lo stesso gruppo
        e = 0;
        s = s + 1;
      } else if (g < groupIds.length - 1) {
        // prossimo gruppo
        g = g + 1;
        e = 0;
        s = 1;
      } else {
        // fine workout
        onFinish();
        return;
      }
    }

    const nextExercise = workoutData[groupIds[g]][e];

    // inizializza PREP o REPS
    if (nextExercise.Unita === "SEC") {
      setIsPrep(true);
      setTimeRemaining(PREP_TIME);
      setIsRunning(true);
      setIsRest(false);
    } else {
      // REPS -> nessun countdown (attendi "Fatto")
      setIsPrep(false);
      setIsRest(false);
      setTimeRemaining(null);
      setIsRunning(false);
    }

    setCurrentGroupIndex(g);
    setCurrentExerciseIndex(e);
    setCurrentSet(s);
  }, [currentGroupIndex, currentExerciseIndex, currentSet, groupIds, workoutData, currentExercise, onFinish, PREP_TIME]);

  // Funzioni manuali next/prev invocate dai pulsanti
  const handleNext = () => {
    if (!isRest && (isPrep || (currentExercise?.Unita !== "SEC" && !isPrep))) {
      // se siamo in prep o su REPS senza rest, interpretalo come "avvia rest"
      setIsRest(true);
      setTimeRemaining(currentExercise?.Rest ?? 30);
      setIsRunning(true);
      return;
    }
    // se siamo in rest -> avanziamo
    goNextExercise();
  };

  const handlePrev = () => {
    // tornare indietro: semplice logica "back one item"
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((i) => i - 1);
      setIsPrep(true);
      setTimeRemaining(PREP_TIME);
      setIsRunning(true);
    } else if (currentSet > 1) {
      const lastIndex = workoutData[groupIds[currentGroupIndex]].length - 1;
      setCurrentSet((s) => s - 1);
      setCurrentExerciseIndex(lastIndex);
      setIsPrep(true);
      setTimeRemaining(PREP_TIME);
      setIsRunning(true);
    } else if (currentGroupIndex > 0) {
      const prevGroupIndex = currentGroupIndex - 1;
      const prevGroup = workoutData[groupIds[prevGroupIndex]];
      setCurrentGroupIndex(prevGroupIndex);
      setCurrentExerciseIndex(prevGroup.length - 1);
      setCurrentSet(1);
      setIsPrep(true);
      setTimeRemaining(PREP_TIME);
      setIsRunning(true);
    }
    setIsRest(false);
  };

  // bottone "Fatto" per REPS
  const handleRepsDone = () => {
    setIsRest(true);
    setTimeRemaining(currentExercise?.Rest ?? 30);
    setIsRunning(true);
  };

  // stop workout
  const handleStop = () => {
    if (window.confirm("Vuoi terminare il workout?")) onFinish();
  };

  // ---------- RENDER ----------
  // Se siamo in PREP mostriamo solo il counter PREP (minimal)
  if (isPrep) {
    return (
      <div className="text-center text-white">
        <h2 className="text-xl font-bold mb-4">Preparati</h2>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-4">
          <div className="text-6xl font-extrabold">
            {timeRemaining !== null ? `${timeRemaining}s` : "--"}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {/** Play/Pause utili anche nella prep */}
          {isRunning ? (
            <button onClick={() => setIsRunning(false)} className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
              <Pause className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setIsRunning(true)} className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="mt-6">
          <button onClick={handleStop} className="bg-red-600 px-6 py-2 rounded-lg text-white">Annulla</button>
        </div>
      </div>
    );
  }


  // Altrimenti mostriamo la UI dell'esercizio / rest
  return (
    <div className="text-center text-white">
      <h2 className="text-xl font-bold mb-2">
        Gruppo {groupIds[currentGroupIndex]} – Set {currentSet} 
      </h2>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-4">
        <h3 className="text-lg font-semibold mb-4">
          {isRest ? (
            <>
              <Clock className="inline-block w-5 h-5 text-yellow-400 mr-2" /> Riposo
            </>
          ) : (
            <>
              <Dumbbell className="inline-block w-5 h-5 text-green-400 mr-2" /> {currentExercise?.Esercizio}
            </>
          )}
        </h3>

        <div className="text-4xl font-bold mb-2">
          {currentExercise?.Unita === "SEC" || isRest ? (
            <span>{timeRemaining !== null ? `${timeRemaining}s` : "--"}</span>
          ) : (
            <span>{currentExercise?.Volume} reps</span>
          )}
        </div>

        {!isRest && currentExercise?.Unita === "REPS" && (
          <button onClick={handleRepsDone} className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg">Fatto</button>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={handlePrev} className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
          <SkipBack className="w-6 h-6" />
        </button>

        {isRunning ? (
          <button onClick={() => setIsRunning(false)} className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={() => setIsRunning(true)} className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6" />
          </button>
        )}

        <button onClick={handleNext} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-6">
        <button onClick={handleStop} className="bg-red-600 px-6 py-2 rounded-lg text-white">Termina Workout</button>
      </div>
    </div>
  );
}
