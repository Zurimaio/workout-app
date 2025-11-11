// --- WorkoutControls.jsx ---
import React from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

export function WorkoutControls({ isRunning, onPlayPause, onNext, onPrev }) {
  return (
    <div className="flex justify-center gap-3">
      <button
        onClick={onPrev}
        className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center"
      >
        <SkipBack className="w-6 h-6" />
      </button>

      <button
        onClick={onPlayPause}
        className={`w-14 h-14 rounded-full flex items-center justify-center ${isRunning ? "bg-yellow-600" : "bg-green-600"}`}
      >
        {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>

      <button
        onClick={onNext}
        className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center"
      >
        <SkipForward className="w-6 h-6" />
      </button>
    </div>
  );
}
