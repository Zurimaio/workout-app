import React, { useState, useEffect } from "react";
import UploadWorkout from "./components/UploadWorkout";
import CreateWorkout from "./components/CreateWorkout";
import Timer from "./components/Timer";
import PreviewWorkout from "./components/PreviewWorkout";
import AdminPanel from "./components/admin/AdminPanel";
import ProfileMenu from "./components/ProfileMenu";
import MyWorkouts from "./components/MyWorkouts";

import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("home"); // home, upload, create, timer, preview, admin, myWorkouts
  const [workoutData, setWorkoutData] = useState(null);
  const [myWorkouts, setMyWorkouts] = useState([]);

  const userId = user?.uid;
  const isAdmin = user?.role === "admin";

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />; // <-- qui fermiamo il rendering e mostriamo solo il login

  /*
  // Carica workout dell'utente
  useEffect(() => {
  

    if (!isAdmin && view === "myWorkouts") {
      const fetchWorkouts = async () => {
        try {
          const userWorkoutsCol = collection(db, "workouts", userId, "userWorkouts");
          const snapshot = await getDocs(userWorkoutsCol);
          const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMyWorkouts(workouts);
        } catch (err) {
          console.error("Errore caricamento workout:", err);
          setMyWorkouts([]);
        }
      };
      fetchWorkouts();
    }
  }, [view]);
*/
  return (

    <div className="min-h-screen bg-gray-100 p-4 relative">
      {!userId && (<Login />)}

      {/* Pulsante profilo + Admin solo se admin */}
      <div className="absolute top-4 right-4 flex gap-2">
        <ProfileMenu />
        {isAdmin && (
          <button
            onClick={() => setView("admin")}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Admin
          </button>
        )}
        {!isAdmin && (
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
          {isAdmin && (
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

      {/* UPLOAD */}
      {view === "upload" && isAdmin && (
        <div>
          <button
            onClick={() => setView("home")}
            className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Torna alla Home
          </button>
          <UploadWorkout
            onLoad={(data) => {
              setWorkoutData(data);
              setView("preview");
            }}
          />
        </div>
      )}

      {/* CREATE */}
      {view === "create" && isAdmin && (
        <div>
          <button
            onClick={() => setView("home")}
            className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Torna alla Home
          </button>
          <CreateWorkout
            onGenerated={(data) => {
              setWorkoutData(data);
              setView("preview");
            }}
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
      {view === "admin" && isAdmin && (
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
