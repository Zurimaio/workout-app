import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MdFitnessCenter, MdPerson, MdBarChart, MdAdminPanelSettings, MdMenu } from "react-icons/md";

import MyWorkouts from "./MyWorkouts";
import ProfileMenu from "./ProfileMenu";
import Timer from "./Timer";
import PreviewWorkout from "./PreviewWorkout";

// Placeholder Statistiche
function StatsPlaceholder() {
  return (
    <div className="p-6 text-gray-600">
      🚧 Statistiche in arrivo...
    </div>
  );
}

export default function Dashboard() {
  const {user, role } = useAuth();
  const [view, setView] = useState("myWorkouts");
  const [workoutData, setWorkoutData] = useState(null);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: "myWorkouts", label: "Le mie Schede", icon: <MdFitnessCenter /> },
    { key: "profile", label: "Profilo", icon: <MdPerson /> },
    { key: "stats", label: "Statistiche", icon: <MdBarChart /> },
  ];

  if (role === "admin") menuItems.push({ key: "admin", label: "Admin Panel", icon: <MdAdminPanelSettings /> });

  return (
    <div className="flex h-screen bg-brand">
      {/* Sidebar mobile toggle */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded bg-sage-dark shadow"
        >
          <MdMenu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-10 w-64 bg-brand-dark shadow-lg h-full transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 flex text-offwhite items-center justify-center font-bold text-xl border-b">
          🏋️ Elev8
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setView(item.key); setSidebarOpen(false); }}
              className={`flex items-right gap-2 w-full px-3 py-2 rounded  bg-brand-light hover:bg-brand-dark text-offwhite transition ${
                view === item.key ? "bg-brand-light font-semibold" : ""
              }`}
            >
              {item.icon} <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t mt-auto">
          <ProfileMenu />
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-auto p-6 md:ml-16">
        {view === "myWorkouts" && (
          <MyWorkouts
            workouts={myWorkouts}
            onPreview={(groups) => { setWorkoutData(groups); setView("preview"); }}
            onStart={(groups) => { setWorkoutData(groups); setView("timer"); }}
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
            <Timer workoutData={workoutData} onExit={() => setView("myWorkouts")} />
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
