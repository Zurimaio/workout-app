const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Funzione callable: nessun problema CORS
exports.createClient = functions.https.onCall(async(data, context) => {
    const { name, email } = data;

    if (!name || !email) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Nome ed email sono obbligatori."
        );
    }

    // Genera password semplice
    const password = Math.random().toString(36).slice(-10);

    try {
        // Crea utente in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // Salva anche in Firestore
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            email,
            name,
            role: "client",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            success: true,
            user: {
                uid: userRecord.uid,
                email,
                name,
            },
            password,
        };
    } catch (err) {
        console.error("Errore creazione utente:", err);
        throw new functions.https.HttpsError("internal", err.message);
    }
});