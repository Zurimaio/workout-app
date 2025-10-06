import React, { useRef, useState, useEffect } from "react";
import { Dumbbell, Repeat, Clock, PauseCircle, StickyNote, Play, RefreshCcw } from "lucide-react";
import SimpleTimer from "./SimpleTimer"; // importa il timer semplice

export default function PreviewWorkout({ workoutData, onStart, onReload }) {
  const containerRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(null); // gruppo selezionato per timer
  const [audioCtx, setAudioCtx] = useState(null);




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
        console.log("🔊 AudioContext attivo:", ctx.state);
        setAudioCtx(ctx);
      } catch (err) {
        console.error("Errore attivazione AudioContext:", err);
      }
    } else if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  };




  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleFinishGroup = () => {
    setActiveGroup(null); // chiude il timer e torna alla preview
  };

  const getGroupTag = (name) => {
    const normalized = name?.toLowerCase() || "";

    if (normalized.includes("emom"))
      return { label: "EMOM", color: "bg-blue-600", icon: <Repeat className="w-4 h-4" /> };
    if (normalized.includes("tabata"))
      return { label: "TABATA", color: "bg-red-600", icon: <Clock className="w-4 h-4" /> };
    if (normalized.includes("amrap"))
      return { label: "AMRAP", color: "bg-yellow-500", icon: <RefreshCcw className="w-4 h-4" /> };
    if (normalized.includes("interval"))
      return { label: "INTERVAL TRAINING", color: "bg-green-600", icon: <Play className="w-4 h-4" /> };

    return { label: "STANDARD", color: "bg-gray-600", icon: <Dumbbell className="w-4 h-4" /> };
  };



  return (
    <div ref={containerRef} className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        🏋️ Workout
      </h1>

      {/* Se è attivo un gruppo, mostra SOLO il timer */}
      {activeGroup ? (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4 text-center flex items-center gap-2 justify-center">
            <Repeat className="w-6 h-6 text-green-400 animate-spin" />
            {activeGroup.name}
          </h2>
          <SimpleTimer
            workoutData={{ [activeGroup.id]: activeGroup.exercises }}
            onFinish={handleFinishGroup}
            audioCtx={audioCtx}
          />
        </div>
      ) : (
        <div className="relative">
          {/* Linea verticale */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-700 top-0 bottom-0"></div>

          {Object.entries(workoutData).map(([groupId, group], index, arr) => {
            const exercises = group.exercises || group;
            const groupName = group.name || groupId;
            const totalSets =
              group.totalSets ||
              exercises.reduce((sum, ex) => sum + (ex.set || 1), 0);

            return (
              <div key={groupId} className="relative mb-12">
                {/* Card gruppo */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-5 relative z-10 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    {/* Etichetta colorata */}
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
                    {/* Etichetta Total Set — colore uniforme */}
                    <span className="flex items-center gap-1 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                      <Repeat className="w-4 h-4 text-blue-300" />
                      {totalSets} Set Totali
                    </span>                
                    </div>

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

                {/* Bottone avvia timer per il gruppo */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      handleEnableAudio(); // sblocca audio
                      setActiveGroup({ id: groupId, exercises, name: exercises.map(ex => ex.Esercizio).join(" • "), })
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" /> Avvia Timer Gruppo
                  </button>
                </div>
              </div>

                {/* Nodo recupero */ }
            {
              index < arr.length - 1 && (
                <div className="flex justify-center relative z-20 mt-6">
                  <div className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-yellow-300" />
                    <span>Riprenditi per 3–5 minuti</span>
                  </div>
                </div>
              )
            }
              </div>
      );
          })}
    </div>
  )
}

{/* Pulsanti azione globali */ }
{
  !activeGroup && (
    <div className="flex gap-4 justify-center mt-6">
      {/*   {onStart && (
            <button
              onClick={onStart}
              className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              🚀 Avvia Workout
            </button>
          )} */}
      {onReload && (
        <button
          onClick={onReload}
          className="bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-600 transition flex items-center gap-2"
        >
          🔄 Ricarica
        </button>
      )}
      {/*   <button
            onClick={handleFullScreen}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            ⛶ Full Screen
          </button> */}
    </div>
  )
}
    </div >
  );
}
