# Gestione Baie e Yard - Piano di Progetto

## Overview
Creazione di un'applicazione web in lingua **italiana** per la gestione delle baie di carico/scarico e del piazzale (Yard & Dock Management). L'app consentirà ai vettori di effettuare prenotazioni, e agli operatori e guardie di magazzino di gestire l'intero ciclo di vita dell'ingresso, sosta e uscita dei veicoli tramite un pannello di controllo interattivo con estetica Cyber-Industrial Dark Mode.

---

## Project Type
**WEB** (Vite + React + Tailwind CSS v4)

---

## Success Criteria
1. Interfaccia completamente in **italiano**.
2. Estetica **Cyber-Industrial Dark Mode** coerente: sfondo grigio scuro/nero, spigoli netti (`rounded-none`), contrasto con Arancione e Giallo Cantiere, e Verde Neon.
3. Simulazione di 3 ruoli (Amministratore, Vettore, Operatore/Guardia) con uno switcher istantaneo per i test.
4. Flusso completo del camion funzionante: Prenotato -> Arrivato al cancello -> Baia assegnata -> Attività avviata -> Attività terminata -> Uscito.
5. Log delle attività operatore visualizzato in tempo reale.
6. Persistenza dei dati in `localStorage` con pulsante per ripristinare i valori predefiniti di fabbrica.
7. Nessun errore di compilazione TypeScript o linter.

---

## Tech Stack
- **Framework**: React 18 / 19 (con TypeScript)
- **Tooling**: Vite (sviluppo super rapido e build ottimizzata)
- **Styling**: Tailwind CSS v4 (approccio CSS-first, variabili di design integrate, senza componenti terzi pronti)
- **Stato**: React AppContext + `localStorage` sync.

---

## File Structure
```plaintext
GestioneBaie/
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── context/
    │   └── AppContext.tsx
    ├── components/
    │   ├── Sidebar.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── Badge.tsx
    │       ├── Table.tsx
    │       └── Input.tsx
    └── pages/
        ├── DashboardAdmin.tsx
        ├── PortaleVettori.tsx
        ├── MonitorYard.tsx
        └── ReportStatistiche.tsx
```

---

## Task Breakdown

### Fase 1: Inizializzazione Ambiente (P0)
- **Task 1.1**: Inizializzare l'applicazione React con Vite e Tailwind CSS v4 in modo non interattivo.
  - *Input*: Workspace vuoto.
  - *Output*: File `package.json`, `index.html`, `vite.config.ts`, `src/main.tsx` e file CSS iniziale.
  - *Verify*: Il build di base funziona ed è eseguibile.
- **Task 1.2**: Scrivere `src/index.css` per definire il tema Cyber-Industrial Dark Mode (variabili colore, bordi netti, sfondi scuri, animazioni).
  - *Input*: File CSS vuoto.
  - *Output*: CSS globale configurato con lo stile personalizzato ad alto contrasto.
  - *Verify*: Presenza di classi per bottoni piatti e contrasti forti.

### Fase 2: Tipi e Context di Stato (P0)
- **Task 2.1**: Creare `src/types/index.ts` con i modelli dati italiani/inglesi (Magazzino, Baia, Vettore, Prenotazione, Log delle Operazioni).
  - *Input*: File vuoto.
  - *Output*: Tipi TypeScript definiti.
  - *Verify*: La compilazione con `tsc --noEmit` passa.
- **Task 2.2**: Creare `src/context/AppContext.tsx` con i dati iniziali di mock e le azioni di stato per gestire il ciclo dei camion.
  - *Input*: Tipi TypeScript.
  - *Output*: Provider React funzionante con persistenza `localStorage`.
  - *Verify*: Le azioni di stato modificano correttamente le baie e le prenotazioni.

### Fase 3: Componenti UI Base e Layout (P1)
- **Task 3.1**: Creare i componenti grafici spigolosi in `src/components/ui/` (`Button`, `Card`, `Table`, `Badge`, `Input`).
  - *Input*: Classi Tailwind v4.
  - *Output*: Componenti riutilizzabili.
  - *Verify*: Rendono correttamente con bordo da 1px o 2px ed angoli retti.
- **Task 3.2**: Creare `src/components/Sidebar.tsx` con la barra di navigazione e lo switcher rapido dei ruoli in test.
  - *Input*: Componenti UI di base.
  - *Output*: Sidebar con visualizzazione del ruolo simulato attivo.
  - *Verify*: Lo switcher dei ruoli modifica lo stato di simulazione globale.

### Fase 4: Moduli Amministrazione & Portale Vettori (P1)
- **Task 4.1**: Creare la pagina amministrativa `src/pages/DashboardAdmin.tsx` (configurazione hub/baie, elenco vettori, approvazione).
  - *Input*: AppContext.
  - *Output*: Interfaccia amministratore completa.
  - *Verify*: È possibile aggiungere baie e approvare vettori in sospeso.
- **Task 4.2**: Creare la pagina `src/pages/PortaleVettori.tsx` (richiesta prenotazioni e storico per vettori approvati).
  - *Input*: AppContext.
  - *Output*: Interfaccia portale vettori.
  - *Verify*: Invio di prenotazioni per target date ed activity type.

### Fase 5: Monitor Yard & Operazioni Baie (P1)
- **Task 5.1**: Creare la pagina della dashboard live `src/pages/MonitorYard.tsx` (vista per operatori/guardia con gestione stati baie e camion).
  - *Input*: AppContext.
  - *Output*: Dashboard live in tempo reale con visualizzazione HUD delle baie.
  - *Verify*: Flusso completo Cancello -> Assegnazione Baia -> Avvio Attività -> Rilascio -> Uscita.

### Fase 6: Reporting & Analisi (P2)
- **Task 6.1**: Creare `src/pages/ReportStatistiche.tsx` (tempi medi di sosta, occupazione baie, volumi giornalieri).
  - *Input*: Storico delle prenotazioni completate.
  - *Output*: Schermata reportistica ad alto contrasto.
  - *Verify*: Calcolo matematico corretto dei parametri di efficienza.

---

## Phase X: Final Verification
- [x] No purple/violet hex codes or styling gradients (Purple Ban)
- [x] No rounded corners beyond `rounded-[2px]` (Sharp edges rule)
- [x] Run Linter: `npm run lint`
- [x] Run Type Check: `npx tsc --noEmit`
- [x] Run Build: `npm run build`
- [x] Run Dev Server and perform complete verification checklist

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-07-24
