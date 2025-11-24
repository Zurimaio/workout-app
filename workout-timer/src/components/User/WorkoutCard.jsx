export function WorkoutPreview({ groups }) {
  if (!groups || groups.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm">
        Nessun esercizio aggiunto
      </p>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-3">📝 Anteprima Workout</h3>

      <div className="space-y-4">
        {groups.map((g, gi) => (
          <div key={gi}>
            <h4 className="font-semibold mb-2">{g.title}</h4>

            <div className="space-y-2">
              {g.exercises.map((ex, ei) => (
                <div
                  key={ei}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{ex.name}</p>
                    <p className="text-xs text-gray-500">
                      {ex.sets}×{ex.reps} {ex.time ? `• ${ex.time}s` : ""}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {ex.ambito}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
