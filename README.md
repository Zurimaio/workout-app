# Workout App

Workout App è una piattaforma web per creare, gestire e seguire schede di allenamento personalizzate.  

## Funzionalità principali

- **Admin**: può creare e caricare workout, associandoli agli utenti.
- **Utente standard**: può visualizzare le proprie schede assegnate dall’admin, vedere la preview e avviare il timer per gli esercizi.
- **Preview workout**: visualizzazione dettagliata dei gruppi e degli esercizi (set, volume, unità, riposo).
- **Timer integrato**: guida l’utente nell’esecuzione degli esercizi.

## Tecnologia

- **Frontend**: React, TailwindCSS
- **Backend / DB**: Firebase Firestore & Firebase Authentication
- **Gestione utenti**: ruoli Admin e Standard

## Come usare

1. Registrati o effettua il login.
2. Se sei Admin, puoi creare o caricare workout.
3. Se sei utente standard, puoi visualizzare le tue schede e avviare il timer.

## Struttura del progetto

- `src/components/` - componenti React principali (Login, MyWorkouts, CreateWorkout, PreviewWorkout, Timer, ecc.)
- `src/contexts/AuthContext.jsx` - gestione autenticazione e ruoli utente
- `lib/firebase.js` - configurazione Firebase

---

💡 **Nota:** L’app utilizza i ruoli utente per gestire i permessi. Solo gli Admin possono modificare e caricare nuovi workout.
