import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Depot, Bay, Carrier, Booking, ActivityLog, WarehouseModule, ActivityType, ReportSchedule, User } from '../types';

interface AppContextType {
  depots: Depot[];
  warehouseModules: WarehouseModule[];
  bays: Bay[];
  carriers: Carrier[];
  bookings: Booking[];
  activityLogs: ActivityLog[];
  activityTypes: ActivityType[];
  reportSchedules: ReportSchedule[];
  currentRole: 'ADMIN' | 'GUARDIA' | 'VETTORE' | null;
  currentUser: User | null;
  currentCarrierId: string;
  selectedDepotId: string;
  addDepot: (name: string, city: string) => void;
  addWarehouseModule: (depotId: string, name: string, description?: string) => void;
  addBay: (depotId: string, name: string, moduleId?: string) => void;
  updateBayStatus: (bayId: string, status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE') => void;
  addCarrier: (name: string, email: string, vatNumber?: string, licensePlate?: string) => void;
  registerCarrier: (name: string, email: string, vatNumber?: string, licensePlate?: string) => void;
  approveCarrier: (carrierId: string) => void;
  rejectCarrier: (carrierId: string) => void;
  updateCarrierProfile: (id: string, email: string, licensePlate?: string, phone?: string) => void;
  addBooking: (depotId: string, date: string, activityType: string, licensePlate: string, driverName: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status'], bayId?: string) => void;
  addActivityType: (name: string, code: string) => void;
  addReportSchedule: (name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => void;
  toggleReportSchedule: (id: string) => void;
  setCurrentRole: (role: 'ADMIN' | 'GUARDIA' | 'VETTORE' | null) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentCarrierId: (carrierId: string) => void;
  setSelectedDepotId: (depotId: string) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yard_management_system_state_v2';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- DATI DI DEFAULT (MOCK DATABASE) ---
  const defaultDepots: Depot[] = [
    { id: 'depot-milano', name: 'Milano Logistics Plant', city: 'Milano (MI)' },
    { id: 'depot-roma', name: 'Roma Logistics Plant', city: 'Roma (RM)' },
    { id: 'depot-bari', name: 'Bari Logistics Plant', city: 'Bari (BA)' },
  ];

  const defaultWarehouseModules: WarehouseModule[] = [
    { id: 'module-m-1', depotId: 'depot-milano', name: 'Modulo A (Secco)' },
    { id: 'module-m-2', depotId: 'depot-milano', name: 'Modulo B (Fresco)' },
    { id: 'module-r-1', depotId: 'depot-roma', name: 'Modulo Unico' },
    { id: 'module-b-1', depotId: 'depot-bari', name: 'Modulo Est' },
  ];

  const defaultBays: Bay[] = [
    // Milano
    { id: 'bay-m-01', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-01 (Dry)', status: 'DISPONIBILE' },
    { id: 'bay-m-02', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-02 (Dry)', status: 'DISPONIBILE' },
    { id: 'bay-m-03', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-03 (Cold)', status: 'DISPONIBILE' },
    { id: 'bay-m-04', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-04 (Cold)', status: 'DISPONIBILE' },
    // Roma
    { id: 'bay-r-01', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-01', status: 'OCCUPATA', currentBookingId: 'book-roma-active' },
    { id: 'bay-r-02', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-02', status: 'DISPONIBILE' },
    { id: 'bay-r-03', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-03', status: 'DISPONIBILE' },
    { id: 'bay-r-04', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-04', status: 'MANUTENZIONE' },
    // Bari
    { id: 'bay-b-01', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-01', status: 'DISPONIBILE' },
    { id: 'bay-b-02', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-02', status: 'DISPONIBILE' },
    { id: 'bay-b-03', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-03', status: 'DISPONIBILE' },
  ];

  const defaultCarriers: Carrier[] = [
    { id: 'carrier-1', name: 'Logistica Uno Europe', email: 'info@logisticauno.com', status: 'APPROVATO', licensePlate: 'AA123BB', vatNumber: 'IT12345678901' },
    { id: 'carrier-2', name: 'Freccia Rossa Trasporti', email: 'operations@frecciarossa.it', status: 'APPROVATO', licensePlate: 'CC456DD', vatNumber: 'IT98765432109' },
    { id: 'carrier-3', name: 'Adriatica Cargo Srl', email: 'logistic@adriaticacargo.it', status: 'ATTESA_APPROVAZIONE', licensePlate: 'EE789FF', vatNumber: 'IT11112222333' },
    { id: 'carrier-4', name: 'Euro Shipping Spedizioni', email: 'book@euroshipping.com', status: 'ATTESA_APPROVAZIONE', vatNumber: 'IT44445555666' },
  ];

  const defaultActivityTypes: ActivityType[] = [
    { id: 'act-1', name: 'Scarico Standard', code: 'SCARICO' },
    { id: 'act-2', name: 'Carico Standard', code: 'CARICO' },
    { id: 'act-3', name: 'Reso Fornitore', code: 'RESO' },
  ];

  const defaultReportSchedules: ReportSchedule[] = [
    { id: 'rep-1', name: 'Saturazione Giornaliera Baie', frequency: 'GIORNALIERO', recipients: 'milano.ops@logisticauno.it', reportType: 'Saturazione Baie', active: true },
    { id: 'rep-2', name: 'Performance Tempi Turnaround Vettori', frequency: 'SETTIMANALE', recipients: 'direzione.logistica@logisticauno.it', reportType: 'Tempi Turnaround', active: true }
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
  const [warehouseModules, setWarehouseModules] = useState<WarehouseModule[]>(defaultWarehouseModules);
  const [bays, setBays] = useState<Bay[]>(defaultBays);
  const [carriers, setCarriers] = useState<Carrier[]>(defaultCarriers);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(defaultLogs);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(defaultActivityTypes);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>(defaultReportSchedules);

  // Stati di sessione (Simulazione d'accesso)
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'GUARDIA' | 'VETTORE' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCarrierId, setCurrentCarrierId] = useState<string>('');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('depot-milano');

  // Caricamento iniziale da LocalStorage
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.depots) setDepots(parsed.depots);
        if (parsed.warehouseModules) setWarehouseModules(parsed.warehouseModules);
        if (parsed.bays) setBays(parsed.bays);
        if (parsed.carriers) setCarriers(parsed.carriers);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.activityTypes) setActivityTypes(parsed.activityTypes);
        if (parsed.reportSchedules) setReportSchedules(parsed.reportSchedules);
        
        // Mantieni la sessione se presente
        if (parsed.currentRole !== undefined) setCurrentRole(parsed.currentRole);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.currentCarrierId !== undefined) setCurrentCarrierId(parsed.currentCarrierId);
        if (parsed.selectedDepotId !== undefined) setSelectedDepotId(parsed.selectedDepotId);
      } catch (e) {
        console.error('Errore nel caricamento del localStorage', e);
      }
    }
  }, []);

  // Salvataggio su LocalStorage ad ogni modifica
  useEffect(() => {
    const stateToSave = {
      depots,
      warehouseModules,
      bays,
      carriers,
      bookings,
      activityLogs,
      activityTypes,
      reportSchedules,
      currentRole,
      currentUser,
      currentCarrierId,
      selectedDepotId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [depots, warehouseModules, bays, carriers, bookings, activityLogs, activityTypes, reportSchedules, currentRole, currentUser, currentCarrierId, selectedDepotId]);

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
    logActivity(id, `Creato nuovo stabilimento Plant: ${name} (${city})`, 'SUCCESS');
  };

  const addWarehouseModule = (depotId: string, name: string, description?: string) => {
    const id = `module-${Date.now()}`;
    const newModule: WarehouseModule = { id, depotId, name, description };
    setWarehouseModules((prev) => [...prev, newModule]);
    logActivity(depotId, `Creato nuovo modulo di magazzino: ${name}`, 'SUCCESS');
  };

  const addBay = (depotId: string, name: string, moduleId?: string) => {
    const id = `bay-${Date.now()}`;
    const newBay: Bay = { id, depotId, moduleId, name, status: 'DISPONIBILE' };
    setBays((prev) => [...prev, newBay]);
    logActivity(depotId, `Aggiunta nuova baia: ${name}`, 'SUCCESS');
  };

  const updateBayStatus = (bayId: string, status: Bay['status']) => {
    setBays((prev) =>
      prev.map((b) => {
        if (b.id === bayId) {
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
  const addCarrier = (name: string, email: string, vatNumber?: string, licensePlate?: string) => {
    const id = `carrier-${Date.now()}`;
    const newCarrier: Carrier = {
      id,
      name,
      email,
      status: 'APPROVATO', // Creato dall'admin è auto-approvato
      vatNumber,
      licensePlate,
    };
    setCarriers((prev) => [...prev, newCarrier]);
    logActivity(selectedDepotId, `Creato anagrafica vettore da Admin: ${name}`, 'SUCCESS');
  };

  const registerCarrier = (name: string, email: string, vatNumber?: string, licensePlate?: string) => {
    const id = `carrier-${Date.now()}`;
    const newCarrier: Carrier = {
      id,
      name,
      email,
      status: 'ATTESA_APPROVAZIONE', // Registrazione spontanea, richiede validazione
      vatNumber,
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
      logActivity(selectedDepotId, `Approvato vettore: ${carrier.name}. Generata abilitazione all'accesso.`, 'SUCCESS');
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

  const updateCarrierProfile = (id: string, email: string, licensePlate?: string, phone?: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, email, licensePlate, phone } : c))
    );
    logActivity(selectedDepotId, `Vettore ${id} ha aggiornato il proprio profilo anagrafico.`, 'INFO');
  };

  // --- AZIONI PRENOTAZIONI ---
  const addBooking = (
    depotId: string,
    date: string,
    activityType: string,
    licensePlate: string,
    driverName: string
  ) => {
    const id = `book-${Date.now()}`;
    const carrierId = currentRole === 'VETTORE' ? currentCarrierId : 'carrier-1';
    const newBooking: Booking = {
      id,
      carrierId,
      depotId,
      date,
      activityType,
      status: 'PRENOTATO',
      licensePlate: licensePlate.toUpperCase(),
      driverName,
    };
    setBookings((prev) => [...prev, newBooking]);
    const carrier = carriers.find((c) => c.id === carrierId);
    logActivity(
      depotId,
      `Prenotazione per attività di ${activityType} registrata da ${carrier?.name || 'Vettore'} per il ${date} (Veicolo: ${licensePlate.toUpperCase()})`,
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

          // Timestamp in base alla transizione
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

      // 1. Libera la baia precedente
      if (oldBooking.bayId) {
        setBays((prevBays) =>
          prevBays.map((b) =>
            b.id === oldBooking?.bayId
              ? { ...b, status: 'DISPONIBILE' as const, currentBookingId: undefined }
              : b
          )
        );
      }

      // 2. Se in baia, bloccala
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
          `Mezzo ${oldBooking.licensePlate} (${carrierName}) in baia ${targetBayName}. Avviata attività di ${oldBooking.activityType}.`,
          'SUCCESS'
        );
      } else if (status === 'AL_CANCELLO') {
        logActivity(
          targetDepotId,
          `Check-In al cancello per veicolo ${oldBooking.licensePlate} (${carrierName}). Registrato ingresso.`,
          'INFO'
        );
      } else if (status === 'COMPLETATO') {
        const targetBayName = bays.find((b) => b.id === oldBooking?.bayId)?.name || 'Baia';
        logActivity(
          targetDepotId,
          `Attività conclusa per veicolo ${oldBooking.licensePlate} (${carrierName}) presso ${targetBayName}. Mezzo uscito da Plant.`,
          'SUCCESS'
        );
      } else if (status === 'ANNULLATO') {
        logActivity(targetDepotId, `Prenotazione slot per ${oldBooking.licensePlate} annullata.`, 'WARNING');
      }
    }
  };

  // --- ATTIVITA' E SCHEDULATORI ---
  const addActivityType = (name: string, code: string) => {
    const id = `act-${Date.now()}`;
    const newAct: ActivityType = { id, name, code: code.toUpperCase() };
    setActivityTypes((prev) => [...prev, newAct]);
  };

  const addReportSchedule = (name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => {
    const id = `rep-${Date.now()}`;
    const newRep: ReportSchedule = { id, name, frequency, recipients, reportType, active: true };
    setReportSchedules((prev) => [...prev, newRep]);
  };

  const toggleReportSchedule = (id: string) => {
    setReportSchedules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // --- RIPRISTINO STATO ---
  const resetState = () => {
    setDepots(defaultDepots);
    setWarehouseModules(defaultWarehouseModules);
    setBays(defaultBays);
    setCarriers(defaultCarriers);
    setBookings(defaultBookings);
    setActivityLogs(defaultLogs);
    setActivityTypes(defaultActivityTypes);
    setReportSchedules(defaultReportSchedules);
    setCurrentRole(null);
    setCurrentUser(null);
    setCurrentCarrierId('');
    setSelectedDepotId('depot-milano');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    logActivity('depot-milano', 'Database ripristinato.', 'WARNING');
  };

  return (
    <AppContext.Provider
      value={{
        depots,
        warehouseModules,
        bays,
        carriers,
        bookings,
        activityLogs,
        activityTypes,
        reportSchedules,
        currentRole,
        currentUser,
        currentCarrierId,
        selectedDepotId,
        addDepot,
        addWarehouseModule,
        addBay,
        updateBayStatus,
        addCarrier,
        registerCarrier,
        approveCarrier,
        rejectCarrier,
        updateCarrierProfile,
        addBooking,
        updateBookingStatus,
        addActivityType,
        addReportSchedule,
        toggleReportSchedule,
        setCurrentRole,
        setCurrentUser,
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
