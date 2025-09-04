import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MdFitnessCenter, MdPerson, MdBarChart, MdAdminPanelSettings, MdMenu } from "react-icons/md";
import UserProfile from "../hooks/UserProfile";
import MyWorkouts from "./MyWorkouts";
import ProfileMenu from "./ProfileMenu";
import Timer from "./Timer";
import PreviewWorkout from "./PreviewWorkout";
import Header from "./Header";
import Sidebar from "../components/Sidebar";
import { FaDumbbell, FaChartBar, FaCog } from "react-icons/fa";


// Placeholder Statistiche
function StatsPlaceholder() {
  return (
    <div className="p-6 text-gray-600">
      🚧 Statistiche in arrivo...
    </div>
  );
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const [view, setView] = useState("myWorkouts");
  const [workoutData, setWorkoutData] = useState(null);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, loading } = UserProfile();
  const [timerActive, setTimerActive] = useState(false);


  const menuItems = [
    { key: "myWorkouts", label: "Le mie Schede", icon: <MdFitnessCenter /> },
    { key: "profile", label: "Profilo", icon: <MdPerson /> },
    { key: "stats", label: "Statistiche", icon: <MdBarChart /> },
  ];

  if (role === "admin") menuItems.push({ key: "admin", label: "Admin Panel", icon: <MdAdminPanelSettings /> });

  return (
   <div className="flex h-screen bg-brand">
     

    <Sidebar menuItems={menuItems} sidebarOpen={sidebarOpen} setView={setView} setSidebarOpen={setSidebarOpen} />



      {/* Content area */}
      <main className="flex-1 overflow-auto p-6 md:ml-4">

        <Header
          title={`Ciao, ${profile.name} 👋`}
          subtitle=""
        />

        {view === "myWorkouts" && (
          <MyWorkouts
            workouts={myWorkouts}
            onPreview={(groups) => { setWorkoutData(groups); setView("preview"); }}
            onStart={(groups) => { setWorkoutData(groups); setView("timer"); setTimerActive(true)}}
          />
        )}

        {view === "profile" && (
          <div className="p-4 bg-brand-light text-offwhite rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Profilo</h2>
            <p>Email: {user?.email}</p>

          </div>
        )}

        {view === "stats" && <StatsPlaceholder />}

        {view === "preview" && workoutData && (
          <div>
            <button
              onClick={() => setView("myWorkouts")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <PreviewWorkout
              workoutData={workoutData}
              onStart={() => setView("timer")}
              onBack={() => setView("myWorkouts")}
            />
          </div>
        )}

        {view === "timer" && workoutData && (
          <div>
            <button
              onClick={() => setView("myWorkouts")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla Home
            </button>
            <Timer workoutData={workoutData} onExit={() => setView("myWorkouts") && setTimerActive(false)} />
          </div>
        )}

        {role === "admin" && view === "admin" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            {/* AdminPanel qui */}
          </div>
        )}
      </main>
    </div>
  );
}
