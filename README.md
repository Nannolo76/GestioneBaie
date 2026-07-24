# GestioneBaie - Yard & Dock Management System

Portale enterprise in **italiano** per la gestione delle baie di carico/scarico e del piazzale (Yard and Dock Management), specificamente progettato per la prenotazione dei vettori, il check-in al cancello e le operazioni di baia.

Adotta uno stile visivo **Cyber-Industrial (Dark Mode)** ad alto contrasto con spigoli vivi (0px) e accenti arancioni, gialli e verdi.

---

## 🚀 Caratteristiche Principali

1. **Simulatore di Console Integrato**: Switcher di ruoli rapido nella barra laterale per passare istantaneamente tra i ruoli di **Guardia/Operatore**, **Vettore**, e **Amministratore** per scopi di dimostrazione e test.
2. **Monitor Yard Live (Guardia/Operatore)**:
   - Visualizzazione HUD dello stato delle baie (Libera/In Uso/Manutenzione).
   - Accettazione e check-in dei camion al cancello d'ingresso.
   - Assegnazione baie in tempo reale per le attività di carico e scarico.
   - Registro log delle operazioni di cantiere in tempo reale.
3. **Portale Vettori**:
   - Inserimento prenotazioni indicando data target, magazzino (Depot), tipo di attività (Carico/Scarico), targa e autista.
   - Storico delle proprie prenotazioni e monitoraggio dello stato in tempo reale.
4. **Pannello Amministratore**:
   - Configurazione multi-depot (creazione hub e gestione baie).
   - Abilitazione accessi utenti interni e assegnazione ruoli.
   - Pannello di approvazione e registrazione anagrafica dei vettori trasportatori.
5. **Report & Analisi**:
   - Monitoraggio volumi di camion giornalieri.
   - Calcolo del tasso di occupazione delle baie.
   - Tracciamento automatico del tempo medio di turnaround del piazzale (sosta totale dall'ingresso all'uscita).

---

## 🛠️ Tech Stack

- **Framework**: React + TypeScript
- **Tooling**: Vite
- **Styling**: Tailwind CSS v4 (Custom CSS theme con spigoli vivi, spazzolatura scanline e CRT overlay)
- **Persistenza**: React State + `localStorage` sync con pulsante di ripristino dati di fabbrica.

---

## 💻 Come Avviare l'Applicazione in Locale

1. Assicurati di avere [Node.js](https://nodejs.org/) installato.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
4. Apri l'indirizzo visualizzato in console (es. `http://localhost:5173`) nel browser.

---

## 🔬 Audit e Qualità
L'applicazione supera con successo tutti i controlli qualitativi automatici:
- **Linter & Compiler**: 0 errori di analisi statica o TypeScript.
- **Build**: Compilazione e minificazione pronte per la produzione (`npm run build`).
- **Antigravity Kit Checklist**: Superamento dei controlli di sicurezza, conformità UX, accessibilità, e SEO (inclusi tag Open Graph).
