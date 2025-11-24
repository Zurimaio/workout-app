import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, getDocs, collection, deleteDoc, setDoc, query, orderBy} from "firebase/firestore";
import ExerciseList from "./ExerciseList";
import UploadWorkout from "../UploadWorkout";
import PreviewWorkout from "../User/PreviewWorkout";
import Header from "../Header";
import UserProfile from "../../hooks/UserProfile";
import Sidebar from "../Sidebar";
import WorkoutEditor from "./WorkoutEditor"
import UserWorkoutsList from "./UserWorkoutsList";
import { useAuth } from "../../contexts/AuthContext";

import { MdPeople, MdFitnessCenter, MdPerson, MdMenu } from "react-icons/md";

export default function AdminPanel() {
  const { user } = useAuth();
  const [exerciseDB, setExerciseDB] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("users"); // users, exerciseDB, profile, create, upload
/*   const [sidebarOpen, setSidebarOpen] = useState(false);
 */  const [selectedUser, setSelectedUser] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState({});
  const {profile, loadingProfile} = UserProfile(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  



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
// Recupero i workout dell'utente (ordinati e raggruppati per mese)
const fetchUserWorkouts = async (uid) => {
  try {
    const colRef = collection(db, "workouts", uid, "userWorkouts");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null,
    }));

    // Raggruppa per mese/anno
    const grouped = data.reduce((acc, workout) => {
      const date = workout.createdAt ? new Date(workout.createdAt) : new Date();
      const key = date.toLocaleString("it-IT", { month: "long", year: "numeric" });
      if (!acc[key]) acc[key] = [];
      acc[key].push(workout);
      return acc;
    }, {});

    setUserWorkouts(grouped);
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

  const handleUpdateWorkout = async (updatedData) => {
  if (!selectedUser || !workoutData) return;

  try {
    const workoutRef = doc(
      db,
      "workouts",
      selectedUser.id,
      "userWorkouts",
      workoutData.id
    );

    await setDoc(
      workoutRef,
      {
        ...updatedData,
        name: workoutData.name, // preservo il nome originale
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.info("Workout aggiornato:", workoutData.id);
    alert("✅ Workout aggiornato con successo!");

    await fetchUserWorkouts(selectedUser.id);
    setView("userWorkouts");
  } catch (err) {
    console.error("Errore aggiornamento workout:", err);
    alert("❌ Errore durante l'aggiornamento!");
  }
};


// Funzione separata per salvare/aggiornare un workout
const handleSaveWorkout = async (updatedData) => {
  if (!selectedUser) return;

  try {
    const workoutId = workoutData?.id || Date.now().toString(); // nuovo ID se creazione
    const workoutRef = doc(
      db,
      "workouts",
      selectedUser.id,
      "userWorkouts",
      workoutId
    );

    await setDoc(
      workoutRef,
      {
        ...updatedData,
        updatedAt: new Date().toISOString(), // timestamp utile
      },
      { merge: true }
    );

    alert("✅ Workout salvato con successo!");
    await fetchUserWorkouts(selectedUser.id); // aggiorna lista
    setView("userWorkouts"); // torna alla lista
  } catch (err) {
    console.error("Errore salvataggio workout:", err);
    alert("❌ Errore durante il salvataggio!");
  }
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

  const handleChangeWorkout = async (workoutId) => {
  if (!selectedUser) return;
  try {
    const workoutRef = doc(db, "workouts", selectedUser.id, "userWorkouts", workoutId);
    const workoutSnap = await getDoc(workoutRef);

    if (workoutSnap.exists()) {
      const workoutData = workoutSnap.data();
      setWorkoutData({ ...workoutData, id: workoutId }); // includo anche id per aggiornare dopo
      setView("edit"); // nuova vista di editing
    } else {
      alert("Workout non trovato!");
    }
  } catch (err) {
    console.error("Errore caricamento workout:", err);
    alert("Errore durante il caricamento!");
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

    <Sidebar menuItems={menuItems} sidebarOpen={sidebarOpen} setView={setView} setSidebarOpen={setSidebarOpen} />

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
        
    {/*--- Sezione JSX per creazione o modifica workout*/}        
        {(view === "create" || view === "edit") && selectedUser && (
          <div>
            <button
              onClick={() => setView("userWorkouts")}
              className="mb-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ← Torna alla lista dei workout
            </button>

            <WorkoutEditor
              selectedUser={selectedUser}
              initialData={view === "edit" ? workoutData : null} // dati esistenti se modifica
              onSave={handleSaveWorkout} // passiamo la funzione separata
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
          <UserWorkoutsList
            selectedUser={selectedUser}
            userWorkouts={userWorkouts}
            setView={setView}
            setWorkoutData={setWorkoutData}
            handleChangeWorkout={handleChangeWorkout}
            handleDeleteWorkout={handleDeleteWorkout}
          />
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
