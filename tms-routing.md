# tms-routing.md

## Overview
Implement advanced TMS/Logistics routing logic for shipments and trips, supporting manual entry, bulk import, multi-depot transits (Hub-to-Hub, Inbound, Outbound), and smart matching at the gate.

## Success Criteria
- Updated data model in types and database to handle Real Origin/Destination geography, Operational Origin/Destination Hubs, and Hub Operation Types.
- Enhanced Import functionality in UI supporting these new columns.
- Manual Form supporting all new fields in Italian.
- Dynamic filtering on Yard Boards (Arrivi & Partenze) based on active Hub and routing leg type.
- Smart Gate Check-in matches input references or license plates to proposed legs, with fallback for immediate yard registration and manual association.
- Clear menu separation of bound vs unbound trips/shipments.

## Tech Stack
- Frontend: React 18, TypeScript, Tailwind CSS, Vite.
- Backend: Vercel serverless functions (neon postgres in prod, local_db.json in dev).

## File Structure
- `src/types/index.ts`: Update Shipment type definition.
- `api/data.ts`: Update Postgres and mock SQL database schema, seeding, and API payload parsing.
- `src/context/AppContext.tsx`: Update shipment action creators (`addShipment`, `updateShipment`).
- `src/pages/MonitorYard.tsx`: Update UI, forms, CSV importer, smart gate check-in, and filtering.

## Task Breakdown

### Task 1: Data Model Updates (P0)
- **Agent**: `database-architect` / `backend-specialist`
- **Description**: Add real geography and hub routing columns to `Shipment` interface and PostgreSQL/Mock DB schema.
- **INPUT**: `src/types/index.ts` and `api/data.ts`
- **OUTPUT**: Updated types and SQL tables (with database migration logic in data.ts startup)
- **VERIFY**: Run typescript checks `npx tsc --noEmit`.

### Task 2: AppContext Service Integration (P1)
- **Agent**: `backend-specialist`
- **Description**: Update AppContext logic to save and update the new routing fields on the server.
- **INPUT**: `src/context/AppContext.tsx`
- **OUTPUT**: Updated CRUD functions for shipments passing the new fields.
- **VERIFY**: Check function calls match types.

### Task 3: Inserimento Manuale & Importazione Massiva UI (P2)
- **Agent**: `frontend-specialist`
- **Description**: Update the CSV import parser and manual shipment creation form to support real geography and operational hub legs.
- **INPUT**: `src/pages/MonitorYard.tsx`
- **OUTPUT**: Form input elements and CSV columns matching the new data structure.
- **VERIFY**: Run local preview and test CSV import.

### Task 4: Yard Board Dynamic Filters & Gate Match (P2)
- **Agent**: `frontend-specialist`
- **Description**: Apply hub-based filtering on Arrivi and Partenze tabelloni. Implement gate check-in matching by reference/license plate and subsequent manual linking UI.
- **INPUT**: `src/pages/MonitorYard.tsx`
- **OUTPUT**: Gate form with auto-suggestions, confirmation, and a manual link button in the dashboard.
- **VERIFY**: Validate check-in workflow.

### Phase X: Final Verification
- Run typescript compilation checks.
- Run linting checks.
- Verify UI styling rules.
