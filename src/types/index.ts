export interface Depot {
  id: string;
  name: string;
  city: string;
}

export interface Bay {
  id: string;
  depotId: string;
  name: string; // e.g., "Baia A1", "Baia A2"
  status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE';
  currentBookingId?: string; // Links to the booking currently occupying the bay
}

export interface Carrier {
  id: string;
  name: string;
  email: string;
  status: 'ATTESA_APPROVAZIONE' | 'APPROVATO' | 'RIFIUTATO';
  licensePlate?: string; // Default or reference license plate
}

export interface Booking {
  id: string;
  carrierId: string;
  depotId: string;
  date: string; // YYYY-MM-DD
  activityType: 'CARICO' | 'SCARICO';
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
  timestamp: string; // ISO string or time representation
  depotId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}
