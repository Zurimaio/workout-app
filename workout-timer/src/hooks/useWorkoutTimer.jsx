import { useState, useEffect, useRef, useReducer, useCallback } from "react";
import TimerWorker from '../utils/timer.worker.js?worker';
import { useAudio } from '../utils/useAudio';

const TIMER_STATES = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  RUNNING: 'running',
  PAUSED: 'paused',
  RESTING: 'resting',
  WAITING_NEXT_GROUP: 'waiting_next_group',
  FINISHED: 'finished',
};

const timerReducer = (state, action) => {
  switch(action.type) {
    case 'START_PREP':
      return { ...state, state: TIMER_STATES.PREPARING, startTime: Date.now() };
    case 'START_EXERCISE':
      return {
        ...state,
        state: TIMER_STATES.RUNNING,
        currentGroupIndex: action.payload.groupIndex,
        currentExerciseIndex: action.payload.exerciseIndex,
        currentSet: action.payload.set,
        isRest: false
      };
    case 'START_REST':
      return { ...state, state: TIMER_STATES.RESTING, isRest: true };
    case 'PAUSE':
      return { ...state, state: TIMER_STATES.PAUSED };
    case 'RESUME':
      return { ...state, state: state.isRest ? TIMER_STATES.RESTING : TIMER_STATES.RUNNING };
    case 'FINISH_WORKOUT':
      return { ...state, state: TIMER_STATES.FINISHED };
    case 'TOGGLE_WAITING_GROUP':
      return { ...state, state: TIMER_STATES.WAITING_NEXT_GROUP };
    default:
      return state;
  }
};

