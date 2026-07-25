# Gestione Baie e Yard - Piano di Progetto (Allineamento Grafico Ticket)

## Overview
Creazione di un'applicazione web in lingua **italiana** per la gestione delle baie di carico/scarico e del piazzale (Yard & Dock Management) per Logistica Uno Europe. L'app consentirà ai vettori di effettuare prenotazioni, e alle guardie/operatori di gestire il piazzale in tempo reale. Lo stile grafico viene allineato a quello del **Portale Ticket** esistente (sfondo grigio/beige chiaro, superfici bianche con angoli arrotondati 12px, bordi sottili e sidebar con sfumatura blu aziendale).

---

## Project Type
**WEB** (Vite + React + Tailwind CSS v4)

---

## Success Criteria
1. Interfaccia completamente in **italiano**.
2. Stile grafico allineato al **Portale Ticket**:
   - Sfondo chiarissimo `#F5F0EB`.
   - Card e pannelli in bianco semi-trasparente `bg-white/80 backdrop-blur-md` con angoli arrotondati `rounded-xl` (12px) e ombreggiature tenui.
   - Bordi discreti `border-black/10`.
   - Pulsanti primari in celeste `#11BCEC` con hover blu `#004B97` e angoli arrotondati.
   - Sidebar aziendale con gradiente blu `bg-gradient-to-br from-[#003a75] via-[#004B97] to-[#0062b8]` e voci di menu arrotondate.
3. Simulazione di 3 ruoli (Amministratore, Vettore, Operatore/Guardia) con switcher nella sidebar.
4. Flusso completo del camion funzionante: Prenotato -> Arrivato al cancello -> Baia assegnata -> Attività avviata -> Attività terminata/Rilasciata -> Uscito.
5. Log delle attività operatore in tempo reale.
6. Persistenza in `localStorage` con pulsante di reset.
7. Nessun errore di compilazione TypeScript o linter.

---

## Tech Stack
- **Framework**: React 18 / 19 (con TypeScript)
- **Tooling**: Vite
- **Styling**: Tailwind CSS v4 (approccio CSS-first, variabili di design integrate)
- **Stato**: React AppContext + `localStorage` sync.

---

## File Structure
*(Identica alla precedente, modifichiamo solo gli stili ed i componenti)*
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

## Task Breakdown (Fase Aggiornamento Grafico)

### Fase G1: Aggiornamento Stili Globali (P0)
- **Task G1.1**: Riscrivere `src/index.css` per impostare il tema chiaro di sfondo (`#F5F0EB`), rimuovere la forzatura degli spigoli vivi a 0px, definire i font 'Inter' e le variabili di colore aziendali.
  - *Verify*: Lo sfondo generale diventa beige chiaro e gli elementi riprendono ad usare i bordi arrotondati standard.

### Fase G2: Aggiornamento Componenti Base (P1)
- **Task G2.1**: Modificare `src/components/ui/Button.tsx` per rimuovere lo spessore inferiore, configurare gli angoli arrotondati e impostare il colore celeste `#11BCEC`.
- **Task G2.2**: Modificare `src/components/ui/Card.tsx` per cambiare lo stile in bianco semi-trasparente sfocato con bordo leggero.
- **Task G2.3**: Modificare `src/components/ui/Badge.tsx`, `src/components/ui/Input.tsx` e `src/components/ui/Table.tsx` per allineare geometrie, bordi e colori.
  - *Verify*: I pulsanti, i campi di input e le tabelle mostrano gli angoli arrotondati e i colori chiari del portale ticket.

### Fase G3: Aggiornamento Layout e Sidebar (P1)
- **Task G3.1**: Modificare `src/components/Sidebar.tsx` per applicare il gradiente blu (`#003a75` -> `#0062b8`), gli elementi di navigazione arrotondati `rounded-xl`, e la finitura del pannello utente in stile `bg-white/10 border-white/10`.
  - *Verify*: La sidebar assume l'aspetto professionale del portale ticket originale.

---

## Phase X: Final Verification
- [ ] Angoli arrotondati `rounded-xl` / `rounded-lg` attivi su tutte le schede e pulsanti
- [ ] Sidebar con gradiente blu aziendale e testi bianchi
- [ ] Sfondo chiaro `#F5F0EB` e card bianche con ombreggiatura
- [ ] Run Linter: `npm run lint`
- [ ] Run Type Check: `npx tsc --noEmit`
- [ ] Run Build: `npm run build`
