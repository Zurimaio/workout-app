import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import LoadingOverlay from "./LoadingOverlay";
import { Eye, ListOrdered, Dumbbell } from 'lucide-react';


export default function MyWorkouts({ onPreview, onStart }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, "workouts", user.uid, "userWorkouts");
        const snapshot = await getDocs(colRef);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          groupCount: doc.data().groups ? Object.keys(doc.data().groups).length : 0
        }));
        setWorkouts(data);

      } catch (err) {
        console.error("Errore caricamento workout:", err);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  if (!user) return <p className="p-4 text-gray-700">Devi essere loggato per vedere i tuoi workout.</p>;


  return (
    <div className="p-4 w-full mx-auto md:p-6">
      {/* Overlay */}
      <LoadingOverlay isVisible={loading} />

      {/* Titolo */}
      <h2 className="text-3xl font-bold mb-6 text-offwhite md:text-gray-900">Le mie Schede</h2>

      {loading && <p className="text-gray-500">Caricamento in corso...</p>}

      {!loading && !workouts.length && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-500" />
            Nessun workout salvato. Inizia ad allenarti!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* CARD: Mobile Scuro/Grande vs Desktop Chiaro/Compatto */}
        {/* ATTENZIONE: key e className sono ora sulla stessa riga per evitare l'errore 69:12 */}
        {workouts.map(w => (


          <div key={w.id}
            className="bg-brand-dark md:bg-brand-dark rounded-xl shadow-xl md:shadow-md p-5 md:p-3 transition duration-300 hover:shadow-2xl md:hover:shadow-lg"
          >

            {/* Contenitore Layout: Mobile (Stack) vs Desktop (Flex orizzontale) */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">

              {/* Dettagli Scheda */}
              <div className="mb-3 md:mb-0 md:flex md:items-center md:gap-4 md:flex-1">
                {/* Nome: Mobile (text-xl Scuro) vs Desktop (text-lg Chiaro) */}
                <h3 className="text-xl md:text-lg font-extrabold md:font-semibold text-offwhite md:text-offwhite mb-2 md:mb-0 truncate">
                  {w.name || `Workout ${w.id}`}
                </h3>

                {/* Gruppi: Colore ottimizzato per sfondo scuro/chiaro */}
                <span className="text-sm font-medium text-offwhite/70 md:text-offwhite-500 flex items-center gap-1">
                  <ListOrdered className="w-4 h-4 text-blue-500" />
                  {w.groupCount} Gruppi
                </span>
              </div>

              {/* Pulsante Anteprima: Mobile (Centrato e Grande) vs Desktop (A destra e Piccolo) */}
              <div className="flex justify-center mt-4 md:mt-0 md:ml-4">
                <button
                  onClick={() => onPreview(w.groups)}
                  className="w-full md:w-auto bg-green-500 text-white py-3 md:py-1 px-4 rounded-lg shadow-lg md:shadow-sm hover:bg-green-600 transition flex items-center justify-center gap-2 font-bold text-base md:text-sm"
                >
                  <Eye className="w-5 h-5 md:w-4 md:h-4" />  Anteprima
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}