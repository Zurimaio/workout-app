import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play, Pause, SkipForward, SkipBack, Dumbbell, Clock,
  CheckCircle, Maximize, Minimize,
} from "lucide-react";
import { useWakeLock } from "../utils/useWaveLock";
import { getGroupTag } from "../style/getGroupTag";
import { requestNotificationPermission, notify } from "../utils/notify";

export default function SimpleTimer({ workoutData, onFinish, audioCtx, prepTime = 10 }) {
  const PREP_TIME = prepTime;
  const groupIds = Object.keys(workoutData || {});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isPrep, setIsPrep] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasAgreedToStart, setHasAgreedToStart] = useState(false);
  const [showWorkoutEnd, setShowWorkoutEnd] = useState(false);
  const [isExercisePhase, setIsExercisePhase] = useState(false);

  const currentGroupData = workoutData[groupIds[currentGroupIndex]];
  const currentGroupName = workoutData.type;
  const currentExercise = currentGroupData?.[currentExerciseIndex];
  const currentTotalSet = currentExercise?.set || 1;


  // --- Refs per background handling ---
  const lastTickRef = useRef(Date.now());
  const visibilityRef = useRef(document.visibilityState);
  const rafRef = useRef(null);
  // --- AudioContext globale ---
  const audioCtxRef = useRef(null);



  useWakeLock(isRunning);

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);


      const checkWorkoutCompletion = () => {
  const groupExercises = workoutData[groupIds[currentGroupIndex]];
  const lastExercise = currentExerciseIndex === groupExercises.length - 1;
  const lastSet = currentSet === currentTotalSet;

  if (lastExercise && lastSet) {
    setShowWorkoutEnd(true);
    setIsRunning(false);

    const sessionData = {
      date: new Date().toISOString(),
      groupName: groupIds[currentGroupIndex],
      setsCompleted: currentTotalSet,
      exercises: groupExercises,
    };
    localStorage.setItem("lastWorkoutSession", JSON.stringify(sessionData));

    playBeep(660, 400);
    playBeep(440, 400);
    vibrate([200, 100, 200]);
  }
};

  useEffect(() => {
    // Inizializzazione sicura
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Riattiva l’audio se sospeso
        audioCtxRef.current.resume().catch(() => { });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // === PATCH BACKGROUND FIX ===
  useEffect(() => {
    if (!isRunning || timeRemaining === null) return;

    lastTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta > 0) {
        setTimeRemaining((prev) => {
          if (prev === null) return prev;
          const next = prev - delta;
          if (next <= 0) {
            finishCurrentPhase();
            return 0;
          }
          return next;
        });
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, timeRemaining]);

  // === PATCH BACKGROUND FIX (Visibility + Resume) ===

  useEffect(() => {
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => { });
      }
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("touchstart", unlockAudio);
    document.addEventListener("click", unlockAudio);

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Quando torna in foreground
      if (visibilityRef.current === "hidden" && document.visibilityState === "visible" && isRunning) {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta > 0) {
          setTimeRemaining((prev) => {
            if (prev === null) return prev;
            const next = prev - delta;
            if (next <= 0) {
              finishCurrentPhase();
              return 0;
            }
            return next;
          });
        }
        lastTickRef.current = now;
      }
      visibilityRef.current = document.visibilityState;


    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isRunning]);
  // === END PATCH ===


  // Beep intermedio
  const playIntermediateBeep = () => {
    playBeep(660, 150); // frequenza neutra, durata breve
    vibrate(150);
  };

  const playBeep = async (frequency = 440, duration = 200) => {

    const audioCtx = audioCtxRef.current;

    if (!audioCtx) return;
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch { }
    if (audioCtx.state !== "running") return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { } };
  };

  const vibrate = (pattern = [200]) => { if ("vibrate" in navigator) navigator.vibrate(pattern); };

  // === PATCH: centralizziamo il cambio fase per background + tick ===
  const finishCurrentPhase = useCallback(() => {
    if (isPrep) {
      // Fine preparazione → inizio esercizio
      playBeep(1000, 700);
      vibrate(300);
      startExercise();

    } else if (isRest) {
      // Fine riposo → prossimo esercizio o set
      playBeep(1200, 900);
      vibrate(300);
      goNextExercise();
    } else if (currentExercise?.Unita === "SEC") {
      setIsExercisePhase(false);
      // Fine esercizio a tempo → parte il riposo
      startRest();
    }
    // ❌ Rimosso il ramo per REP — ora aspetta il click "Fatto"
  }, [isPrep, isRest, currentExercise]);


  // Beep negli ultimi secondi
  useEffect(() => {
    if (!isRunning || timeRemaining === null) return;
    if (timeRemaining > 0 && timeRemaining <= 3) {
      playBeep(880, 120);
      vibrate(100);
    }
    // Beep intermedio a 10 secondi
    if (timeRemaining === 10) {
      playIntermediateBeep();
    }
  }, [timeRemaining, isRunning]);

  // --- Fasi ---
  const startPrep = () => {
    setIsPrep(true); setIsRest(false);
    setTimeRemaining(PREP_TIME);
    setIsRunning(true);
  };

  const startExercise = () => {
    setIsPrep(false);
    setIsRest(false);
    setIsExercisePhase(true);
    if (!currentExercise) return;

    console.log(currentExercise);

    if (currentExercise.Unita === "SEC") {
      // Esercizio a tempo → parte il countdown
      setTimeRemaining(currentExercise.Volume);
      setIsRunning(true);
    } else if (currentExercise.Unita === "REPS") {
      // Esercizio a ripetizioni → mostra solo il numero, niente timer
      setTimeRemaining(null);
      setIsRunning(false); // Attende il click "Fatto"
    }
  };


  const startRest = () => {
    setIsPrep(false); setIsRest(true);
    setTimeRemaining(currentExercise?.Rest ?? 30);
    setIsRunning(true);
    setIsExercisePhase(false);

    playBeep(880, 500);
    vibrate(500);
  };


  useEffect(() => {
  if (isIOS() && !hasAgreedToStart) return;
  setIsPrep(true);
  setTimeRemaining(PREP_TIME);
  setIsRunning(true);
  setIsRest(false);
}, [hasAgreedToStart, PREP_TIME]);


