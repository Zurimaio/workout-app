import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
// Importamo solo le icone necessarie per la bottom bar, usando FaDumbbell per la Home
import { MdPerson, MdBarChart, MdAdminPanelSettings, MdMenu } from "react-icons/md";
import { FaDumbbell, FaChartBar, FaUser, FaTools } from "react-icons/fa"; // Usiamo Fa per le icone della bottom bar
import UserProfile from "../hooks/UserProfile";
import MyWorkouts from "./MyWorkouts";
import ProfileMenu from "./ProfileMenu"; // Non usata nella bottom bar, ma mantenuta
import Timer from "./Timer";
import SimpleTimer from "./SimpleTimer";
import PreviewWorkout from "./PreviewWorkout";
import Header from "./Header";
import Sidebar from "../components/Sidebar"; // Mantenuta per schermi desktop

// Placeholder Statistiche
function StatsPlaceholder() {
  return (
    <div className="p-6 text-white bg-brand-dark rounded-xl shadow-lg m-4">
      🚧 Statistiche in arrivo...
    </div>
  );
}

// --- Componente per la Navigazione Fissa Mobile ---
function MobileBottomNav({ menuItems, currentView, setView }) {
    // Funzione per mappare le icone (se la chiave non corrisponde all'icona del menuItems)
    const getIcon = (key) => {
        switch (key) {
            case "myWorkouts": return <FaDumbbell className="text-xl" />;
            case "profile": return <FaUser className="text-xl" />;
            case "stats": return <FaChartBar className="text-xl" />;
            case "admin": return <FaTools className="text-xl" />;
            default: return null;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-brand shadow-xl md:hidden z-30">
            <div className="flex justify-around h-full">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setView(item.key)}
                        className={`flex flex-col items-center justify-center w-full transition-colors 
                            ${currentView === item.key 
                                ? 'text-brand-accent border-t-2 border-brand-accent font-semibold -mt-1 pt-1' // Active state
                                : 'text-gray-500 hover:text-brand-accent' // Inactive state
                            }`}
                    >
                        {getIcon(item.key)}
                        <span className="text-xs mt-1 truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- Componente Principale Dashboard ---
export default function Dashboard() {
    const { user, role } = useAuth();
    // Inizializziamo 'view' su 'myWorkouts' o lo nascondiamo se è attivo il timer
    const [view, setView] = useState("myWorkouts"); 
    const [workoutData, setWorkoutData] = useState(null);
    const [myWorkouts, setMyWorkouts] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mantenuta per schermi grandi (desktop)
    const { profile, loading } = UserProfile();
    const [timerActive, setTimerActive] = useState(false);

    // Gestisce la chiusura del timer per resettare lo stato
    const handleExitTimer = () => {
        setView("myWorkouts");
        setTimerActive(false);
    }

    // Navigazione principale (usata sia per Sidebar che per BottomNav)
    const menuItems = [
        { key: "myWorkouts", label: "Schede", icon: <FaDumbbell /> },
        { key: "stats", label: "Stats", icon: <FaChartBar /> },
        { key: "profile", label: "Tu", icon: <MdPerson /> },
    ];

    if (role === "admin") menuItems.push({ key: "admin", label: "Admin", icon: <MdAdminPanelSettings /> });

    // Se il timer è attivo, nascondi la sidebar e la bottom nav per focalizzare l'utente.
    if (timerActive) {
        return (
            <div className="flex h-screen bg-brand-dark overflow-hidden">
                <SimpleTimer workoutData={workoutData} onExit={handleExitTimer} />
            </div>
        );
    }

  return (
   <div className="flex h-screen bg-brand-light md:bg-brand overflow-hidden"> 
        {/* SIDEBAR DESKTOP */}
        <Sidebar menuItems={menuItems} sidebarOpen={sidebarOpen} setView={setView} setSidebarOpen={setSidebarOpen} />
        {/* Il toggle della sidebar (MdMenu) non è più necessario in mobile, dato che usiamo la bottom bar fissa */}


      {/* Content area */}
      <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:ml-30 transition-all duration-300"> 
            
            {/* Header migliorato (solo per mobile, l'Header desktop è spesso gestito diversamente) */}
            <div className="mb-6 pt-4"> 
                <Header
                    title={`Ciao, ${profile.name || 'Atleta'}! 👋`}
                    subtitle="Pronto per il tuo allenamento?"
                    className="text-gray-900" 
                />
            </div>
            
            {/* Contenuto specifico della vista */}
            {view === "myWorkouts" && (
              <MyWorkouts
                    // Aggiungere un bg-white e shadow-lg per MyWorkouts
                workouts={myWorkouts}
                onPreview={(groups) => { setWorkoutData(groups); setView("preview"); }}
                onStart={(groups) => { setWorkoutData(groups); setView("timer"); setTimerActive(true)}}
              />
            )}

            {view === "profile" && (
              <div className="p-6 bg-brand text-white rounded-xl shadow-lg"> {/* Sfondo bianco su mobile */}
                <h2 className="text-2xl font-bold mb-4 text-white">Il tuo Profilo</h2>
                <p className="text-sm">Email: {user?.email}</p>
              </div>
            )}

            {view === "stats" && <StatsPlaceholder />}

            {/* Logica per Preview e Timer: per mobile, li renderemo a schermo intero se possibile, ma per ora manteniamo il ritorno alla Home */}
            {(view === "preview" || view === "timer") && workoutData && (
              <div className="bg-brand p-4 rounded-xl shadow-lg">
                <button
                      onClick={() => setView("myWorkouts")}
                      className="mb-4 text-sm font-medium text-white hover:text-brand-accent transition-colors"
                >
                      ← Torna alle Schede
                </button>
                    {view === "preview" && (
                        <PreviewWorkout
                            workoutData={workoutData}
                            onStart={() => { setView("timer"); setTimerActive(true)}}
                            onBack={() => setView("myWorkouts")}
                        />
                    )}
                    {view === "timer" && (
                        <SimpleTimer workoutData={workoutData} onExit={handleExitTimer} />
                    )}
              </div>
            )}

            {role === "admin" && view === "admin" && (
              <div className="p-6 bg-brand rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Pannello Admin</h2>
                <p>Accesso amministrativo abilitato.</p>
              </div>
            )}

      </main>
        
        {/* NAVIGAZIONE MOBILE FISSA */}
        <MobileBottomNav 
            menuItems={menuItems} 
            currentView={view} 
            setView={setView} 
        />
    </div>
  );
}