import React, { useRef, useState } from "react";
import {
  Dumbbell,
  Repeat,
  Clock,
  PauseCircle,
  StickyNote,
  Play,
} from "lucide-react";

import Timer from "../Timer/Timer";
import { getGroupTag } from "../../style/getGroupTag";
import WorkoutPreviewMini from "./WorkoutPreviewMini";
import WorkoutStats from "./WorkoutStats";
import WorkoutStatsCharts from "./WorkoutStatsCharts";
// ---------------------------
// STATS CALCULATOR
// ---------------------------
export function calculateStats(workoutData) {
  console.log(workoutData);
  if (!workoutData?.groups) {
    return {
      totalExercises: 0,
      totalSets: 0,
      totalVolume: 0,
      tipologiaStats: {},
      time: {
        estimatedWorkoutTime: 0
      }
    };
  }

  const tipologiaStats = {};
  let totalSets = 0;
  let totalVolume = 0;
  let totalExercises = 0;

  Object.values(workoutData.groups).forEach(group => {
    const tipo = group.name || "Altro";

    if (!tipologiaStats[tipo]) {
      tipologiaStats[tipo] = {
        sets: 0,
        volume: 0,
        exercises: 0
      };
    }

    (group.exercises || []).forEach(ex => {
      const setCount = ex.set || ex.sets || 1;
      const vol = Number(ex.Volume) || 0;

      tipologiaStats[tipo].sets += setCount;
      tipologiaStats[tipo].volume += vol * setCount;
      tipologiaStats[tipo].exercises += 1;

      totalVolume += vol * setCount;
      totalSets += setCount;
      totalExercises += 1;
    });
  });

  // ✔️ Durata realistica
  const avgSetTime = 40;      // tempo medio esecuzione set
  const restAvg = 60;         // recupero medio
  const transitionTime = 20;  // cambio esercizio

  const estimatedWorkoutTime =
    totalSets * (avgSetTime + restAvg) +
    totalExercises * transitionTime;

  return {
    totalExercises,
    totalSets,
    totalVolume,
    tipologiaStats,
    time: {
      estimatedWorkoutTime: Math.round(estimatedWorkoutTime / 60) // minuti
    }
  };
}


export function calculateAmbitoStats(workout) {
  const ambitoStats = {};

  let totalExercises = 0;
  let totalSets = 0;
  let totalDuration = 0;

  Object.values(workout.groups).forEach(group => {
    group.exercises.forEach(ex => {
      totalExercises++;

      const ambito = ex.Ambito || "UNKNOWN";

      if (!ambitoStats[ambito]) {
        ambitoStats[ambito] = {
          exercises: 0,
          sets: 0,
          volume: 0,
          duration: 0 // seconds
        };
      }

      const sets = ex.set || 0;
      const volume = ex.Volume || 0;
      const rest = ex.Rest || 0;

      ambitoStats[ambito].exercises++;
      ambitoStats[ambito].sets += sets;
      ambitoStats[ambito].volume += volume * sets;

      totalSets += sets;

      // ---- DURATA ----
      let exerciseDuration = 0;

      if (ex.Unita === "SEC") {
        exerciseDuration = volume * sets;
      } else if (ex.Unita === "REP") {
        exerciseDuration = volume * sets * 2.5;
      } else {
        exerciseDuration = sets * 20;
      }

      const restTime = rest * (sets - 1);

      ambitoStats[ambito].duration += exerciseDuration + restTime;
      totalDuration += exerciseDuration + restTime;
    });
  });

  // ---- Percentuali ----
  const ambitoPercent = {};
  Object.keys(ambitoStats).forEach(a => {
    ambitoPercent[a] = ((ambitoStats[a].exercises / totalExercises) * 100).toFixed(1) + "%";
  });

  return {
    ambitoStats,
    ambitoPercent,
    totalExercises,
    totalSets,
    estimatedDuration: Math.round(totalDuration / 60) // in minutes
  };
}


