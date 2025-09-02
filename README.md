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


## Migliorie pianificate

1. **Gestione utenti avanzata**
   - Filtri e ricerca utenti per l’admin
   - Possibilità di assegnare workout a utenti specifici

2. **Esperienza utente migliorata**
   - UI più moderna per MyWorkouts e PreviewWorkout
   - Card o tabella per anteprima workout più leggibile

3. **Funzionalità workout**
   - Cronologia completamento workout
   - Statistiche di performance (volume totale, tempo totale, ecc.)
   - Esportazione PDF della scheda

4. **Notifiche e promemoria**
   - Avvisi per iniziare i workout programmati
   - Reminder giornalieri per utenti standard

5. **Ottimizzazione tecnica**
   - Miglioramento caricamento dati da Firebase
   - Caching locale per velocizzare la visualizzazione
   - Gestione errori e fallback più robusti

6. **Sicurezza**
   - Verifica ruoli direttamente in Firebase Rules
   - Protezione dei dati utenti sensibili

## Installazione

```bash
git clone https://github.com/Zurimaio/workout-app.git
cd workout-app
npm install
npm run dev

💡 **Nota:** L’app utilizza i ruoli utente per gestire i permessi. Solo gli Admin possono modificare e caricare nuovi workout.
