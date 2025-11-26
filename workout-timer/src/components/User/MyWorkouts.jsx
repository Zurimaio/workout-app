import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import LoadingOverlay from "../../style/LoadingOverlay";
import { Eye, ListOrdered, Dumbbell } from "lucide-react";

export default function MyWorkouts({ onPreview, onStart }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, "workouts", user.uid, "userWorkouts");
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          groupCount: doc.data().groups
            ? Object.keys(doc.data().groups).length
            : 0,
          createdAt: doc.data().createdAt instanceof Object && doc.data().createdAt.toDate
            ? doc.data().createdAt.toDate()
            : new Date(doc.data().createdAt),

        }));

        // Raggruppa per mese/anno
        const grouped = data.reduce((acc, workout) => {
          const date = workout.createdAt
            ? new Date(workout.createdAt)
            : new Date();
          const key = date.toLocaleString("it-IT", {
            month: "long",
            year: "numeric",
          });
          if (!acc[key]) acc[key] = [];
          acc[key].push(workout);
          return acc;
        }, {});

        setWorkouts(grouped);
      } catch (err) {
        console.error("Errore caricamento workout:", err);
        setWorkouts({});
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  if (!user)
    return (
      <p className="p-4 text-gray-700">
        Devi essere loggato per vedere i tuoi workout.
      </p>
    );

  return (
    <div className="p-4 w-full mx-auto md:p-6">
      {/* Overlay */}
      <LoadingOverlay isVisible={loading} />

      {/* Titolo */}
      <h2 className="text-3xl font-bold mb-6 text-offwhite">Le mie Schede</h2>

      {loading && <p>Caricamento in corso...</p>}

      {!loading && Object.keys(workouts).length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-500" />
            Nessun workout salvato. Inizia ad allenarti!
          </p>
        </div>
      )}

      {/* Sezioni per mese */}
      {!loading &&
        Object.keys(workouts).map((month) => (
          <div key={month} className="mb-10">
            <h3 className="text-2xl font-bold text-offwhite mb-4 capitalize">
              {month}
            </h3>

            <div className="space-y-4">
              {workouts[month].map((w) => (
                <div
                  key={w.id}
                  className="bg-brand-dark rounded-xl shadow-xl p-5 transition duration-300 hover:shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    {/* Dettagli scheda */}
                    <div className="mb-3 md:mb-0 md:flex md:items-center md:gap-4 md:flex-1">
                      <h3 className="text-xl font-extrabold text-offwhite mb-2 md:mb-0 truncate">
                        {w.name || `Workout ${w.id}`}
                      </h3>
                      <span className="text-sm font-medium text-offwhite/70 flex items-center gap-1">
                        <ListOrdered className="w-4 h-4 text-blue-500" />
                        {w.groupCount} Gruppi
                      </span>
                    </div>

                    {/* Pulsante anteprima */}
                    <div className="flex justify-center mt-4 md:mt-0 md:ml-4">
                      <button
                        onClick={() => {
                          console.log("CLICK SU PREVIEW:", w);
                          onPreview && onPreview(w);
                        }}
                        className="w-full md:w-auto bg-green-500 text-white py-3 md:py-1 px-4 rounded-lg shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-bold text-base"
                      >
                        <Eye className="w-5 h-5" /> Visualizza
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
