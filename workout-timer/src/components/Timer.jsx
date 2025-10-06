import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { getGroupTag } from "../style/getGroupTag";

// Definizione degli stati del timer
const TIMER_STATES = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  RUNNING: 'running',
  PAUSED: 'paused',
  RESTING: 'resting',
  WAITING_NEXT_GROUP: 'waiting_next_group',
  FINISHED: 'finished',
};

// Funzione reducer per gestire lo stato del timer
const timerReducer = (state, action) => {
  switch (action.type) {
    case 'START_PREP':
      return { ...state, state: TIMER_STATES.PREPARING, timeRemaining: action.payload };
    case 'ADVANCE_PREP':
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    case 'START_EXERCISE':
      return {
        ...state,
        state: TIMER_STATES.RUNNING,
        timeRemaining: action.payload.duration,
        currentExerciseIndex: action.payload.exerciseIndex,
        isRest: false,
      };
    case 'START_REST':
      return {
        ...state,
        state: TIMER_STATES.RESTING,
        timeRemaining: action.payload.duration,
        isRest: true,
      };
    case 'PAUSE':
      return { ...state, state: TIMER_STATES.PAUSED };
    case 'RESUME':
      return { ...state, state: state.isRest ? TIMER_STATES.RESTING : TIMER_STATES.RUNNING };
    case 'UPDATE_TIME':
      return { ...state, timeRemaining: action.payload };
    case 'NEXT_EXERCISE':
      return {
        ...state,
        currentExerciseIndex: state.currentExerciseIndex + 1,
        isRest: false,
        timeRemaining: action.payload.duration,
      };
    case 'NEXT_SET':
      return {
        ...state,
        currentExerciseIndex: 0,
        currentSet: state.currentSet + 1,
        isRest: false,
        timeRemaining: action.payload.duration,
      };
    case 'NEXT_GROUP':
      return {
        ...state,
        currentGroupIndex: state.currentGroupIndex + 1,
        currentExerciseIndex: 0,
        currentSet: 1,
        state: TIMER_STATES.RUNNING,
        isRest: false,
        timeRemaining: action.payload.duration,
      };
    case 'FINISH_WORKOUT':
      return { ...state, state: TIMER_STATES.FINISHED };
    case 'TOGGLE_WAITING_GROUP':
      return { ...state, state: TIMER_STATES.WAITING_NEXT_GROUP };
    case 'GOTO_PREV_EXERCISE':
      return {
        ...state,
        currentGroupIndex: action.payload.groupIndex,
        currentSet: action.payload.set,
        currentExerciseIndex: action.payload.exerciseIndex,
        isRest: false,
        state: TIMER_STATES.PAUSED,
        timeRemaining: action.payload.duration,
      };
    default:
      return state;
  }
};

const playBeep = (frequency = 440, duration = 200) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.start();
  
  gainNode.gain.setValueAtTime(1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
  
  oscillator.stop(ctx.currentTime + duration / 1000);
};

