import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function WorkoutStatsCharts({ stats }) {
  if (!stats) return null;

  const { ambitoPercent, ambitoStats } = stats;

  const pieData = Object.keys(ambitoPercent).map(a => ({
    name: a,
    value: parseFloat(ambitoPercent[a])
  }));

  const barSetsData = Object.keys(ambitoStats).map(a => ({
    name: a,
    sets: ambitoStats[a].sets
  }));

  const barVolumeData = Object.keys(ambitoStats).map(a => ({
    name: a,
    volume: ambitoStats[a].volume
  }));

  const barDurationData = Object.keys(ambitoStats).map(a => ({
    name: a,
    duration: Math.round(ambitoStats[a].duration / 60)
  }));

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f7f",
    "#8dd1e1",
    "#a4de6c"
  ];

  return (
    <div className="space-y-10 w-full">
      {/* Percentuale esercizi per Ambito */}
      <div className="p-6 bg-brand rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Distribuzione esercizi per Ambito</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sets totali per Ambito */}
      <div className="p-6 bg-brand rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Set totali per Ambito</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={barSetsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sets" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume totale per Ambito */}
      <div className="p-6 bg-brand rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Volume totale per Ambito</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={barVolumeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volume" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Durata per Ambito */}
      <div className="p-6 bg-brand rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Durata stimata per Ambito (minuti)</h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={barDurationData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
