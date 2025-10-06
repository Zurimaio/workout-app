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
  Maximize,
  Minimize,
} from "lucide-react";

import { useWakeLock } from "../utils/useWaveLock";
import { requestNotificationPermission, notify } from "../utils/notify";
import { getGroupTag } from "../style/getGroupTag";


export default function SimpleTimer({ workoutData, onFinish, audioCtx, prepTime = 10 }) {
  const PREP_TIME = prepTime;

  const groupIds = Object.keys(workoutData || {});
  const currentGroup = workoutData[groupIds[0]];
  const currentGroupName = workoutData.type;
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isPrep, setIsPrep] = useState(false);

  const currentGroupData = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroupData?.[currentExerciseIndex];
  const currentTotalSet = currentExercise?.set || 1;


  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasAgreedToStart, setHasAgreedToStart] = useState(false);

  useWakeLock(isRunning);

  useEffect(() => {
    console.log(currentGroupData)
  }, []);

  useEffect(() => {
    if (!audioCtx) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (audioCtx.state === "suspended") {
          audioCtx.resume()
            .then(() => console.log("🔊 AudioContext ripreso dopo background"))
            .catch(err => console.error("Errore resume AudioContext:", err));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [audioCtx]);

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Funzione beep
  const playBeep = async (frequency = 440, duration = 200) => {
    if (!audioCtx) return;
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch (e) { }
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
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) { } };
  };

  const vibrate = (pattern = [200]) => { if ("vibrate" in navigator) { navigator.vibrate(pattern); } };

  // Countdown
  useEffect(() => {
    if (!isRunning || timeRemaining === null) return;

    const tick = () => setTimeRemaining(prev => (prev !== null ? prev - 1 : prev));

    if (timeRemaining > 0) {
      // beep negli ultimi 3 secondi
      if (timeRemaining <= 3) {
        playBeep(880, 120);
        vibrate(100)
      }
      const t = setTimeout(tick, 1000);
      return () => clearTimeout(t);
    }

    // tempo finito
    const finishCurrentPhase = () => {
      if (isPrep) {
        startExercise();
      } else if (!isRest && currentExercise?.Unita === "SEC") {
        startRest();
      } else {
        goNextExercise();
      }
    };

    finishCurrentPhase();

  }, [timeRemaining, isRunning, isPrep, isRest, currentExercise]);



  // Funzioni helper
  const startPrep = () => {
    setIsPrep(true);
    setIsRest(false);
    setTimeRemaining(PREP_TIME);
    setIsRunning(true);
    // notify("Preparati!", "Il prossimo esercizio sta per iniziare");

  };

  const startExercise = () => {
    setIsPrep(false);
    setIsRest(false);

    if (!currentExercise) return;

    if (currentExercise.Unita === "SEC") {
      setTimeRemaining(currentExercise.Volume);
      setIsRunning(true);
    } else {
      // REPS
      setTimeRemaining(null);
      setIsRunning(false);
    }

    playBeep(880, 700);
    vibrate(700)
    // notify("Esercizio", currentExercise.Esercizio || "Vai!");

  };

  const startRest = () => {
    setIsPrep(false);
    setIsRest(true);
    setTimeRemaining(currentExercise?.Rest ?? 30);
    setIsRunning(true);
    playBeep(880, 500);
    vibrate(500);
    // notify("Riposo", "Prenditi una pausa");

  };

  // NEXT / PREV Exercise
  const goNextExercise = useCallback(() => {
    if (!currentExercise) return;

    if (!isRest && currentExercise.Unita === "SEC") {
      setIsRest(true);
      setTimeRemaining(currentExercise.Rest ?? 30);
      setIsRunning(true);
      return;
    }

    let g = currentGroupIndex;
    let e = currentExerciseIndex + 1;
    let s = currentSet;

    const group = workoutData[groupIds[g]];
    const isEndOfGroup = e >= group.length;
    const isEndOfSet = s >= (currentExercise?.set ?? 1);

    if (isEndOfGroup) {
      if (!isEndOfSet) { e = 0; s++; }
      else if (g < groupIds.length - 1) { g++; e = 0; s = 1; }
      else { onFinish(); return; }
    }

    const nextExercise = workoutData[groupIds[g]][e];
    if (nextExercise.Unita === "SEC" && e === 0 && s === 1) {
      setIsPrep(true); setTimeRemaining(PREP_TIME); setIsRunning(true); setIsRest(false);
    } else {
      setIsPrep(false); setIsRest(false);
      setTimeRemaining(nextExercise.Unita === "SEC" ? nextExercise.Volume : null);
      setIsRunning(nextExercise.Unita === "SEC");
    }

    setCurrentGroupIndex(g); setCurrentExerciseIndex(e); setCurrentSet(s);

  }, [currentExercise, currentGroupIndex, currentExerciseIndex, currentSet, workoutData, groupIds, PREP_TIME, isRest, onFinish]);

  const goPrevExercise = useCallback(() => {
    if (!currentExercise) return;

    if (isRest) { setIsRest(false); setTimeRemaining(currentExercise.Volume); setIsRunning(true); return; }

    let g = currentGroupIndex;
    let e = currentExerciseIndex - 1;
    let s = currentSet;

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

  const handleRepsDone = () => { setIsRest(true); setTimeRemaining(currentExercise?.Rest ?? 30); setIsRunning(true); };
  const handleStop = () => { if (window.confirm("Vuoi terminare il workout?")) onFinish(); };
  const toggleFullScreen = () => setIsFullScreen(prev => !prev);

  // --- Inizio prep automatico se non iOS o se utente ha accettato ---
  useEffect(() => {
    if (isIOS() && !hasAgreedToStart) return;
    setIsPrep(true); setTimeRemaining(PREP_TIME); setIsRunning(true); setIsRest(false);
  }, [hasAgreedToStart, PREP_TIME]);

  // --- BOOLEANI DI RENDER ---
  const showNoWorkout = groupIds.length === 0;
  const showIOSStart = isIOS() && !hasAgreedToStart;
  const showPrepUI = isPrep && !showIOSStart && !showNoWorkout;


  // Render iOS/Start
  if (isIOS() && !hasAgreedToStart) {
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


  // --- JSX UNICO ---
  return (
    <div className={`text-center text-white p-4 transition-all duration-500 ease-in-out ${isFullScreen ? 'fixed top-0 left-0 w-full h-screen bg-black z-50 flex flex-col justify-center items-center' : ''}`}>
      {/* Fullscreen toggle sempre visibile */}
      <button
        onClick={toggleFullScreen}
        className={`fixed top-4 right-4 bg-gray-700 rounded-full p-2 z-50`}
      >
        {isFullScreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
      </button>

      <div className={`${isFullScreen ? 'w-full h-full flex flex-col justify-center items-center' : 'w-full max-w-sm mx-auto'}`}>
        {/* Tag gruppo */}
          <div className="mb-2">
            {(() => {
              const tag = getGroupTag(currentGroupName);
              return (
                <span className={`inline-flex items-center gap-1 ${tag.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wide`}>
                  <span>{tag.icon}</span> {tag.label}
                </span>
              );
            })()}
          </div>
        
        
        
        {/* Info set/esercizio */}
        {!isPrep && (
          <div className="mb-2">
            <span className="text-sm text-gray-300">Set {currentSet} / {currentTotalSet}</span>
            <span className="ml-4 text-sm text-gray-300">Esercizio {currentExerciseIndex + 1} / {currentGroup.length}</span>
          </div>
        )}

        {/* Progress bar del gruppo */}
        <div className="flex gap-1 mb-4">
          {currentGroup.map((ex, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-full transition-colors ${idx < currentExerciseIndex ? "bg-gray-600" :
                idx === currentExerciseIndex ? (isRest ? "bg-yellow-400" : "bg-green-500") : "bg-gray-300"
                }`}
            />
          ))}
        </div>

        {/* Timer principale */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-4 w-full">
          {isPrep ? (
            <>
              <h2 className="text-xl font-bold mb-4">Preparati</h2>
              <div className="text-6xl font-extrabold">
                {timeRemaining !== null ? `${timeRemaining}s` : "--"}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                {isRest ? (
                  <div className="flex items-center">
                    <Clock className="inline-block w-5 h-5 text-yellow-400 mr-2" />
                    <span>Riposo</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Dumbbell className="inline-block w-5 h-5 text-green-400 mr-2" />
                    <span>{currentExercise?.Esercizio}</span>
                  </div>
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
                <button onClick={handleRepsDone} className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg w-full">Fatto</button>
              )}
            </>
          )}
        </div>

        {/* Note esercizio */}
        {!isRest && currentExercise?.Note && (
          <div className="mt-2 text-sm text-gray-300 text-left bg-gray-900 p-3 rounded-lg max-w-sm mx-auto">
            <details>
              <summary className="cursor-pointer font-semibold text-gray-200">Note esercizio</summary>
              <p className="mt-2 text-gray-400 whitespace-pre-line">{currentExercise.Note}</p>
            </details>
          </div>
        )}
        {/* Controlli principali */}
        <div className="flex justify-center gap-3">
          <button onClick={goPrevExercise} className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
            <SkipBack className="w-6 h-6" />
          </button>
          {isRunning ? (
            <button onClick={() => setIsRunning(false)} className="w-14 h-14 bg-yellow-600 rounded-full flex items-center justify-center">
              <Pause className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setIsRunning(true)} className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6" />
            </button>
          )}
          <button onClick={goNextExercise} className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6">
          <button onClick={handleStop} className="bg-red-600 px-6 py-2 rounded-lg text-white w-full">Termina Workout</button>
        </div>
      </div>
    </div>

  );
}
