// --- Timer.jsx ---
import React, { useState, useRef, useEffect, useCallback } from "react";
import { TimerCard } from "./TimerCard";
import { WorkoutControls } from "./WorkoutControls";
import { WorkoutEndModal } from "./WorkoutEndModal";
import { useTimer } from "./TimerHook";
import { useWakeLock } from "../../utils/useWaveLock";
import { Minimize, Maximize } from "lucide-react";

export default function Timer({ workoutData, prepTime = 10, onFinish }) {
  const PREP_TIME = prepTime;
  const groupIds = Object.keys(workoutData || {});

  // --- STATE ---
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPrep, setIsPrep] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isExercisePhase, setIsExercisePhase] = useState(false);
  const [showWorkoutEnd, setShowWorkoutEnd] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasAgreedToStart, setHasAgreedToStart] = useState(false);

  // --- REFS ---
  const audioCtxRef = useRef(null);

  // --- DERIVED STATE ---
  const currentGroupData = workoutData[groupIds[currentGroupIndex]] || [];
  const currentExercise = currentGroupData?.[currentExerciseIndex];
  const currentTotalSet = currentExercise?.set || 1;

  useWakeLock(isRunning);

  // --- UTILS ---


  useEffect(() => {
    const unlockAudio = () => {
      if (
        audioCtxRef.current &&
        (audioCtxRef.current.state === "suspended" ||
          audioCtxRef.current.state === "interrupted")
      ) {
        audioCtxRef.current.resume().catch(() => { });
      }

      // Rimuovo i listener dopo il primo tap
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("touchstart", unlockAudio, { passive: true });
    document.addEventListener("click", unlockAudio, { passive: true });

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  


  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);




  const playBeep = async (frequency = 440, duration = 200) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    try { if (audioCtx.state === "suspended") await audioCtx.resume(); } catch {}
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
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch {} };
  };

  const vibrate = (pattern = [200]) => { if ("vibrate" in navigator) navigator.vibrate(pattern); };

    const playIntermediateBeep = () => {
    playBeep(660, 150); // frequenza neutra, durata breve
    vibrate(150);
  };

  
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



  const saveSession = () => {
    const sessionData = {
      date: new Date().toISOString(),
      groupName: groupIds[currentGroupIndex],
      setsCompleted: currentTotalSet,
      exercises: currentGroupData,
    };
    localStorage.setItem("lastWorkoutSession", JSON.stringify(sessionData));
    playBeep(660, 400);
    playBeep(440, 400);
    vibrate([200, 100, 200]);
  };

  const checkWorkoutCompletion = () => {
    const lastExercise = currentExerciseIndex === currentGroupData.length - 1;
    const lastSet = currentSet === currentTotalSet;

    if (lastExercise && lastSet) {
      setShowWorkoutEnd(true);
      setIsRunning(false);
      saveSession();
    }
  };

  // --- PHASE CONTROL ---
  const startPrep = () => {
    setIsPrep(true);
    setIsRest(false);
    setIsExercisePhase(false);
    setTimeRemaining(PREP_TIME);
    setIsRunning(true);
  };

  const startExercise = () => {
    setIsPrep(false);
    setIsRest(false);
    setIsExercisePhase(true);

    if (!currentExercise) return;

    if (currentExercise.Unita === "SEC") {
      setTimeRemaining(currentExercise.Volume);
      setIsRunning(true);
    } else if (currentExercise.Unita === "REPS") {
      setTimeRemaining(null);
      setIsRunning(false); // aspetta click "Fatto"
    }
  };

  const startRest = () => {
    setIsPrep(false);
    setIsRest(true);
    setIsExercisePhase(false);
    setTimeRemaining(currentExercise?.Rest ?? 30);
    setIsRunning(true);
    playBeep(880, 500);
    vibrate(500);
  };

  const handleRepsDone = () => {
    startRest();
    playBeep(750, 300);
    vibrate(200);
  };

  // --- NAVIGATION ---
  const goNextExercise = useCallback(() => {
    if (!currentExercise) return;

    let g = currentGroupIndex;
    let e = currentExerciseIndex;
    let s = currentSet;

    const totalSets = currentExercise?.set ?? 1;
    const lastExercise = e >= currentGroupData.length - 1;
    const lastSet = s >= totalSets;

    if (lastExercise && lastSet) {
      checkWorkoutCompletion();
      return;
    }

    if (isRest) {
      if (lastExercise) {
        if (!lastSet) { e = 0; s++; }
        else if (g < groupIds.length - 1) { g++; e = 0; s = 1; }
      } else { e++; }

      const nextExercise = workoutData[groupIds[g]][e];

      setIsPrep(false);
      setIsRest(false);
      setIsExercisePhase(true);

      if (nextExercise.Unita === "SEC") {
        setTimeRemaining(nextExercise.Volume);
        setIsRunning(true);
      } else {
        setTimeRemaining(null);
        setIsRunning(false);
      }

      setCurrentGroupIndex(g);
      setCurrentExerciseIndex(e);
      setCurrentSet(s);
    } else if (currentExercise.Unita === "REPS") {
      handleRepsDone();
    } else {
      startRest();
    }
  }, [currentExercise, currentGroupIndex, currentExerciseIndex, currentSet, isRest, currentGroupData, workoutData, groupIds]);

  const goPrevExercise = useCallback(() => {
    if (!currentExercise) return;

    let g = currentGroupIndex;
    let e = currentExerciseIndex - 1;
    let s = currentSet;

    if (e < 0) {
      if (s > 1) { s--; e = currentGroupData.length - 1; }
      else if (g > 0) { g--; e = workoutData[groupIds[g]].length - 1; s = 1; }
      else return;
    }

    const prevExercise = workoutData[groupIds[g]][e];
    if (prevExercise.Unita === "SEC") startRest();
    else startPrep();

    setCurrentGroupIndex(g);
    setCurrentExerciseIndex(e);
    setCurrentSet(s);
  }, [currentExercise, currentGroupIndex, currentExerciseIndex, currentSet, currentGroupData, workoutData, groupIds]);

  // --- TIMER / BACKGROUND ---
  useEffect(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const finishCurrentPhase = useCallback(() => {
    if (isPrep) {
      playBeep(1000, 700);
      vibrate(300)
      startExercise();
    }
    else if (isRest) { // Fine riposo → prossimo esercizio o set
      playBeep(1200, 900);
      vibrate(300); goNextExercise();
    }
    else if (currentExercise?.Unita === "SEC") startRest();
  }, [isPrep, isRest, currentExercise, goNextExercise]);

  useTimer({
    isRunning,
    timeRemaining,
    onTick: (nextTime) => setTimeRemaining(nextTime),
    onFinish: finishCurrentPhase, 
    audioCtxRef
  });

  // --- INITIAL PREP ---
  useEffect(() => {
    if (isIOS() && !hasAgreedToStart) return;
    startPrep();
  }, [hasAgreedToStart]);

  // --- UI ---
  const toggleFullScreen = () => setIsFullScreen(prev => !prev);

  if (isIOS() && !hasAgreedToStart) {
    return (
      <div className="text-center text-white flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Attenzione!</h2>
        <p className="mb-4">Per evitare che lo schermo si spenga durante l'allenamento, disattiva il blocco automatico.</p>
        <button onClick={() => setHasAgreedToStart(true)} className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold">OK, Inizia Workout</button>
      </div>
    );
  }

  return (
    <div className={`text-center text-white p-4 transition-all duration-500 ${isFullScreen ? "fixed top-0 left-0 w-full h-screen bg-black z-50 flex flex-col justify-center items-center" : ""}`}>
      <button onClick={toggleFullScreen} className="fixed top-4 right-4 bg-gray-700 rounded-full p-2 z-50">
        {isFullScreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
      </button>

      <TimerCard
        isPrep={isPrep}
        isRest={isRest}
        isExercisePhase={isExercisePhase}
        currentExercise={currentExercise}
        timeRemaining={timeRemaining}
        currentSet={currentSet}
        totalSets={currentTotalSet}
        onRepsDone={handleRepsDone}
        isFullScreen={isFullScreen}
      />

      <WorkoutControls
        isRunning={isRunning}
        onPlayPause={() => setIsRunning(prev => !prev)}
        onNext={goNextExercise}
        onPrev={goPrevExercise}
      />

      <WorkoutEndModal
        show={showWorkoutEnd}
        currentTotalSet={currentTotalSet}
        currentGroupName={groupIds[currentGroupIndex]}
        onFinish={onFinish}
      />
    </div>
  );
}
