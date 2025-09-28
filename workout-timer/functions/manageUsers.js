// manageUserCLI.js
import admin from "firebase-admin";
import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";

// Carica il service account
const serviceAccount = JSON.parse(
    fs.readFileSync("./calisthenics-workout-tra-a0036-firebase-adminsdk-fbsvc-9b488b8b1f.json", "utf8")
);

// Inizializza Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://calisthenics-workout-tra-a0036.firebaseio.com",
    });
}

// Genera password random
function generatePassword(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Funzioni principali
async function listUsers() {
    const db = admin.firestore();
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

async function showUsers() {
    const users = await listUsers();
    if (!users.length) return console.log(chalk.yellow("⚠️ Nessun utente trovato."));
    console.log(chalk.cyan("\n📋 Lista utenti:"));
    users.forEach(u => console.log(chalk.green(`- ${u.name} (${u.email}) [${u.role}]`)));
}

async function createUser() {
    const answers = await inquirer.prompt([
        { name: "email", message: "✉️  Email:" },
        { name: "name", message: "👤 Nome utente:", default: "Nuovo Utente" }
    ]);
    const password = generatePassword();
    try {
        const userRecord = await admin.auth().createUser({
            email: answers.email,
            password,
            displayName: answers.name
        });
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            name: answers.name,
            email: answers.email,
            role: "user",
            createdAt: new Date().toISOString()
        });
        console.log(chalk.green(`✅ Utente creato: ${answers.email}`));
        console.log(chalk.blue(`🔑 Password: ${password}\n`));
    } catch (err) {
        console.error(chalk.red("❌ Errore creazione utente:"), err.message);
    }
}

async function deleteUser() {
    const users = await listUsers();
    if (!users.length) return console.log(chalk.yellow("⚠️ Nessun utente da cancellare."));
    const answers = await inquirer.prompt([{
            type: "list",
            name: "uid",
            message: "❌ Seleziona l'utente da cancellare:",
            choices: users.map(u => ({ name: `${u.name} (${u.email})`, value: u.uid }))
        },
        { type: "confirm", name: "confirm", message: "Sei sicuro?", default: false }
    ]);
    if (!answers.confirm) return console.log(chalk.yellow("⚠️ Cancellazione annullata."));
    try {
        await admin.auth().deleteUser(answers.uid);
        await admin.firestore().collection("users").doc(answers.uid).delete();
        console.log(chalk.green("✅ Utente cancellato con successo!\n"));
    } catch (err) {
        console.error(chalk.red("❌ Errore cancellazione:"), err.message);
    }
}

async function resetPassword() {
    const users = await listUsers();
    if (!users.length) return console.log(chalk.yellow("⚠️ Nessun utente disponibile."));
    const answers = await inquirer.prompt([{
            type: "list",
            name: "uid",
            message: "🔑 Seleziona l'utente:",
            choices: users.map(u => ({ name: `${u.name} (${u.email})`, value: u.uid }))
        },
        { type: "input", name: "password", message: "Nuova password (lascia vuoto per generarla automaticamente):" }
    ]);
    const newPassword = answers.password || generatePassword();
    try {
        await admin.auth().updateUser(answers.uid, { password: newPassword });
        console.log(chalk.green(`✅ Password aggiornata: ${newPassword}\n`));
    } catch (err) {
        console.error(chalk.red("❌ Errore reset password:"), err.message);
    }
}

// Menu interattivo
async function main() {
    const answer = await inquirer.prompt([{
        type: "list",
        name: "action",
        message: "🛠️  Cosa vuoi fare?",
        choices: [
            { name: "📋 Mostra lista utenti", value: "show" },
            { name: "➕ Crea utente", value: "create" },
            { name: "❌ Cancella utente", value: "delete" },
            { name: "🔑 Reset password", value: "reset" },
            { name: "🚪 Esci", value: "exit" }
        ]
    }]);

    if (answer.action === "create") await createUser();
    else if (answer.action === "delete") await deleteUser();
    else if (answer.action === "reset") await resetPassword();
    else if (answer.action === "show") await showUsers();
    else return console.log(chalk.blue("👋 Arrivederci!"));

    // Torna al menu
    main();
}

main();