// ---------------------------
// COMPONENTE PRINCIPALE
// ---------------------------
export default function PreviewWorkout({ workoutData, onReload }) {
  const containerRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [audioCtx, setAudioCtx] = useState(null);
  const [activeTab, setActiveTab] = useState("workout"); // "workout" | "stats"

  const handleEnableAudio = async () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      try {
        await ctx.resume();
        setAudioCtx(ctx);
      } catch (err) {
        console.error("Errore AudioContext:", err);
      }
    } else if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  };

  const handleFinishGroup = () => {
    setActiveGroup(null);
  };

  return (
    <div ref={containerRef} className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        🏋️ Workout
      </h1>

      {/* ---------------- TAB ---------------- */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 p-1 rounded-full flex gap-1">
          <button
            onClick={() => setActiveTab("workout")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "workout"
                ? "bg-green-500 text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Scheda
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "stats"
                ? "bg-green-500 text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Progressi
          </button>
        </div>
      </div>

      {/* ===========================================================
          🟩 TAB: WORKOUT
      =========================================================== */}
      {activeTab === "workout" && (
        <>
          {/* Mini Preview + Stats Quick */}
          {!activeGroup && (
            <>
              <WorkoutPreviewMini workoutData={workoutData} />
            </>
          )}

          {/* TIMER */}
          {activeGroup ? (
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 text-center flex items-center gap-2 justify-center">
                <Repeat className="w-6 h-6 text-green-400 animate-spin" />
                {activeGroup.name}
              </h2>

              <Timer
                workoutData={{
                  [activeGroup.id]: activeGroup.exercises,
                  type: activeGroup.type,
                }}
                onFinish={handleFinishGroup}
                audioCtx={audioCtx}
              />
            </div>
          ) : (
            // ---------------- LISTA GRUPPI ----------------
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-1 bg-gray-700 top-0 bottom-0"></div>

              {workoutData?.groups &&
                Object.entries(workoutData.groups).map(
                  ([groupId, groupValue], index, arr) => {
                    const exercises = Array.isArray(groupValue?.exercises)
                      ? groupValue.exercises
                      : [];

                    const groupName =
                      groupValue?.name || `Gruppo ${index + 1}`;

                    const totalSets = exercises.reduce(
                      (sum, ex) => sum + (ex.set || ex.sets || 1),
                      0
                    );

                    return (
                      <div key={groupId} className="relative mb-12">
                        {/* CARD GRUPPO */}
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-5 relative z-10 max-w-2xl mx-auto">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                              {(() => {
                                const tag = getGroupTag(groupName);
                                return (
                                  <span
                                    className={`flex items-center gap-1 ${tag.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wide`}
                                  >
                                    {tag.icon}
                                    {tag.label}
                                  </span>
                                );
                              })()}
                            </h2>

                            <span className="flex items-center gap-1 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                              <Repeat className="w-4 h-4 text-blue-300" />
                              {totalSets} Set Totali
                            </span>
                          </div>

                          {/* LISTA ESERCIZI */}
                          <div className="space-y-4">
                            {exercises.map((ex, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-800 rounded-xl p-4 shadow-md hover:bg-gray-700 transition"
                              >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <Dumbbell className="w-5 h-5 text-green-400" />
                                  {ex.Esercizio}
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-gray-300 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Repeat className="w-4 h-4 text-blue-400" />
                                    <span>{ex.set} set</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-400" />
                                    <span>
                                      {ex.Volume} {ex.Unita}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <PauseCircle className="w-4 h-4 text-red-400" />
                                    <span>{ex.Rest || 0}s rest</span>
                                  </div>
                                </div>

                                {ex.Note && (
                                  <div className="mt-3 bg-gray-700 rounded-lg p-3 text-sm text-gray-200 flex gap-2">
                                    <StickyNote className="w-4 h-4 text-purple-300" />
                                    <span>{ex.Note}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* BUTTON TIMER */}
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => {
                                handleEnableAudio();
                                setActiveGroup({
                                  id: groupId,
                                  exercises,
                                  name: exercises
                                    .map((ex) => ex.Esercizio)
                                    .join(" • "),
                                  type: groupName,
                                });
                              }}
                              className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
                            >
                              <Play className="w-5 h-5" /> Avvia Timer
                            </button>
                          </div>
                        </div>

                        {/* BLOCCO RECUPERO */}
                        {index < arr.length - 1 && (
                          <div className="flex justify-center relative z-20 mt-6">
                            <div className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-yellow-300" />
                              <span>Riprenditi per 3–5 minuti</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
            </div>
          )}

          {/* PULSANTI GLOBALI */}
          {!activeGroup && (
            <div className="flex gap-4 justify-center mt-6">
              {onReload && (
                <button
                  onClick={onReload}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-600 transition flex items-center gap-2"
                >
                  🔄 Ricarica
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ===========================================================
          🟦 TAB: STATS
      =========================================================== */}
      {activeTab === "stats" && (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Progressi</h2>

          {/* <WorkoutStats stats={calculateStats(workoutData)} /> */}
           <WorkoutStatsCharts stats={calculateAmbitoStats(workoutData)} />


          <div className="mt-6 text-gray-400 text-sm">
            <p>In futuro qui puoi aggiungere:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Storico sessioni</li>
              <li>Progressioni skill</li>
              <li>Record personali</li>
              <li>Densità di lavoro</li>
              <li>Distribuzione settimanale</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
