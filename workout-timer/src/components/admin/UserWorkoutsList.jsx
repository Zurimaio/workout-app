import React from "react";

export default function UserWorkoutsList({
  selectedUser,
  userWorkouts,
  setView,
  setWorkoutData,
  handleChangeWorkout,
  handleDeleteWorkout,
}) {
  if (!selectedUser) return null;

  return (
    <div>
      {/* 🔙 Torna indietro */}
      <button
        onClick={() => setView("users")}
        className="mb-4 text-offwhite px-4 py-2 rounded hover:bg-brand-light"
      >
        ← Torna alla lista degli utenti
      </button>

      <div className="p-4 rounded">
        <h2 className="text-2xl font-bold mb-4">
          Workout di {selectedUser.name}
        </h2>

        {/* ➕ Crea nuovo workout */}
        <button
          onClick={() => setView("create")}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crea nuovo workout
        </button>

        {Object.keys(userWorkouts).length === 0 ? (
          <p>Nessun workout assegnato.</p>
        ) : (
          <div className="space-y-6">
            {Object.keys(userWorkouts).map((month) => (
              <div key={month}>
                <h3 className="text-xl font-semibold text-offwhite mb-2 capitalize">
                  {month}
                </h3>

                <ul className="space-y-2">
                  {userWorkouts[month].map((w) => (
                    <li
                      key={w.id}
                      className="flex justify-between items-center p-3 bg-brand rounded hover:bg-brand-light shadow"
                    >
                      <div>
                        <span className="font-bold text-offwhite">
                          {w.name}
                        </span>
                        {w.createdAt && (
                          <p className="text-xs text-offwhite/60">
                            Creato il{" "}
                            {w.createdAt.toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>

                      {/* 🔘 Azioni */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setWorkoutData(w);
                            setView("preview");
                          }}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Visualizza
                        </button>

                        <button
                          onClick={() => handleChangeWorkout(w.id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Modifica
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