export const useWorkoutTimer = (workoutData) => {
  const groupIds = Object.keys(workoutData);
  const [state, dispatch] = useReducer(timerReducer, {
    state: TIMER_STATES.IDLE,
    currentGroupIndex: 0,
    currentExerciseIndex: 0,
    currentSet: 1,
    isRest: false,
    startTime: Date.now(),
  });

  const [timeRemaining, setTimeRemaining] = useState(null);
  const { playBeep } = useAudio();
  const timerWorkerRef = useRef(null);
  const wakeLockRef = useRef(null);

  const { state: timerState, currentGroupIndex, currentExerciseIndex, currentSet, isRest, startTime } = state;

  const currentGroup = workoutData[groupIds[currentGroupIndex]];
  const currentExercise = currentGroup?.[currentExerciseIndex];

  const postToWorker = useCallback((msg) => {
    if (timerWorkerRef.current) timerWorkerRef.current.postMessage(msg);
  }, []);

const startTimer = useCallback((duration) => {
  setTimeRemaining(duration);
  if (duration !== null) {
    postToWorker({ type: 'START_TIMER', payload: duration });
  } else {
    postToWorker({ type: 'PAUSE_TIMER' });
  }
}, [postToWorker]);

  const startExercise = useCallback((groupIndex, exerciseIndex, setNumber) => {
    const exercise = workoutData[groupIds[groupIndex]][exerciseIndex];
    const duration = exercise.Unita === 'SEC' ? exercise.Volume : null;
    dispatch({ type: 'START_EXERCISE', payload: { groupIndex, exerciseIndex, set: setNumber } });
    startTimer(duration);
  }, [workoutData, groupIds, startTimer]);

  const handleAdvance = useCallback(() => {
    // Preparazione → primo esercizio
    if (timerState === TIMER_STATES.PREPARING) {
      startExercise(currentGroupIndex, 0, 1);
      return;
    }

    if (!isRest) {
      // Inizio riposo
      const restDuration = currentExercise.Rest || 30;
      dispatch({ type: 'START_REST' });
      startTimer(restDuration);
    } else {
      // Fine riposo → prossimo esercizio/set/gruppo
      const nextExerciseIndex = currentExerciseIndex + 1;
      if (nextExerciseIndex < currentGroup.length) {
        startExercise(currentGroupIndex, nextExerciseIndex, currentSet);
      } else if (currentSet < currentExercise.set) {
        startExercise(currentGroupIndex, 0, currentSet + 1);
      } else if (currentGroupIndex < groupIds.length - 1) {
        dispatch({ type: 'TOGGLE_WAITING_GROUP' });
        postToWorker({ type: 'PAUSE_TIMER' });
      } else {
        dispatch({ type: 'FINISH_WORKOUT' });
        postToWorker({ type: 'STOP_TIMER' });
      }
    }
  }, [timerState, isRest, currentGroupIndex, currentExerciseIndex, currentSet, currentGroup, currentExercise, groupIds, startExercise, startTimer, postToWorker]);

  // Inizializza Web Worker
  useEffect(() => {
    timerWorkerRef.current = new TimerWorker();
    timerWorkerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'UPDATE_TIME') {
        setTimeRemaining(payload);
        if (payload > 0 && payload <= 3) playBeep(440, 200);
      } else if (type === 'TIMER_END') {
        handleAdvance();
      }
    };
    return () => timerWorkerRef.current?.terminate();
  }, [playBeep, handleAdvance]);

  // Wake lock schermo
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && ["running","resting"].includes(timerState)) {
          if (!wakeLockRef.current) wakeLockRef.current = await navigator.wakeLock.request("screen");
        } else if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch (err) { console.error("WakeLock failed:", err); }
    };
    requestWakeLock();
    return () => { wakeLockRef.current?.release().catch(()=>{}); wakeLockRef.current=null; };
  }, [timerState]);

  const handleManualAdvance = () => {
    if (isRest) handleAdvance();
    else if (currentExercise.Unita === "REPS") {
      const restDuration = currentExercise.Rest || 30;
      dispatch({ type: 'START_REST' });
      startTimer(restDuration);
    }
  };

  const handleStartWorkout = useCallback(() => {
  dispatch({ type: 'START_PREP' });

  // assicuriamoci che il timer parta *subito* con 5 secondi
  setTimeRemaining(5);
  postToWorker({ type: 'START_TIMER', payload: 5 });
}, [postToWorker]);
  const nextExercise = () => isRest ? handleAdvance() : handleManualAdvance();
  const prevExercise = () => {
    if (isRest) startExercise(currentGroupIndex, currentExerciseIndex, currentSet);
    else if (currentExerciseIndex>0) startExercise(currentGroupIndex, currentExerciseIndex-1, currentSet);
    else if (currentSet>1) startExercise(currentGroupIndex, currentGroup.length-1, currentSet-1);
    else if (currentGroupIndex>0) startExercise(currentGroupIndex-1, workoutData[groupIds[currentGroupIndex-1]].length-1, 1);
  };

  const skipSet = (direction='next') => {
    const currentGroup = workoutData[groupIds[currentGroupIndex]];
    if (direction==='next') {
      if (currentSet<currentExercise.set) startExercise(currentGroupIndex, 0, currentSet+1);
      else skipGroup('next');
    } else {
      if (currentSet>1) startExercise(currentGroupIndex, currentGroup.length-1, currentSet-1);
      else skipGroup('prev');
    }
  };

  const skipGroup = (direction='next') => {
    const newGroupIndex = direction==='next'? currentGroupIndex+1: currentGroupIndex-1;
    if (newGroupIndex>=0 && newGroupIndex<groupIds.length) startExercise(newGroupIndex,0,1);
  };

  const handlePauseResume = () => {
    if (timerState===TIMER_STATES.PAUSED) {
      dispatch({ type:'RESUME' });
      if (timeRemaining!==null) postToWorker({ type:'RESUME_TIMER', payload:timeRemaining });
    } else {
      dispatch({ type:'PAUSE' });
      postToWorker({ type:'PAUSE_TIMER' });
    }
  };

  const handleStopWorkout = () => postToWorker({ type:'STOP_TIMER' });

  const exerciseDuration = isRest ? (currentExercise.Rest||30) : currentExercise?.Volume || 0;
  const exerciseProgress = (currentExercise?.Unita==='SEC'||isRest) && timeRemaining!==null
    ? Math.min(100, ((exerciseDuration - timeRemaining)/exerciseDuration)*100)
    : 0;

  return {
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
  };
};