const handleRepsDone = () => {
    // Dopo aver fatto le ripetizioni, parte sempre il riposo
    const restTime = currentExercise?.Rest ?? 30;
    setIsRest(true);
    setIsPrep(false);
    setTimeRemaining(restTime);
    setIsRunning(true);

    // Suono di passaggio REP → RIPOSO
    playBeep(750, 300);
    vibrate(200);
  };

  // --- Navigazione esercizi ---
const goNextExercise = useCallback(() => {
  if (!currentExercise) return;

  let g = currentGroupIndex;
  let e = currentExerciseIndex;
  let s = currentSet;

  const group = workoutData[groupIds[g]];
  const totalSets = currentExercise?.set ?? 1;
  const isLastExercise = e >= group.length - 1;
  const isLastSet = s >= totalSets;

  // Controlla se il workout è completo
  if (isLastExercise && isLastSet) {
    checkWorkoutCompletion();
    return;
  }

  // Se siamo in fase di riposo, passiamo al prossimo esercizio o set
  if (isRest) {
    if (isLastExercise) {
      if (!isLastSet) {
        // Passa al prossimo set, ricomincia dal primo esercizio
        e = 0;
        s++;
      } else if (g < groupIds.length - 1) {
        // Passa al prossimo gruppo
        g++;
        e = 0;
        s = 1;
      }
    } else {
      // Prossimo esercizio nello stesso set
      e++;
    }

    const nextExercise = workoutData[groupIds[g]][e];

    // Tutti gli esercizi successivi partono direttamente in work
    setIsPrep(false);
    setIsRest(false);
    setIsExercisePhase(true);

    if (nextExercise.Unita === "SEC") {
      setTimeRemaining(nextExercise.Volume);
      setIsRunning(true);
    } else if (nextExercise.Unita === "REPS") {
      setTimeRemaining(null);
      setIsRunning(false); // aspetta click "Fatto"
    }

    setCurrentGroupIndex(g);
    setCurrentExerciseIndex(e);
    setCurrentSet(s);
  } else if (currentExercise.Unita === "REPS") {
    // Se l’esercizio è REP e non siamo in riposo → lo segniamo come completato
    handleRepsDone();
  } else {
    // Altrimenti gestione classica per esercizi a tempo → parte riposo
    startRest();
  }
}, [
  isRest,
  currentExercise,
  currentGroupIndex,
  currentExerciseIndex,
  currentSet,
  workoutData,
  groupIds,
  checkWorkoutCompletion,
  handleRepsDone,
  startRest,
]);


