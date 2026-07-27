export interface Depot {
  id: string;
  name: string;
  city: string;
}

export interface WarehouseModule {
  id: string;
  depotId: string; // Plant ID
  name: string; // e.g., "Modulo A", "Modulo B"
  description?: string;
}

export interface Bay {
  id: string;
  depotId: string;
  moduleId?: string; // Links to WarehouseModule
  name: string; // e.g., "Baia A1", "Baia A2"
  status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE';
  currentBookingId?: string; // Links to the booking currently occupying the bay
}

export interface Carrier {
  id: string;
  name: string;
  email: string;
  status: 'ATTESA_APPROVAZIONE' | 'APPROVATO' | 'RIFIUTATO';
  licensePlate?: string; // Default license plate
  phone?: string;
  vatNumber?: string; // Partita IVA
}

export interface Booking {
  id: string;
  carrierId: string;
  depotId: string;
  date: string; // YYYY-MM-DD
  activityType: string; // e.g. "CARICO", "SCARICO", "RESO" (dynamically managed)
  status: 'PRENOTATO' | 'AL_CANCELLO' | 'IN_BAIA' | 'COMPLETATO' | 'ANNULLATO';
  bayId?: string; // Assigned during gate check-in
  licensePlate: string;
  driverName: string;
  timeInGate?: string; // ISO string when truck arrived at gate
  timeInBay?: string;  // ISO string when loading/unloading started
  timeOutBay?: string; // ISO string when activity finished
  timeOutGate?: string; // ISO string when truck departed
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  depotId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}

export interface ActivityType {
  id: string;
  name: string; // e.g., "Carico", "Scarico", "Reso Cliente"
  code: string; // e.g., "CARICO", "SCARICO", "RESO"
}

export interface ReportSchedule {
  id: string;
  name: string;
  frequency: 'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE';
  recipients: string; // e.g. "email1@logisticauno.it, email2@..."
  reportType: string; // e.g. "Tempi Turnaround", "Saturazione Baie"
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GUARDIA_CANCELLO' | 'OPERATORE_YARD';
  depotId?: string; // Optional: assigned to a specific Plant (Hub) for guardiola
}
