// src/style/getGroupTag.js
export const getGroupTag = (name) => {
    const normalized = name.toLowerCase() || "";

    if (normalized.includes("emom"))
        return { label: "EMOM", color: "bg-blue-600", icon: "🔁" };
    if (normalized.includes("tabata"))
        return { label: "TABATA", color: "bg-red-600", icon: "⏱️" };
    if (normalized.includes("amrap"))
        return { label: "AMRAP", color: "bg-yellow-500", icon: "♻️" };
    if (normalized.includes("interval"))
        return { label: "INTERVAL", color: "bg-green-600", icon: "⏯️" };

    return { label: "STANDARD", color: "bg-gray-600", icon: "🏋️" };
};