// --- Funzione di salvataggio sessione ---
const saveSession = () => {
  const sessionData = {
    date: new Date().toISOString(),
    groupName: groupIds[currentGroupIndex],
    setsCompleted: currentExercise?.set ?? 1,
    exercises: workoutData[groupIds[currentGroupIndex]],
  };
  localStorage.setItem("lastWorkoutSession", JSON.stringify(sessionData));
  playBeep(660, 400);
  playBeep(440, 400);
  vibrate([200, 100, 200]);
};

  // --- Altre funzioni UI ---
  const goPrevExercise = useCallback(() => {
    if (!currentExercise) return;
    if (isRest) { setIsRest(false); setTimeRemaining(currentExercise.Volume); setIsRunning(true); return; }

    let g = currentGroupIndex, e = currentExerciseIndex - 1, s = currentSet;
    if (e < 0) {
      if (s > 1) { s--; e = workoutData[groupIds[g]].length - 1; }
      else if (g > 0) { g--; e = workoutData[groupIds[g]].length - 1; s = 1; }
      else return;
    }
    const prevExercise = workoutData[groupIds[g]][e];
    if (prevExercise.Unita === "SEC") { setIsRest(true); setTimeRemaining(prevExercise.Rest ?? 30); setIsRunning(true); setIsPrep(false); }
    else { setIsPrep(true); setTimeRemaining(PREP_TIME); setIsRest(false); setIsRunning(true); }
    setCurrentGroupIndex(g); setCurrentExerciseIndex(e); setCurrentSet(s);
  }, [currentExercise, currentGroupIndex, currentExerciseIndex, currentSet, workoutData, groupIds, PREP_TIME, isRest]);

  

  const handleStop = () => { if (window.confirm("Vuoi terminare il workout?")) onFinish(); };
  const toggleFullScreen = () => setIsFullScreen(prev => !prev);






  // --- UI ---
  const showNoWorkout = groupIds.length === 0;
  const showIOSStart = isIOS() && !hasAgreedToStart;

  if (showIOSStart) {
    return (
      <div className="text-center text-white flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Attenzione!</h2>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
          <p className="text-lg mb-4">
            Per evitare che lo schermo si spenga durante l'allenamento, disattiva il blocco automatico.
          </p>
          <p className="text-sm text-gray-400">
            Vai su Impostazioni {'>'} Schermo e Luminosità {'>'} Blocco automatico e seleziona Mai.
          </p>
        </div>
        <button
          onClick={() => {
            setHasAgreedToStart(true);
            setIsPrep(true);
            setTimeRemaining(PREP_TIME);
            setIsRunning(true);
            setIsRest(false);
          }}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          OK, Inizia Workout
        </button>
      </div>
    );
  }


  
  return (
    <div
      className={`text-center text-white p-4 transition-all duration-500 ${isFullScreen
        ? "fixed top-0 left-0 w-full h-screen bg-black z-50 flex flex-col justify-center items-center"
        : ""
        }`}
    >
      {/* --- Bottone Fullscreen --- */}
      <button
        onClick={toggleFullScreen}
        className="fixed top-4 right-4 bg-gray-700 rounded-full p-2 z-50"
      >
        {isFullScreen ? (
          <Minimize className="w-6 h-6 text-white" />
        ) : (
          <Maximize className="w-6 h-6 text-white" />
        )}
      </button>

      <div
        className={`${isFullScreen
          ? "w-full h-full flex flex-col justify-center items-center rounded-none mb-0"
          : "w-full max-w-sm mx-auto"
          }`}
      >


        {/* --- TIMER CARD --- */}
        <div
          className={`transition-all duration-500
    ${isPrep ? "bg-purple-700" : isRest ? "bg-blue-700" : "bg-green-700"}
    ${isFullScreen ? "w-full h-full flex flex-col justify-center items-center rounded-none mb-0 p-12" : "p-6 rounded-2xl shadow-lg mb-4 w-full max-w-sm mx-auto"}
  `}
        >
          {/* Indicatore set */}
          {isExercisePhase && (
            <div className="text-2xl mt-2 text-gray-200">
              Set {currentSet} / {currentTotalSet}
            </div>
          )}


          {/* Titolo fase */}
          <h2 className={`font-bold mb-4 ${isFullScreen ? "text-4xl" : "text-2xl"}`}>
            {isPrep ? "Preparati" : isRest ? "Riposo" : currentExercise?.Esercizio || "Lavoro"}
          </h2>

          {/* Timer numerico */}
          <div className={`font-extrabold tracking-widest ${isFullScreen ? "text-9xl" : "text-7xl"}`}>
            {isPrep
              ? `${timeRemaining}s`                             // Fase di preparazione → countdown
              : isRest
                ? `${timeRemaining}s`                           // Fase di riposo → countdown del riposo
                : currentExercise?.Unita === "REPS"
                  ? `${currentExercise.Volume} reps`            // Fase di lavoro REP → mostra solo reps
                  : timeRemaining !== null
                    ? `${timeRemaining}s`                       // Fase di lavoro SEC → countdown
                    : ""}
          </div>



          {/* --- TASTO "FATTO" per esercizi a ripetizioni --- */}
          {!isPrep && !isRest && isExercisePhase && currentExercise.Unita === "REPS" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRepsDone}
                className="bg-green-500 text-white px-8 py-3 rounded-xl text-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-green-600 transition"
              >
                <CheckCircle className="w-6 h-6" />
                Fatto
              </button>
            </div>
          )}
          {/* Indicatore di fase */}
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


        {/* --- CONTROLLI --- */}
        <div className="flex justify-center gap-3">
          <button
            onClick={goPrevExercise}
            className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {isRunning ? (
            <button
              onClick={() => setIsRunning(false)}
              className="w-14 h-14 bg-yellow-600 rounded-full flex items-center justify-center"
            >
              <Pause className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(true)}
              className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center"
            >
              <Play className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={goNextExercise}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

 {showWorkoutEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center p-6 z-50">
          <h2 className="text-4xl font-bold text-green-400 mb-4">
            Workout completato! 🎉
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Hai completato tutti i {currentTotalSet} set del gruppo {groupIds[currentGroupIndex]}.
          </p>
          <button
            onClick={onFinish}
            className="bg-green-600 px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-md hover:bg-green-700"
          >
            Termina sessione
          </button>
        </div>
      )}


      </div>

     
    </div>

   
  );

}
