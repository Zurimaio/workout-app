// 📌 Parser da JSON (gruppato come parseExcel)
const parseJson = (jsonData) => {
    try {
        const rawData = JSON.parse(jsonData);
        if (!Array.isArray(rawData)) {
            throw new Error("Il JSON deve contenere un array di esercizi");
        }

        const grouped = {};
        rawData.forEach((row) => {
            const groupId = row["Raggruppamento"];
            if (!groupId) return;

            if (!grouped[groupId]) {
                grouped[groupId] = [];
            }

            grouped[groupId].push({
                Tipologia: row["Tipologia"],
                Ambito: row["Ambito"],
                Esercizio: row["Esercizio"],
                set: Number(row["set"]) || 1,
                Volume: Number(row["Volume"]) || 0,
                Unita: row["Unità di Misura"] || "SEC",
                Rest: Number(row["Rest (secondi)"]) || 0,
            });
        });

        return grouped;
    } catch (err) {
        console.error("Errore parsing JSON:", err);
        return null;
    }
};