export default function Timer({ workoutData, onExit }) {
  const groupIds = Object.keys(workoutData);
  const [state, dispatch] = useReducer(timerReducer, {
    state: TIMER_STATES.IDLE,
    currentGroupIndex: 0,
    currentExerciseIndex: 0,
    currentSet: 1,
    timeRemaining: null,
    isRest: false,
    startTime: Date.now(),
  });

  const {
    state: timerState,
    currentGroupIndex,
    currentExerciseIndex,
    currentSet,
    timeRemaining,
    isRest,
    startTime,
  } = state;

  const currentGroup = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroup?.[currentExerciseIndex];

  // Gestione Wake Lock
  const wakeLockRef = useRef(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && timerState === TIMER_STATES.RUNNING) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.error("WakeLock failed:", err);
      }
    };
    requestWakeLock();
    return () => wakeLockRef.current?.release();
  }, [timerState]);

  // Gestione timer principale (requestAnimationFrame)
  const lastTickRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const startTimer = useCallback(() => {
    lastTickRef.current = Date.now();
    const tick = () => {
      if (timerState === TIMER_STATES.PAUSED || timerState === TIMER_STATES.IDLE || timerState === TIMER_STATES.FINISHED || timerState === TIMER_STATES.WAITING_NEXT_GROUP) {
        return;
      }
      
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      let newTime = Math.max(0, timeRemaining - elapsed);
      
      if (newTime <= 3 && newTime > 0 && Math.ceil(newTime) !== Math.ceil(timeRemaining)) {
        playBeep(440, 200);
      }
      
      if (newTime === 0) {
        handleAdvance();
      } else {
        dispatch({ type: 'UPDATE_TIME', payload: newTime });
        lastTickRef.current = now;
      }
      
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };
    
    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [timerState, timeRemaining, isRest]); // dipendenze essenziali

  useEffect(() => {
    if (timerState === TIMER_STATES.RUNNING || timerState === TIMER_STATES.RESTING) {
      startTimer();
    } else {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [timerState, startTimer]);


  // Gestione countdown di preparazione
  useEffect(() => {
    if (timerState !== TIMER_STATES.PREPARING || timeRemaining === null) return;
    
    if (timeRemaining <= 3 && timeRemaining > 0) playBeep(440, 200);

    const prepTimer = setTimeout(() => {
      if (timeRemaining === 1) {
        const initialDuration = currentExercise.Unita === "SEC" ? currentExercise.Volume : null;
        dispatch({ type: 'START_EXERCISE', payload: { duration: initialDuration, exerciseIndex: currentExerciseIndex } });
      } else {
        dispatch({ type: 'ADVANCE_PREP' });
      }
    }, 1000);
    
    return () => clearTimeout(prepTimer);
  }, [timerState, timeRemaining, currentExercise, currentExerciseIndex]);


  const handleAdvance = useCallback(() => {
    if (isRest) {
      const nextExerciseIndex = currentExerciseIndex + 1;
      if (nextExerciseIndex < currentGroup.length) {
        const nextExercise = currentGroup[nextExerciseIndex];
        const duration = nextExercise.Unita === "SEC" ? nextExercise.Volume : null;
        dispatch({ type: 'NEXT_EXERCISE', payload: { duration } });
      } else if (currentSet < currentExercise.set) {
        const firstExerciseInSet = currentGroup[0];
        const duration = firstExerciseInSet.Unita === "SEC" ? firstExerciseInSet.Volume : null;
        dispatch({ type: 'NEXT_SET', payload: { duration } });
      } else if (currentGroupIndex < groupIds.length - 1) {
        dispatch({ type: 'TOGGLE_WAITING_GROUP' });
        dispatch({ type: 'PAUSE' });
      } else {
        dispatch({ type: 'FINISH_WORKOUT' });
      }
    } else {
      const restDuration = currentExercise.Rest;
      dispatch({ type: 'START_REST', payload: { duration: restDuration } });
    }
  }, [currentGroupIndex, currentExerciseIndex, currentSet, isRest, currentGroup, currentExercise, groupIds]);

  const handleManualAdvance = () => {
    if (isRest) {
      handleAdvance();
    } else if (currentExercise.Unita === "REPS") {
      dispatch({ type: 'START_REST', payload: { duration: currentExercise.Rest } });
    }
  };

  const handleStartWorkout = () => {
    dispatch({ type: 'START_PREP', payload: 5 });
  };

  const handlePauseResume = () => {
    if (timerState === TIMER_STATES.PAUSED) {
      dispatch({ type: 'RESUME' });
    } else {
      dispatch({ type: 'PAUSE' });
    }
  };

  const handlePrev = () => {
    // Logica per tornare indietro (semplificata)
    if (isRest) {
      dispatch({ type: 'START_EXERCISE', payload: { duration: currentExercise.Volume, exerciseIndex: currentExerciseIndex } });
    } else if (currentExerciseIndex > 0) {
      const prev = currentGroup[currentExerciseIndex - 1];
      dispatch({ type: 'GOTO_PREV_EXERCISE', payload: { groupIndex: currentGroupIndex, set: currentSet, exerciseIndex: currentExerciseIndex - 1, duration: prev.Unita === 'SEC' ? prev.Volume : null }});
    }
  };
  
  const handleNextGroup = () => {
    const nextGroupIndex = currentGroupIndex + 1;
    if (nextGroupIndex < groupIds.length) {
      const nextGroup = workoutData[groupIds[nextGroupIndex]];
      const duration = nextGroup[0].Unita === "SEC" ? nextGroup[0].Volume : null;
      dispatch({ type: 'NEXT_GROUP', payload: { duration } });
    }
  };
  
  const handlePrevGroup = () => {
     const prevGroupIndex = currentGroupIndex - 1;
    if (prevGroupIndex >= 0) {
       const prevGroup = workoutData[groupIds[prevGroupIndex]];
      const duration = prevGroup[0].Unita === "SEC" ? prevGroup[0].Volume : null;
      dispatch({ type: 'GOTO_PREV_EXERCISE', payload: { groupIndex: prevGroupIndex, set: 1, exerciseIndex: 0, duration: duration }});
    }
  };

  const exerciseDuration = isRest ? currentExercise.Rest : currentExercise.Volume;
  const exerciseProgress =
    (currentExercise.Unita === "SEC" || isRest) && timeRemaining !== null
      ? Math.min(100, ((exerciseDuration - timeRemaining) / exerciseDuration) * 100)
      : 0;

  if (timerState === TIMER_STATES.FINISHED) {
    const totalDuration = Math.floor((Date.now() - startTime) / 1000);
    // Render del riassunto, che puoi mantenere come era
    return (
      <div className="p-4 max-w-xl mx-auto text-offwhite">
        <h1 className="text-2xl font-bold mb-4 ">Workout completato! 💪</h1>
        <p className="mb-4">Durata totale: {Math.floor(totalDuration / 60)}m {totalDuration % 60}s</p>
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
    <div className="fixed inset-0 bg-brand-dark text-offwhite z-50 flex flex-col items-center justify-center p-4">
      {timerState === TIMER_STATES.IDLE && (
        <button
          onClick={handleStartWorkout}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-lg font-semibold"
        >
          Avvia Workout
        </button>
      )}

      {timerState === TIMER_STATES.PREPARING && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preparati!</h1>
          <p className="text-6xl font-extrabold text-yellow-400">{Math.ceil(timeRemaining)}</p>
        </div>
      )}

      {(timerState === TIMER_STATES.RUNNING || timerState === TIMER_STATES.PAUSED || timerState === TIMER_STATES.RESTING || timerState === TIMER_STATES.WAITING_NEXT_GROUP) && (
        <>
          {/* Etichetta tipo gruppo */}
          {currentGroup && (
            <div className="mb-3 flex items-center justify-center">
              {(() => {
                const tag = getGroupTag(groupIds[currentGroupIndex]);
                return (
                  <span
                    className={`flex items-center gap-2 ${tag.color} text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide`}
                  >
                    <span>{tag.icon}</span>
                    {tag.label}
                  </span>
                );
              })()}
            </div>
          )}


          <h1 className="text-2xl font-bold mb-2">Workout in corso</h1>
          <h2 className="text-lg mb-4">
            Gruppo {groupIds[currentGroupIndex]} – Set {currentSet} di {currentExercise.set}
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentGroupIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white text-black p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">
                {isRest ? "Riposo" : currentExercise.Esercizio}
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
                    {currentExercise.Unita === "SEC" || isRest ? Math.ceil(timeRemaining) + "s" : <span>{currentExercise.Volume}reps</span>}
                  </p>
                </div>
              </div>

              {timerState === TIMER_STATES.WAITING_NEXT_GROUP ? (
                <button
                  onClick={handleNextGroup}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  Avvia prossimo gruppo
                </button>
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-4">
                    {currentExercise.Unita === "REPS" && !isRest && (
                      <button
                        onClick={handleManualAdvance}
                        className="px-4 py-2 text-sm bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
                      >
                        Fine esercizio
                      </button>
                    )}
                    <button
                      onClick={handlePrev}
                      className="w-12 h-12 flex items-center justify-center bg-gray-400 text-white rounded-full shadow hover:bg-gray-500 transition"
                      disabled={currentExerciseIndex === 0 && currentSet === 1 && currentGroupIndex === 0 && !isRest}
                    >
                      <MdNavigateBefore size={28} />
                    </button>
                    <button
                      onClick={handleManualAdvance}
                      className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                    >
                      <MdNavigateNext size={28} />
                    </button>
                    <button
                      onClick={handlePauseResume}
                      className="w-12 h-12 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow hover:bg-yellow-600 transition"
                    >
                      {timerState === TIMER_STATES.PAUSED ? <FaPlay size={22} /> : <FaPause size={22} />}
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="block text-sm font-semibold mb-1">Note aggiuntive:</span>
                    <p className="text-gray-700">{currentExercise.Note || "—"}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6">
            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition flex items-center gap-2 mx-auto"
            >
              <FaStop /> Termina Workout
            </button>
          </div>
        </>
      )}
    </div>
  );
}