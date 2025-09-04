import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, getDocs, collection, deleteDoc, setDoc } from "firebase/firestore";
import ExerciseList from "./ExerciseList";
import UploadWorkout from "../UploadWorkout";
import CreateWorkout from "../CreateWorkout";
import PreviewWorkout from "../PreviewWorkout";
import Header from "../Header";
import UserProfile from "../../hooks/UserProfile";
import Sidebar from "../Sidebar";

import { useAuth } from "../../contexts/AuthContext";

import { MdPeople, MdFitnessCenter, MdPerson, MdMenu } from "react-icons/md";

export default function AdminPanel() {
  const { user } = useAuth();
  const [exerciseDB, setExerciseDB] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("users"); // users, exerciseDB, profile, create, upload
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const {profile, loadingProfile} = UserProfile(); 

  // --- Carica gli utenti da Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserList(userList);
      } catch (err) {
        console.error("Errore caricamento utenti:", err);
      }
    };
    loadUsers();
  }, []);

  // Recupero i workout dell'utente
  const fetchUserWorkouts = async (uid) => {
    try {
      const colRef = collection(db, "workouts", uid, "userWorkouts");
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserWorkouts(data);
    } catch (err) {
      console.error("Errore caricamento workout utente:", err);
    }
  };

  // Caricamento DB
  useEffect(() => {
    const loadDb = async () => {
      try {
        const docRef = doc(db, "exerciseDB", "master");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setExerciseDB(docSnap.data());
      } catch (err) {
        console.error("Errore caricamento DB:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDb();
  }, []);

  const saveDb = async () => {
    try {
      await setDoc(doc(db, "exerciseDB", "master"), exerciseDB);
      alert("Database salvato correttamente!");
    } catch (err) {
      alert("Errore salvataggio DB: " + err.message);
    }
  };


  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setView("userWorkouts");
    fetchUserWorkouts(u.id);
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!selectedUser) return;
    if (!window.confirm("Sei sicuro di voler cancellare questo workout?")) return;
    try {
      await deleteDoc(doc(db, "workouts", selectedUser.id, "userWorkouts", workoutId));
      setUserWorkouts(prev => prev.filter(w => w.id !== workoutId));
      alert("Workout cancellato con successo!");
    } catch (err) {
      console.error("Errore cancellazione workout:", err);
      alert("Errore durante la cancellazione!");
    }
  };



  const handleJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setExerciseDB(data);
      await setDoc(doc(db, "exerciseDB", "master"), data);
      alert("JSON caricato correttamente su Firestore!");
    } catch (err) {
      alert("Errore nel caricamento del JSON: " + err.message);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(exerciseDB, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exerciseDB.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Caricamento DB...</p>;

  const menuItems = [
    { key: "users", label: "Lista Utenti", icon: <MdPeople /> },
    { key: "exerciseDB", label: "Exercise DB", icon: <MdFitnessCenter /> },
    { key: "profile", label: "Profilo", icon: <MdPerson /> },
  ];

  return (
    <div className="flex h-screen bg-brand-light shadow-none">
      {/* Sidebar mobile toggle */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded bg-brnad shadow"
        >
          <MdMenu size={24} />
        </button>
      </div>

      <Sidebar menuItems={menuItems} sidebarOpen={sidebarOpen} setView={setView} />

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 md:ml-4">

        <Header
          title={`Ciao, ${profile.name} 👋`}
          subtitle="Ecco i tuoi clienti."
        />

        {view === "users" && (
          <div className="p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Lista Utenti</h2>
            {userList.length === 0 ? (
              <p>Nessun utente registrato.</p>
            ) : (
              <ul className="space-y-2">
                {userList
                  .map(u => (
                    <li key={u.id}>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          handleSelectUser(u);
                        }}
                        className="w-full text-left px-4 py-2 rounded-1xl hover:bg-brand"
                      >
                        {u.name} {u.role === "admin" && "(Admin)"}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}


        {view === "exerciseDB" && (
          <div className="p-4 rounded shadow-none">
            <h2 className="text-2xl font-bold mb-4">Exercise DB</h2>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Carica JSON</label>
              <input type="file" accept=".json" onChange={handleJSONUpload} className="border p-2 rounded" />
            </div>

            <div className="mb-4">
              <button onClick={handleExportJSON} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Esporta JSON
              </button>
            </div>

            <ExerciseList exerciseDB={exerciseDB} setExerciseDB={setExerciseDB} />

            <button onClick={saveDb} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Salva DB
            </button>
          </div>
        )}

        {view === "profile" && (
          <div className="p-4 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Profilo Admin</h2>
            <p>Email: {user?.email}</p>
          </div>
        )}

        {view === "create" && selectedUser && (
          <div>
            <button
              onClick={() => setView("userWorkouts")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla lista dei workout
            </button>
            <CreateWorkout
              selectedUser={selectedUser}
              onGenerated={(data) => {
                setWorkoutData(data);
                handleSelectUser(selectedUser); // aggiorna lista
              }}
            />
          </div>
        )}

        {view === "upload" && selectedUser && (
          <UploadWorkout
            onLoad={(data) => {
              setWorkoutData(data);
              setView("users");
            }}
          />
        )}


        {view === "userWorkouts" && selectedUser && (
          <div>
            <button
              onClick={() => setView("users")}
              className="mb-4 text-offwhite px-4 py-2 rounded hover:bg-brand-light"
            >
              ← Torna alla lista degli utenti
            </button>
            <div className="p-4 rounded">


              <h2 className="text-2xl font-bold mb-4">Workout di {selectedUser.name}</h2>

              <button
                onClick={() => setView("create")}
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Crea nuovo workout
              </button>

              {userWorkouts.length === 0 ? (
                <p>Nessun workout assegnato.</p>
              ) : (
                <ul className="space-y-2">
                  {userWorkouts.map(w => (
                    <li key={w.id} className="flex justify-between items-center p-2  bg-brand rounded hover:bg-brand-light shadow">
                      <span>{w.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setWorkoutData(w.groups);
                            setView("preview"); // puoi riusare la PreviewWorkout
                          }}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Cancella
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}


        {view === "preview" && workoutData && (
          <div>
            <button
              onClick={() => setView("userWorkouts")}
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
      </main>
    </div>
  );
}
