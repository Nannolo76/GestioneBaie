import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Depot, Bay, Carrier, Booking, ActivityLog } from '../types';

interface AppContextType {
  depots: Depot[];
  bays: Bay[];
  carriers: Carrier[];
  bookings: Booking[];
  activityLogs: ActivityLog[];
  currentRole: 'ADMIN' | 'VETTORE' | 'OPERATORE';
  currentCarrierId: string;
  selectedDepotId: string;
  addDepot: (name: string, city: string) => void;
  addBay: (depotId: string, name: string) => void;
  updateBayStatus: (bayId: string, status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE') => void;
  addCarrier: (name: string, email: string, licensePlate?: string) => void;
  approveCarrier: (carrierId: string) => void;
  rejectCarrier: (carrierId: string) => void;
  addBooking: (depotId: string, date: string, activityType: 'CARICO' | 'SCARICO', licensePlate: string, driverName: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status'], bayId?: string) => void;
  setCurrentRole: (role: 'ADMIN' | 'VETTORE' | 'OPERATORE') => void;
  setCurrentCarrierId: (carrierId: string) => void;
  setSelectedDepotId: (depotId: string) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yard_management_system_state';

// Generatore di data odierna in formato YYYY-MM-DD
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- DATI DI DEFAULT (MOCK DATABASE) ---
  const defaultDepots: Depot[] = [
    { id: 'depot-milano', name: 'Milano Logistics Hub', city: 'Milano (MI)' },
    { id: 'depot-roma', name: 'Roma Distribution Center', city: 'Roma (RM)' },
    { id: 'depot-bari', name: 'Bari Port Hub', city: 'Bari (BA)' },
  ];

  const defaultBays: Bay[] = [
    // Milano
    { id: 'bay-m-01', depotId: 'depot-milano', name: 'Baia M-01', status: 'DISPONIBILE' },
    { id: 'bay-m-02', depotId: 'depot-milano', name: 'Baia M-02', status: 'DISPONIBILE' },
    { id: 'bay-m-03', depotId: 'depot-milano', name: 'Baia M-03', status: 'DISPONIBILE' },
    { id: 'bay-m-04', depotId: 'depot-milano', name: 'Baia M-04', status: 'DISPONIBILE' },
    // Roma
    { id: 'bay-r-01', depotId: 'depot-roma', name: 'Baia R-01', status: 'OCCUPATA', currentBookingId: 'book-roma-active' },
    { id: 'bay-r-02', depotId: 'depot-roma', name: 'Baia R-02', status: 'DISPONIBILE' },
    { id: 'bay-r-03', depotId: 'depot-roma', name: 'Baia R-03', status: 'DISPONIBILE' },
    { id: 'bay-r-04', depotId: 'depot-roma', name: 'Baia R-04', status: 'MANUTENZIONE' },
    // Bari
    { id: 'bay-b-01', depotId: 'depot-bari', name: 'Baia B-01', status: 'DISPONIBILE' },
    { id: 'bay-b-02', depotId: 'depot-bari', name: 'Baia B-02', status: 'DISPONIBILE' },
    { id: 'bay-b-03', depotId: 'depot-bari', name: 'Baia B-03', status: 'DISPONIBILE' },
  ];

  const defaultCarriers: Carrier[] = [
    { id: 'carrier-1', name: 'Logistica Uno Europe', email: 'info@logisticauno.com', status: 'APPROVATO', licensePlate: 'AA123BB' },
    { id: 'carrier-2', name: 'Freccia Rossa Trasporti', email: 'operations@frecciarossa.it', status: 'APPROVATO', licensePlate: 'CC456DD' },
    { id: 'carrier-3', name: 'Adriatica Cargo Srl', email: 'logistic@adriaticacargo.it', status: 'ATTESA_APPROVAZIONE', licensePlate: 'EE789FF' },
    { id: 'carrier-4', name: 'Euro Shipping Spedizioni', email: 'book@euroshipping.com', status: 'ATTESA_APPROVAZIONE' },
  ];

  const today = getTodayDateString();

  const defaultBookings: Booking[] = [
    {
      id: 'book-milano-1',
      carrierId: 'carrier-1',
      depotId: 'depot-milano',
      date: today,
      activityType: 'CARICO',
      status: 'PRENOTATO',
      licensePlate: 'AA123BB',
      driverName: 'Marco Rossi',
    },
    {
      id: 'book-milano-2',
      carrierId: 'carrier-2',
      depotId: 'depot-milano',
      date: today,
      activityType: 'SCARICO',
      status: 'AL_CANCELLO',
      licensePlate: 'CC456DD',
      driverName: 'Giuseppe Bianchi',
      timeInGate: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(),
    },
    {
      id: 'book-roma-active',
      carrierId: 'carrier-1',
      depotId: 'depot-roma',
      date: today,
      activityType: 'SCARICO',
      status: 'IN_BAIA',
      bayId: 'bay-r-01',
      licensePlate: 'EE789FF',
      driverName: 'Luca Verdi',
      timeInGate: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
      timeInBay: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
    },
    {
      id: 'book-bari-completed',
      carrierId: 'carrier-2',
      depotId: 'depot-bari',
      date: today,
      activityType: 'CARICO',
      status: 'COMPLETATO',
      bayId: 'bay-b-01',
      licensePlate: 'GG012HH',
      driverName: 'Giovanni Neri',
      timeInGate: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(),
      timeInBay: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
      timeOutBay: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
      timeOutGate: new Date(new Date().setHours(new Date().getHours() - 2.8)).toISOString(),
    },
  ];

  const defaultLogs: ActivityLog[] = [
    { id: 'log-1', timestamp: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(), depotId: 'depot-bari', message: 'Sistema avviato. Stato caricato correttamente.', type: 'INFO' },
    { id: 'log-2', timestamp: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(), depotId: 'depot-bari', message: 'Vettore Freccia Rossa Trasporti registrato al cancello.', type: 'INFO' },
    { id: 'log-3', timestamp: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(), depotId: 'depot-bari', message: 'Assegnata Baia B-01 a vettore Freccia Rossa Trasporti.', type: 'SUCCESS' },
    { id: 'log-4', timestamp: new Date(new Date().setHours(new Date().getHours() - 2.8)).toISOString(), depotId: 'depot-bari', message: 'Attività completata per veicolo GG012HH. Registrata uscita da Yard.', type: 'SUCCESS' },
  ];

  // --- STATO INIZIALIZZATO DA LOCALSTORAGE O DEFAULT ---
  const [depots, setDepots] = useState<Depot[]>(defaultDepots);
  const [bays, setBays] = useState<Bay[]>(defaultBays);
  const [carriers, setCarriers] = useState<Carrier[]>(defaultCarriers);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(defaultLogs);

  // Stati di simulazione utente
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'VETTORE' | 'OPERATORE'>('OPERATORE');
  const [currentCarrierId, setCurrentCarrierId] = useState<string>('carrier-1');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('depot-milano');

  // Caricamento iniziale da LocalStorage
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.depots) setDepots(parsed.depots);
        if (parsed.bays) setBays(parsed.bays);
        if (parsed.carriers) setCarriers(parsed.carriers);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.currentRole) setCurrentRole(parsed.currentRole);
        if (parsed.currentCarrierId) setCurrentCarrierId(parsed.currentCarrierId);
        if (parsed.selectedDepotId) setSelectedDepotId(parsed.selectedDepotId);
      } catch (e) {
        console.error('Errore nel caricamento del localStorage', e);
      }
    }
  }, []);

  // Salvataggio su LocalStorage ad ogni modifica
  useEffect(() => {
    const stateToSave = {
      depots,
      bays,
      carriers,
      bookings,
      activityLogs,
      currentRole,
      currentCarrierId,
      selectedDepotId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [depots, bays, carriers, bookings, activityLogs, currentRole, currentCarrierId, selectedDepotId]);

  // --- OPERAZIONI DI LOG ---
  const logActivity = (depotId: string, message: string, type: ActivityLog['type'] = 'INFO') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      depotId,
      message,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // --- AZIONI CONFIGURAZIONE / ADMIN ---
  const addDepot = (name: string, city: string) => {
    const id = `depot-${Date.now()}`;
    const newDepot: Depot = { id, name, city };
    setDepots((prev) => [...prev, newDepot]);
    logActivity(id, `Creato nuovo Hub: ${name} (${city})`, 'SUCCESS');
  };

  const addBay = (depotId: string, name: string) => {
    const id = `bay-${Date.now()}`;
    const newBay: Bay = { id, depotId, name, status: 'DISPONIBILE' };
    setBays((prev) => [...prev, newBay]);
    logActivity(depotId, `Aggiunta nuova baia: ${name}`, 'SUCCESS');
  };

  const updateBayStatus = (bayId: string, status: Bay['status']) => {
    setBays((prev) =>
      prev.map((b) => {
        if (b.id === bayId) {
          // Se la baia viene messa in manutenzione, disconnetti eventuali prenotazioni associate
          const updatedBay = { ...b, status };
          if (status === 'MANUTENZIONE') {
            updatedBay.currentBookingId = undefined;
          }
          return updatedBay;
        }
        return b;
      })
    );
    const targetBay = bays.find((b) => b.id === bayId);
    if (targetBay) {
      logActivity(targetBay.depotId, `Stato della baia ${targetBay.name} modificato in: ${status}`, status === 'MANUTENZIONE' ? 'WARNING' : 'INFO');
    }
  };

  // --- AZIONI VETTORI ---
  const addCarrier = (name: string, email: string, licensePlate?: string) => {
    const id = `carrier-${Date.now()}`;
    const newCarrier: Carrier = {
      id,
      name,
      email,
      status: 'ATTESA_APPROVAZIONE',
      licensePlate,
    };
    setCarriers((prev) => [...prev, newCarrier]);
  };

  const approveCarrier = (carrierId: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, status: 'APPROVATO' as const } : c))
    );
    const carrier = carriers.find((c) => c.id === carrierId);
    if (carrier) {
      logActivity(selectedDepotId, `Approvato nuovo vettore: ${carrier.name} (Generata credenziale fittizia)`, 'SUCCESS');
    }
  };

  const rejectCarrier = (carrierId: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, status: 'RIFIUTATO' as const } : c))
    );
    const carrier = carriers.find((c) => c.id === carrierId);
    if (carrier) {
      logActivity(selectedDepotId, `Richiesta vettore rifiutata: ${carrier.name}`, 'WARNING');
    }
  };

  // --- AZIONI PRENOTAZIONI ---
  const addBooking = (
    depotId: string,
    date: string,
    activityType: 'CARICO' | 'SCARICO',
    licensePlate: string,
    driverName: string
  ) => {
    const id = `book-${Date.now()}`;
    const newBooking: Booking = {
      id,
      carrierId: currentCarrierId,
      depotId,
      date,
      activityType,
      status: 'PRENOTATO',
      licensePlate: licensePlate.toUpperCase(),
      driverName,
    };
    setBookings((prev) => [...prev, newBooking]);
    const carrier = carriers.find((c) => c.id === currentCarrierId);
    logActivity(
      depotId,
      `Nuova prenotazione per ${activityType === 'CARICO' ? 'carico' : 'scarico'} registrata da ${carrier?.name || 'Vettore'} per il ${date} (Targa: ${licensePlate.toUpperCase()})`,
      'INFO'
    );
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], bayId?: string) => {
    let oldBooking: Booking | undefined;
    let targetDepotId = selectedDepotId;

    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        if (b.id === bookingId) {
          oldBooking = b;
          targetDepotId = b.depotId;

          const updated = { ...b, status };

          // Aggiungi timestamp in base alla transizione
          if (status === 'AL_CANCELLO' && !b.timeInGate) {
            updated.timeInGate = new Date().toISOString();
          } else if (status === 'IN_BAIA') {
            if (!b.timeInBay) {
              updated.timeInBay = new Date().toISOString();
            }
            if (bayId) {
              updated.bayId = bayId;
            }
          } else if (status === 'COMPLETATO') {
            updated.timeOutBay = new Date().toISOString();
            updated.timeOutGate = new Date().toISOString();
          } else if (status === 'PRENOTATO') {
            // Rollback
            updated.bayId = undefined;
            updated.timeInGate = undefined;
            updated.timeInBay = undefined;
            updated.timeOutBay = undefined;
            updated.timeOutGate = undefined;
          }

          return updated;
        }
        return b;
      })
    );

    // Gestione dello stato delle baie
    if (oldBooking) {
      const carrierName = carriers.find((c) => c.id === oldBooking?.carrierId)?.name || 'Vettore';

      // 1. Libera la baia precedente se esisteva
      if (oldBooking.bayId) {
        setBays((prevBays) =>
          prevBays.map((b) =>
            b.id === oldBooking?.bayId
              ? { ...b, status: 'DISPONIBILE' as const, currentBookingId: undefined }
              : b
          )
        );
      }

      // 2. Se lo stato attuale assegna una baia (IN_BAIA), bloccala
      if (status === 'IN_BAIA' && bayId) {
        setBays((prevBays) =>
          prevBays.map((b) =>
            b.id === bayId
              ? { ...b, status: 'OCCUPATA' as const, currentBookingId: bookingId }
              : b
          )
        );
        const targetBayName = bays.find((b) => b.id === bayId)?.name || 'Baia';
        logActivity(
          targetDepotId,
          `Camion ${oldBooking.licensePlate} (${carrierName}) assegnato alla ${targetBayName}. Inizio attività di ${oldBooking.activityType === 'CARICO' ? 'CARICO' : 'SCARICO'}.`,
          'SUCCESS'
        );
      } else if (status === 'AL_CANCELLO') {
        logActivity(
          targetDepotId,
          `Camion ${oldBooking.licensePlate} (${carrierName}) registrato all'ingresso. In attesa di assegnazione baia.`,
          'INFO'
        );
      } else if (status === 'COMPLETATO') {
        const targetBayName = bays.find((b) => b.id === oldBooking?.bayId)?.name || 'Baia';
        logActivity(
          targetDepotId,
          `Attività completata per veicolo ${oldBooking.licensePlate} (${carrierName}) presso ${targetBayName}. Registrata uscita dallo Yard.`,
          'SUCCESS'
        );
      } else if (status === 'ANNULLATO') {
        logActivity(targetDepotId, `Prenotazione per veicolo ${oldBooking.licensePlate} annullata.`, 'WARNING');
      }
    }
  };

  // --- RIPRISTINO STATO ---
  const resetState = () => {
    setDepots(defaultDepots);
    setBays(defaultBays);
    setCarriers(defaultCarriers);
    setBookings(defaultBookings);
    setActivityLogs(defaultLogs);
    setCurrentRole('OPERATORE');
    setCurrentCarrierId('carrier-1');
    setSelectedDepotId('depot-milano');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    logActivity('depot-milano', 'Database ripristinato ai dati iniziali.', 'WARNING');
  };

  return (
    <AppContext.Provider
      value={{
        depots,
        bays,
        carriers,
        bookings,
        activityLogs,
        currentRole,
        currentCarrierId,
        selectedDepotId,
        addDepot,
        addBay,
        updateBayStatus,
        addCarrier,
        approveCarrier,
        rejectCarrier,
        addBooking,
        updateBookingStatus,
        setCurrentRole,
        setCurrentCarrierId,
        setSelectedDepotId,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve essere utilizzato all\'interno di un AppProvider');
  }
  return context;
};
