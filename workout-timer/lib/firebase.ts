// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Sostituisci questi valori con quelli della tua Firebase Web App
const firebaseConfig = {
  apiKey: "AIzaSyCbdi3Ek9dLagCYHpnQwB1foGgYqNwXZkg",
  authDomain: "calisthenics-workout-tra-a0036.firebaseapp.com",
  projectId: "calisthenics-workout-tra-a0036",
  storageBucket: "calisthenics-workout-tra-a0036.firebasestorage.app",
  messagingSenderId: "455453827559",
  appId: "1:455453827559:web:967c673ab246b82f6fdd42",
  measurementId: "G-JP3EJ57QCT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)
export const auth = getAuth(app);
export const db = getFirestore(app);
