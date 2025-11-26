import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
// Importamo solo le icone necessarie per la bottom bar, usando FaDumbbell per la Home
import { MdPerson, MdBarChart, MdAdminPanelSettings, MdMenu } from "react-icons/md";
import { FaDumbbell, FaChartBar } from "react-icons/fa"; // Usiamo Fa per le icone della bottom bar
import UserProfile from "../hooks/UserProfile";
import MyWorkouts from "./User/MyWorkouts";
import SimpleTimer from "./SimpleTimer";
import Header from "./Header";
import Sidebar from "../components/Sidebar"; // Mantenuta per schermi desktop
import MobileBar from "./MobileBar";
import PreviewWorkout from "./User/PreviewWorkout";

// Placeholder Statistiche
function StatsPlaceholder() {
    return (
        <div className="p-6 text-white bg-brand-dark rounded-xl shadow-lg m-4">
            🚧 Statistiche in arrivo...
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
                        onPreview={(groups) => {
                            console.log("DATI RICEVUTI DALLA PREVIEW:", groups);
                            setWorkoutData(groups); setView("preview");
                        }}
                        onStart={(groups) => { setWorkoutData(groups); setView("timer"); setTimerActive(true) }}
                    />
                )}

                {view === "profile" && (
                    <div className="p-6 bg-brand text-white rounded-xl shadow-lg"> {/* Sfondo bianco su mobile */}
                        <h2 className="text-2xl font-bold mb-4 text-white">Il tuo Profilo</h2>
                        <p className="text-sm">Email: {user?.email}</p>
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
                        />
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
            <MobileBar
                menuItems={menuItems}
                currentView={view}
                setView={setView}
            />
        </div>
    );
}