import * as XLSX from "xlsx";

export function parseExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const cleaned = json.map((row) => ({
            raggruppamento: row["Raggrupamento"],
            tipologia: row["Tipologia"],
            ambito: row["Ambito"],
            esercizio: row["Esercizio"],
            set: row["Set"],
            volume: row["Volume"],
            unita: row["Unita"],
            rest: row["Rest"]
        }));
        console.log(cleaned)
        callback(cleaned);
    };
    reader.readAsArrayBuffer(file);
}