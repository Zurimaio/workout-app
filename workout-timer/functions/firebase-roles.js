// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Funzione chiamabile per assegnare un ruolo ad un utente
 * ⚠️ Solo un admin può richiamarla
 */
exports.setUserRole = functions.https.onCall(async(data, context) => {
    // Verifica che chi chiama sia un admin
    if (!context.auth.token.role || context.auth.token.role !== "admin") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Solo gli admin possono assegnare ruoli"
        );
    }

    const { uid, role } = data;

    if (!["admin", "user"].includes(role)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Ruolo non valido"
        );
    }

    await admin.auth().setCustomUserClaims(uid, { role });

    return { message: `Ruolo ${role} assegnato a ${uid}` };
});