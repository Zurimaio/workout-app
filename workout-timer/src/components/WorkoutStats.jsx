
export function WorkoutStats({ stats }) {
  if (!stats) return <p className="text-gray-400 italic">Nessun dato disponibile</p>;

  return (
    <><div className="mt-6 bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2">📊 Statistiche Workout</h3>
      <p><strong>Totale esercizi:</strong> {stats.totalExercises}</p>
      <p><strong>Totale set:</strong> {stats.setsTotal}</p>
      <p><strong>Durata stimata:</strong> {stats.estimatedDuration} min</p>
      <h4 className="mt-3 font-semibold">Distribuzione per ambito:</h4>
      <ul className="list-disc list-inside text-sm text-gray-700">
        {Object.entries(stats.ambitoPercent).map(([ambito, perc]) => (
          <li key={ambito}>{ambito}: {perc} ({stats.ambitoCount[ambito]} esercizi)</li>
        ))}
      </ul>
    </div>
    </>
  );
}
