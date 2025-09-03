// src/components/Dashboard.jsx
import { useAuth } from "../contexts/AuthContext";
import Timer from "./Timer";
import PreviewWorkout from "./PreviewWorkout";
import ProfileMenu from "./ProfileMenu";
import MyWorkouts from "./MyWorkouts";
import React, { useState, useEffect } from "react";


export default function Dashboard() {
  const { user, role } = useAuth();
  const [view, setView] = useState("home"); // home, upload, create, timer, preview, admin, myWorkouts
  const [workoutData, setWorkoutData] = useState(null);
  const [myWorkouts, setMyWorkouts] = useState([]);

useEffect(() => {
        console.log("ruolo impostato: ", role)
}, []);


    return (
      <div className="min-h-screen bg-gray-100 p-4 relative">

        {/* Pulsante profilo */}
        <div className="absolute top-4 right-4 flex gap-2">
          <ProfileMenu />
          {(
            <button
              onClick={() => setView("myWorkouts")}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Le mie schede
            </button>
          )}
        </div>
  
        {/* HOME */}
        {view === "home" && (
          <div className="flex flex-col items-center gap-6 mt-20 w-full max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Workout Timer</h1>
            {(
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setView("upload")}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Carica Workout
                </button>
                <button
                  onClick={() => setView("create")}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Crea Workout
                </button>
              </div>
            )}
          </div>
        )}
  
        {/* MY WORKOUTS - utenti standard */}
        {view === "myWorkouts" && (
          <div>
            <button
              onClick={() => setView("home")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <MyWorkouts
              workouts={myWorkouts}
              onPreview={(groups) => { setWorkoutData(groups); setView("preview"); }}
              onStart={(groups) => { setWorkoutData(groups); setView("timer"); }}
            />
          </div>
        )}
  
       
        {/* PREVIEW */}
        {view === "preview" && (
          <div>
            <button
              onClick={() => setView("home")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <PreviewWorkout
              workoutData={workoutData}
              onStart={() => setView("timer")}
              onBack={() => setView("home")}
            />
          </div>
        )}
  
        {/* TIMER */}
        {view === "timer" && (
          <div>
            <button
              onClick={() => setView("home")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <Timer workoutData={workoutData} onExit={() => setView("home")} />
          </div>
        )}
  
        {/* ADMIN */}
        {role === "admin" && view === "admin" && (
          <div>
            <button
              onClick={() => setView("home")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <AdminPanel />
          </div>
        )}
      </div>
    );
}
