import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import type { Booking, Bay, BookingNote } from '../types';

export const MonitorYard: React.FC = () => {
  const {
    depots,
    selectedDepotId,
    bookings,
    bays,
    carriers,
    warehouseModules,
    activityTypes,
    checklistAlerts,
    currentRole,
    bayUsages,
    anomalies,
    updateBookingStatus,
    addBooking,
    updateBookingDetails,
    relocateBookingBay,
    addBookingNote,
    saveQualityChecklist,
    resolveChecklistAlert,
    addAnomaly,
    resolveAnomaly,
  } = useApp();

  // Stato navigazione sottomenu a sinistra (Opzione A)
  const [guardiolaView, setGuardiolaView] = useState<'bays' | 'gate' | 'expected' | 'rapid' | 'schedule' | 'anomalies'>('bays');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');
  
  // Data selezionata per le attività
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Stato per la navigazione del mese nel calendario
  const [currentYear, setCurrentYear] = useState(new Date(scheduleDate).getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date(scheduleDate).getMonth());

  // Filtro Depot
  const activeDepot = depots.find((d) => d.id === selectedDepotId);
  const activeBays = bays.filter((b) => b.depotId === selectedDepotId);
  
  // Prenotazioni filtrate per Depot
  const activeBookings = bookings.filter((b) => b.depotId === selectedDepotId);
  const dayBookings = activeBookings.filter((b) => b.date === scheduleDate);

  // Filtro Baie per Modulo
  const filteredBays = selectedModuleFilter
    ? activeBays.filter((b) => b.moduleId === selectedModuleFilter)
    : activeBays;

  const incomingBookings = dayBookings.filter((b) => b.status === 'PRENOTATO');
  const gateBookings = activeBookings.filter((b) => b.status === 'AL_CANCELLO');

  // Form check-in manuale rapido
  const [manualPlate, setManualPlate] = useState('');
  const [manualPlateTrailer, setManualPlateTrailer] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualPallets, setManualPallets] = useState<number | ''>('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualCarrierId, setManualCarrierId] = useState(carriers.filter(c => c.status === 'APPROVATO')[0]?.id || '');
  const [manualActivityCode, setManualActivityCode] = useState(activityTypes[0]?.code || 'SCARICO');
  
  const [manualDriverLicense, setManualDriverLicense] = useState('');
  const [manualDriverLicenseRelease, setManualDriverLicenseRelease] = useState('');
  const [manualDriverLicenseExpiry, setManualDriverLicenseExpiry] = useState('');
  const [manualOrderNumber, setManualOrderNumber] = useState('');
  const [manualOrderNumber2, setManualOrderNumber2] = useState('');
  const [manualClientUsageId, setManualClientUsageId] = useState('');

  // Stato Modali
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null);
  const [checkInPhone, setCheckInPhone] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInLicense, setCheckInLicense] = useState('');
  const [checkInLicenseRelease, setCheckInLicenseRelease] = useState('');
  const [checkInLicenseExpiry, setCheckInLicenseExpiry] = useState('');
  const [checkInOrderNumber, setCheckInOrderNumber] = useState('');
  const [checkInOrderNumber2, setCheckInOrderNumber2] = useState('');
  const [checkInClientUsageId, setCheckInClientUsageId] = useState('');
  const [checkInPlateTrailer, setCheckInPlateTrailer] = useState('');

  // Dettaglio Baia
  const [activeBayDetail, setActiveBayDetail] = useState<{ bay: Bay; booking: Booking } | null>(null);
  const [detailPhone, setDetailPhone] = useState('');
  const [detailPallets, setDetailPallets] = useState<number | ''>('');
  const [detailActivity, setDetailActivity] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [detailLicense, setDetailLicense] = useState('');
  const [detailLicenseRelease, setDetailLicenseRelease] = useState('');
  const [detailLicenseExpiry, setDetailLicenseExpiry] = useState('');
  const [detailOrderNumber, setDetailOrderNumber] = useState('');
  const [detailOrderNumber2, setDetailOrderNumber2] = useState('');
  const [detailClientUsageId, setDetailClientUsageId] = useState('');
  const [detailPlateTrailer, setDetailPlateTrailer] = useState('');

  // Spostamento Baia
  const [relocateBayId, setRelocateBayId] = useState('');
  const [relocateReason, setRelocateReason] = useState('');

  // Checklist Qualità Form
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [pianaleSporco, setPianaleSporco] = useState(false);
  const [presenzaInfestantiMezzo, setPresenzaInfestantiMezzo] = useState(false);
  const [odoriAnomali, setOdoriAnomali] = useState(false);
  const [puliziaPallet, setPuliziaPallet] = useState(true);
  const [integritaPallet, setIntegritaPallet] = useState(true);
  const [presenzaInfestantiProdotto, setPresenzaInfestantiProdotto] = useState(false);
  const [presenzaBio, setPresenzaBio] = useState(false);
  const [noteLibere, setNoteLibere] = useState('');
  const [sigilloPresente, setSigilloPresente] = useState(false);
  const [numeroSigillo, setNumeroSigillo] = useState('');
  const [corrispondenzaDdt, setCorrispondenzaDdt] = useState(true);
  const [noteSigillo, setNoteSigillo] = useState('');

  // Allerta Blocco Guardiola
  const [activeAlertForGuardiola, setActiveAlertForGuardiola] = useState<any>(null);
  const [alertResolveReason, setAlertResolveReason] = useState('');

  // Stampa checklist
  const [printBooking, setPrintBooking] = useState<Booking | null>(null);

  // Risoluzione Anomalia
  const [activeResolveAnomalyId, setActiveResolveAnomalyId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const [tempBayAssignment, setTempBayAssignment] = useState<{ [bookingId: string]: string }>({});

  const pendingAlerts = checklistAlerts.filter(
    (a) => a.depotId === selectedDepotId && a.status === 'ATTESA_DECISIONE'
  );

  // Pre-selezione automatica baia consigliata
  React.useEffect(() => {
    let hasChanged = false;
    const nextAssignments = { ...tempBayAssignment };

    gateBookings.forEach((b) => {
      if (!nextAssignments[b.id]) {
        const availableBays = activeBays.filter((bay) => bay.status === 'DISPONIBILE');
        if (availableBays.length > 0) {
          const matchingBay = b.clientUsageId
            ? availableBays.find((bay) => bay.bayUsageId === b.clientUsageId)
            : undefined;

          if (matchingBay) {
            nextAssignments[b.id] = matchingBay.id;
            hasChanged = true;
          } else {
            nextAssignments[b.id] = availableBays[0].id;
            hasChanged = true;
          }
        }
      }
    });

    if (hasChanged) {
      setTempBayAssignment(nextAssignments);
    }
  }, [gateBookings, activeBays, tempBayAssignment]);

  // Trigger popup per la guardiola
  React.useEffect(() => {
    if ((currentRole === 'GUARDIA' || currentRole === 'ADMIN') && pendingAlerts.length > 0) {
      setActiveAlertForGuardiola(pendingAlerts[0]);
      setAlertResolveReason('');
    } else {
      setActiveAlertForGuardiola(null);
    }
  }, [pendingAlerts, currentRole]);

  // EFFETTO PERIODICO PER LOGGARE SFORAMENTI TEMPO IN BAIA
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      const docked = bookings.filter((b) => b.status === 'IN_BAIA' && b.timeInBay);
      docked.forEach((b) => {
        const actType = activityTypes.find((a) => a.code === b.activityType);
        const base = actType?.baseDurationMinutes ?? 20;
        const perPlt = actType?.minutesPerPallet ?? 1.5;
        const plts = b.palletPlaces ?? 0;
        const limit = base + (plts * perPlt);
        const elapsed = Math.floor((Date.now() - new Date(b.timeInBay!).getTime()) / 60000);

        if (elapsed > limit) {
          const alreadyLogged = anomalies.some(
            (an) => an.bookingId === b.id && an.type === 'SFORAMENTO_TEMPO' && !an.resolved
          );
          if (!alreadyLogged) {
            const bName = bays.find((bay) => bay.id === b.bayId)?.name || 'Baia';
            addAnomaly(
              b.depotId,
              'SFORAMENTO_TEMPO',
              `Sforamento tempo operativo su baia ${bName}: ${elapsed}m trascorsi su un limite previsto di ${limit}m per ${plts} pallet.`,
              b.id,
              b.ticketNumber,
              b.licensePlate
            );
          }
        }
      });
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [bookings, activityTypes, bays, anomalies, addAnomaly]);

  // Helper giorni del mese per il mini-calendario
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);
  const monthsNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const handleRegisterManualArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver || !manualOrderNumber) return;

    const todayStr = new Date().toISOString().split('T')[0];
    addBooking(
      selectedDepotId,
      todayStr,
      manualActivityCode,
      manualPlate.replace(/\s+/g, '').toUpperCase(),
      manualDriver,
      manualPhone || undefined,
      manualNotes || undefined,
      manualPallets ? Number(manualPallets) : undefined,
      manualDriverLicense || undefined,
      manualDriverLicenseRelease || undefined,
      manualOrderNumber,
      manualClientUsageId || undefined,
      manualPlateTrailer ? manualPlateTrailer.replace(/\s+/g, '').toUpperCase() : undefined,
      manualDriverLicenseExpiry || undefined,
      manualOrderNumber2 || undefined
    );
    
    setManualPlate('');
    setManualPlateTrailer('');
    setManualDriver('');
    setManualPhone('');
    setManualPallets('');
    setManualNotes('');
    setManualDriverLicense('');
    setManualDriverLicenseRelease('');
    setManualDriverLicenseExpiry('');
    setManualOrderNumber('');
    setManualOrderNumber2('');
    setManualClientUsageId('');
    
    // Ritorna alla vista baie dopo aver registrato l'arrivo rapido
    setGuardiolaView('gate');
  };

  const handleOpenCheckInModal = (booking: Booking) => {
    setCheckInBooking(booking);
    setCheckInPhone(booking.driverPhone || '');
    setCheckInNotes(booking.notes || '');
    setCheckInLicense(booking.driverLicense || '');
    setCheckInLicenseRelease(booking.driverLicenseRelease || '');
    setCheckInLicenseExpiry(booking.driverLicenseExpiry || '');
    setCheckInOrderNumber(booking.orderNumber || '');
    setCheckInOrderNumber2(booking.orderNumber2 || '');
    setCheckInClientUsageId(booking.clientUsageId || '');
    setCheckInPlateTrailer(booking.licensePlateTrailer || '');
  };

  const handleConfirmCheckIn = () => {
    if (!checkInBooking) return;
    updateBookingStatus(checkInBooking.id, 'AL_CANCELLO', undefined, {
      driverPhone: checkInPhone || undefined,
      notes: checkInNotes || undefined,
      driverLicense: checkInLicense || undefined,
      driverLicenseRelease: checkInLicenseRelease || undefined,
      driverLicenseExpiry: checkInLicenseExpiry || undefined,
      orderNumber: checkInOrderNumber || undefined,
      orderNumber2: checkInOrderNumber2 || undefined,
      clientUsageId: checkInClientUsageId || undefined,
      licensePlateTrailer: checkInPlateTrailer || undefined,
    });
    setCheckInBooking(null);
    setGuardiolaView('gate');
  };

  const handleAssignBay = (bookingId: string) => {
    const bayId = tempBayAssignment[bookingId];
    if (!bayId) {
      alert('Selezionare una baia prima di confermare.');
      return;
    }
    updateBookingStatus(bookingId, 'IN_BAIA', bayId);
    
    setTempBayAssignment((prev) => {
      const copy = { ...prev };
      delete copy[bookingId];
      return copy;
    });
    setGuardiolaView('bays');
  };

  const handleCompleteActivityFromDetail = (bookingId: string) => {
    updateBookingStatus(bookingId, 'COMPLETATO');
    setActiveBayDetail(null);
  };

  const handleOpenBayDetail = (bay: Bay, booking: Booking) => {
    setActiveBayDetail({ bay, booking });
    setDetailPhone(booking.driverPhone || '');
    setDetailPallets(booking.palletPlaces || '');
    setDetailActivity(booking.activityType);
    setDetailLicense(booking.driverLicense || '');
    setDetailLicenseRelease(booking.driverLicenseRelease || '');
    setDetailLicenseExpiry(booking.driverLicenseExpiry || '');
    setDetailOrderNumber(booking.orderNumber || '');
    setDetailOrderNumber2(booking.orderNumber2 || '');
    setDetailClientUsageId(booking.clientUsageId || '');
    setDetailPlateTrailer(booking.licensePlateTrailer || '');
    setNewNoteText('');
    setRelocateBayId('');
    setRelocateReason('');
    setShowChecklistForm(false);

    if (booking.checklist) {
      setPianaleSporco(booking.checklist.pianaleSporco);
      setPresenzaInfestantiMezzo(booking.checklist.presenzaInfestantiMezzo);
      setOdoriAnomali(booking.checklist.odoriAnomali);
      setPuliziaPallet(booking.checklist.puliziaPallet);
      setIntegritaPallet(booking.checklist.integritaPallet);
      setPresenzaInfestantiProdotto(booking.checklist.presenzaInfestantiProdotto);
      setPresenzaBio(booking.checklist.presenzaBio);
      setNoteLibere(booking.checklist.noteLibere || '');
      setSigilloPresente(booking.checklist.sigilloPresente);
      setNumeroSigillo(booking.checklist.numeroSigillo || '');
      setCorrispondenzaDdt(booking.checklist.corrispondenzaDdt);
      setNoteSigillo(booking.checklist.noteSigillo || '');
    } else {
      setPianaleSporco(false);
      setPresenzaInfestantiMezzo(false);
      setOdoriAnomali(false);
      setPuliziaPallet(true);
      setIntegritaPallet(true);
      setPresenzaInfestantiProdotto(false);
      setPresenzaBio(false);
      setNoteLibere('');
      setSigilloPresente(false);
      setNumeroSigillo('');
      setCorrispondenzaDdt(true);
      setNoteSigillo('');
    }
  };

  const handleAddNoteDetail = () => {
    if (!activeBayDetail || !newNoteText.trim()) return;
    addBookingNote(activeBayDetail.booking.id, newNoteText);
    setNewNoteText('');
    const refreshed = bookings.find(b => b.id === activeBayDetail.booking.id);
    if (refreshed) {
      setActiveBayDetail({ bay: activeBayDetail.bay, booking: refreshed });
    }
  };

  const handleSaveBayDetailChanges = () => {
    if (!activeBayDetail) return;
    updateBookingDetails(activeBayDetail.booking.id, {
      activityType: detailActivity,
      driverPhone: detailPhone || undefined,
      palletPlaces: detailPallets ? Number(detailPallets) : undefined,
      driverLicense: detailLicense || undefined,
      driverLicenseRelease: detailLicenseRelease || undefined,
      driverLicenseExpiry: detailLicenseExpiry || undefined,
      orderNumber: detailOrderNumber || undefined,
      orderNumber2: detailOrderNumber2 || undefined,
      clientUsageId: detailClientUsageId || undefined,
      licensePlateTrailer: detailPlateTrailer || undefined,
    });
    setActiveBayDetail(null);
  };

  const handleSaveChecklist = () => {
    if (!activeBayDetail) return;
    saveQualityChecklist(activeBayDetail.booking.id, {
      pianaleSporco,
      presenzaInfestantiMezzo,
      odoriAnomali,
      puliziaPallet,
      integritaPallet,
      presenzaInfestantiProdotto,
      presenzaBio,
      noteLibere: noteLibere || undefined,
      sigilloPresente,
      numeroSigillo: numeroSigillo || undefined,
      corrispondenzaDdt,
      noteSigillo: noteSigillo || undefined,
    });
    setShowChecklistForm(false);
    const refreshed = bookings.find(b => b.id === activeBayDetail.booking.id);
    if (refreshed) {
      setActiveBayDetail({ bay: activeBayDetail.bay, booking: refreshed });
    }
  };

  const handleConfirmRelocate = () => {
    if (!activeBayDetail || !relocateBayId || !relocateReason) return;
    relocateBookingBay(activeBayDetail.booking.id, relocateBayId, relocateReason);
    setActiveBayDetail(null);
  };

  const handleResolveAlert = (action: 'PROCEDI' | 'RESPINTO') => {
    if (!activeAlertForGuardiola) return;
    if (action === 'RESPINTO' && !alertResolveReason) {
      alert('Inserire una giustificazione per respingere il mezzo.');
      return;
    }
    resolveChecklistAlert(activeAlertForGuardiola.id, action, alertResolveReason);
    setActiveAlertForGuardiola(null);
  };

  const handlePrintChecklist = (booking: Booking) => {
    setPrintBooking(booking);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const renderTriageTicket = (ticketCode?: string) => {
    const parts = (ticketCode || 'T-000').split('-');
    const finalNum = parts[2] || parts[1] || '000';
    const finalPrefix = parts[2] ? `${parts[0]}-${parts[1]}` : (parts[0] || 'T');

    return (
      <div className="flex flex-col items-center justify-center border-2 border-black/15 bg-white rounded-lg p-1.5 w-14 h-11 font-mono font-bold leading-none select-none shadow-2xs">
        <span className="text-[8px] text-gray-500 truncate max-w-full">{finalPrefix}</span>
        <span className="text-xs text-black mt-0.5">{finalNum}</span>
      </div>
    );
  };

  // Controlli per la form manuale rapida
  const isManualPlateDuplicate = manualPlate !== '' && carriers.some(
    (c) => c.licensePlate?.replace(/\s+/g, '').toUpperCase() === manualPlate.replace(/\s+/g, '').toUpperCase()
  );
  const isManualLicenseExpired = manualDriverLicenseExpiry !== '' && new Date(manualDriverLicenseExpiry) < new Date();

  // Controlli per la form check-in modal
  const isCheckInLicenseExpired = checkInLicenseExpiry !== '' && new Date(checkInLicenseExpiry) < new Date();

  const activeAnomaliesCount = anomalies.filter(a => a.depotId === selectedDepotId && !a.resolved).length;

  return (
    <div className="space-y-6 relative font-sans">
      
      {/* AREA DI STAMPA COPERTA */}
      {printBooking && printBooking.checklist && (
        <div id="printable-area" className="hidden print:block p-8 bg-white text-black font-sans text-xs space-y-6">
          <div className="flex justify-between items-center border-b border-black pb-4">
            <div>
              <h1 className="text-lg font-black uppercase tracking-wider">Logistica Uno Europe</h1>
              <p className="text-[10px] font-mono">YARD QUALITY ASSURANCE REPORT</p>
            </div>
            <div className="border border-black p-2 font-mono text-center font-bold">
              TICKET TRIAGE: {printBooking.ticketNumber || printBooking.id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><strong>Targa Trattore:</strong> {printBooking.licensePlate} {printBooking.licensePlateTrailer && `(Rimorchio: ${printBooking.licensePlateTrailer})`}</div>
            <div><strong>Autista:</strong> {printBooking.driverName}</div>
            <div><strong>Vettore:</strong> {carriers.find(c => c.id === printBooking.carrierId)?.name || 'N/D'}</div>
            <div><strong>Data Attività:</strong> {printBooking.date}</div>
            <div><strong>Baia di Attracco:</strong> {bays.find(b => b.id === printBooking.bayId)?.name || 'N/D'}</div>
            <div><strong>Attività:</strong> {printBooking.activityType}</div>
            <div><strong>Ordine 1:</strong> {printBooking.orderNumber} {printBooking.orderNumber2 && `| Ordine 2: ${printBooking.orderNumber2}`}</div>
            <div><strong>Patente Autista:</strong> {printBooking.driverLicense || 'N/D'} {printBooking.driverLicenseRelease && `(Ril. ${printBooking.driverLicenseRelease})`} {printBooking.driverLicenseExpiry && `(Scad. ${printBooking.driverLicenseExpiry})`}</div>
          </div>

          <div className="border border-black rounded p-3 space-y-4">
            <h2 className="font-bold border-b border-black pb-1 uppercase tracking-wide">1. Idoneità Igienico-Sanitaria Mezzo</h2>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div>Pianale Sporco: [ {printBooking.checklist.pianaleSporco ? 'SI' : 'NO'} ]</div>
              <div>Presenza Infestanti: [ {printBooking.checklist.presenzaInfestantiMezzo ? 'SI' : 'NO'} ]</div>
              <div>Odori Anomali: [ {printBooking.checklist.odoriAnomali ? 'SI' : 'NO'} ]</div>
            </div>

            <h2 className="font-bold border-b border-black pb-1 uppercase tracking-wide">2. Idoneità Igienica Prodotto & Pallet</h2>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div>Pulizia Pallet: [ {printBooking.checklist.puliziaPallet ? 'CONFORME' : 'NON CONFORME'} ]</div>
              <div>Integrità Pallet: [ {printBooking.checklist.integritaPallet ? 'CONFORME' : 'NON CONFORME'} ]</div>
              <div>Presenza Infestanti Prodotto: [ {printBooking.checklist.presenzaInfestantiProdotto ? 'SI' : 'NO'} ]</div>
              <div>Prodotti biologici (Bio): [ {printBooking.checklist.presenzaBio ? 'SI' : 'NO'} ]</div>
            </div>
            {printBooking.checklist.noteLibere && (
              <div className="text-[10px] font-sans"><strong>Note Preposto:</strong> {printBooking.checklist.noteLibere}</div>
            )}

            <h2 className="font-bold border-b border-black pb-1 uppercase tracking-wide">3. Controllo Sigillo di Sicurezza</h2>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div>Sigillo Presente: [ {printBooking.checklist.sigilloPresente ? 'SI' : 'NO'} ]</div>
              <div>Numero Sigillo: {printBooking.checklist.numeroSigillo || 'N/D'}</div>
              <div>Corrispondenza DDT: [ {printBooking.checklist.corrispondenzaDdt ? 'SI' : 'NO'} ]</div>
            </div>
            {printBooking.checklist.noteSigillo && (
              <div className="text-[10px] font-sans"><strong>Note Sigillo:</strong> {printBooking.checklist.noteSigillo}</div>
            )}
          </div>

          <div className="pt-8 grid grid-cols-2 gap-8 text-center font-mono">
            <div>
              <div className="border-b border-black h-12" />
              <p className="mt-1 text-[10px]">Firma Conducente Mezzo</p>
            </div>
            <div>
              <div className="border-b border-black h-12 flex items-end justify-center pb-1 text-xs">
                {printBooking.checklist.compilataDa}
              </div>
              <p className="mt-1 text-[10px]">Firma Preposto Verificatore ({new Date(printBooking.checklist.dataOraCheck).toLocaleDateString()})</p>
            </div>
          </div>
          
          <div className="text-center pt-8 font-mono text-[8px] text-gray-500">
            Logistica Uno SpA - Yard Control Systems - Documento Generato Automaticamente
          </div>
        </div>
      )}

      {/* MONITOR REGOLARE */}
      <div className="print:hidden space-y-6">
        
        {/* Intestazione */}
        <div className="flex justify-between items-center border-b border-black/10 pb-4">
          <div>
            <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
              // MONITOR DI CONTROLLO {currentRole === 'PREPOSTO' ? 'PREPOSTO DI MAGAZZINO' : 'GUARDIOLA'}
            </h2>
            <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
              Stabilimento: {activeDepot?.name} ({activeDepot?.city})
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="success">ATTIVO</Badge>
            <Badge variant="primary">
              {activeBays.filter((b) => b.status === 'DISPONIBILE').length} / {activeBays.length} Baie Libere
            </Badge>
          </div>
        </div>

        {/* Layout responsive: Barra di Navigazione a sinistra, Contenuto a destra */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* Menu Laterale Guardiola */}
          <div className="lg:col-span-1 space-y-2 bg-gray-50 border border-black/5 p-3.5 rounded-xl font-mono text-xs shadow-2xs">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-3 px-2">// MENU GUARDIOLA</div>
            
            <button
              onClick={() => setGuardiolaView('bays')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'bays'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">⚡ Baie Attive</span>
              <Badge variant={guardiolaView === 'bays' ? 'info' : 'primary'}>
                {activeBays.filter(b => b.status === 'OCCUPATA').length}
              </Badge>
            </button>

            <button
              onClick={() => setGuardiolaView('gate')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'gate'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">🚧 Coda Piazzale</span>
              {gateBookings.length > 0 && (
                <Badge variant="warning" className="animate-pulse-glow">
                  {gateBookings.length}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setGuardiolaView('expected')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'expected'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">📅 Attesi Oggi</span>
              {incomingBookings.length > 0 && (
                <Badge variant="info">
                  {incomingBookings.length}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setGuardiolaView('rapid')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'rapid'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">✍️ Nuovo Check-In</span>
            </button>

            <button
              onClick={() => setGuardiolaView('schedule')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'schedule'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">🗓️ Programmazione</span>
            </button>

            <button
              onClick={() => setGuardiolaView('anomalies')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'anomalies'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">🚨 Anomalie</span>
              {activeAnomaliesCount > 0 && (
                <Badge variant="danger" className="animate-pulse-glow">
                  {activeAnomaliesCount}
                </Badge>
              )}
            </button>

            <div className="pt-4 border-t border-black/5 mt-4">
              <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 px-1">Filtra per Data:</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => {
                  setScheduleDate(e.target.value);
                  setCurrentYear(new Date(e.target.value).getFullYear());
                  setCurrentMonth(new Date(e.target.value).getMonth());
                }}
                className="w-full bg-white border border-black/10 font-mono text-xs px-2 py-1.5 rounded-lg shadow-2xs focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Area Contenuto (Destra) */}
          <div className="lg:col-span-4">
            
            {/* VISTA: STATO BAIE */}
            {guardiolaView === 'bays' && (
              <Card
                title="Stato Occupazione Baie Carico/Scarico"
                accent="orange"
                headerAction={
                  warehouseModules.filter((m) => m.depotId === selectedDepotId).length > 0 ? (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-black">
                      <span>Filtro Sezione:</span>
                      <select
                        value={selectedModuleFilter}
                        onChange={(e) => setSelectedModuleFilter(e.target.value)}
                        className="bg-white border border-black/10 text-[9px] font-mono px-2 py-1 rounded focus:outline-none"
                      >
                        <option value="">Tutti i moduli</option>
                        {warehouseModules.filter((m) => m.depotId === selectedDepotId).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : undefined
                }
              >
                {filteredBays.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-500 font-mono">Nessuna baia configurata.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBays.map((bay) => {
                      const activeBooking = activeBookings.find(
                        (b) => b.status === 'IN_BAIA' && b.bayId === bay.id
                      );
                      const carrierName = activeBooking
                        ? carriers.find((c) => c.id === activeBooking.carrierId)?.name
                        : '';
                      const moduleName = warehouseModules.find(m => m.id === bay.moduleId)?.name || 'Generico';
                      const activeUsage = bayUsages.find(u => u.id === bay.bayUsageId);

                      let isTimeoutSforato = false;
                      let elapsedMinutes = 0;
                      let timeLimit = 0;

                      if (activeBooking && activeBooking.timeInBay) {
                        const actType = activityTypes.find((a) => a.code === activeBooking.activityType);
                        const base = actType?.baseDurationMinutes ?? 20;
                        const perPlt = actType?.minutesPerPallet ?? 1.5;
                        const plts = activeBooking.palletPlaces ?? 0;
                        timeLimit = base + (plts * perPlt);
                        elapsedMinutes = Math.floor((Date.now() - new Date(activeBooking.timeInBay).getTime()) / 60000);
                        if (elapsedMinutes > timeLimit) {
                          isTimeoutSforato = true;
                        }
                      }

                      const isModified = activeBooking?.isEditedInBay;
                      const isChecklistFailed = activeBooking?.checklist?.isFailed;

                      let bayBorderColor = 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400';
                      if (isChecklistFailed) {
                        bayBorderColor = 'border-rose-500 border-[3px] bg-rose-50/30 hover:border-rose-600 ring-4 ring-rose-500/10 shadow-md animate-pulse-glow';
                      } else if (isTimeoutSforato) {
                        bayBorderColor = 'border-red-600 border-[3px] bg-red-50/30 hover:border-red-700 shadow-md animate-pulse-glow';
                      } else if (isModified) {
                        bayBorderColor = 'border-amber-500 border-[3px] border-dashed bg-amber-50/40 hover:border-amber-600 ring-4 ring-amber-500/10 shadow-md';
                      } else if (bay.status === 'OCCUPATA') {
                        bayBorderColor = 'border-[#11BCEC]/30 bg-[#11BCEC]/5 hover:border-[#11BCEC] shadow-2xs';
                      } else if (bay.status === 'MANUTENZIONE') {
                        bayBorderColor = 'border-red-200 bg-red-50/30 hover:border-red-400';
                      }

                      return (
                        <div
                          key={bay.id}
                          onClick={() => activeBooking && handleOpenBayDetail(bay, activeBooking)}
                          className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between min-h-[190px] cursor-pointer ${bayBorderColor}`}
                        >
                          <div className="flex justify-between items-center border-b border-black/5 pb-2">
                            <div>
                              <span className="font-mono font-bold text-sm text-black block">{bay.name}</span>
                              <span className="text-[8px] font-mono text-gray-400 uppercase">Sez: {moduleName}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant={
                                  isChecklistFailed ? 'danger' :
                                  isTimeoutSforato ? 'danger' :
                                  bay.status === 'DISPONIBILE' ? 'success' :
                                  bay.status === 'OCCUPATA' ? 'primary' : 'danger'
                                }
                              >
                                {isChecklistFailed ? 'Bloccato Qualità' :
                                 isTimeoutSforato ? 'TEMPO SCADUTO' :
                                 bay.status === 'DISPONIBILE' ? 'Libera' :
                                 bay.status === 'OCCUPATA' ? 'In Uso' : 'Manutenzione'}
                              </Badge>
                              {isModified && !isChecklistFailed && !isTimeoutSforato && (
                                <span className="text-[8px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-1 rounded">
                                  ⚠️ MODIFICATO
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="py-2 flex-grow">
                            {bay.status === 'OCCUPATA' && activeBooking ? (
                              <div className="font-mono text-[10px] space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-ticket-muted">Trattore:</span>
                                  <span className="font-bold text-black">{activeBooking.licensePlate}</span>
                                </div>
                                {activeBooking.licensePlateTrailer && (
                                  <div className="flex justify-between">
                                    <span className="text-ticket-muted">Rimorchio:</span>
                                    <span className="font-bold text-black">{activeBooking.licensePlateTrailer}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-ticket-muted">Vettore:</span>
                                  <span className="truncate max-w-[150px] text-right font-bold text-gray-700">{carrierName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ticket-muted">Attività:</span>
                                  <span className="font-bold">{activeBooking.activityType} ({activeBooking.palletPlaces ?? 0} PL)</span>
                                </div>
                                {activeBooking.orderNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-ticket-muted">Ord. 1:</span>
                                    <span className="font-bold text-gray-600 truncate max-w-[120px]">{activeBooking.orderNumber}</span>
                                  </div>
                                )}
                                {isTimeoutSforato && (
                                  <div className="text-[8px] font-bold text-red-600 bg-red-100 border border-red-300 rounded p-1 text-center mt-1 animate-pulse-glow">
                                    🚨 SFORATO DI {elapsedMinutes - timeLimit} MIN (Prev: {timeLimit}m, Sosta: {elapsedMinutes}m)
                                  </div>
                                )}
                              </div>
                            ) : bay.status === 'MANUTENZIONE' ? (
                              <div className="text-center py-4 text-xs font-mono text-red-500 font-bold">
                                // IN MANUTENZIONE
                              </div>
                            ) : (
                              <div className="text-center py-3 space-y-1">
                                <div className="text-xs font-mono text-emerald-600 font-bold">// PRONTA</div>
                                <div className="text-[8px] font-mono text-gray-400 uppercase">Uso: {activeUsage?.name || 'Generico'}</div>
                              </div>
                            )}
                          </div>

                          {bay.status === 'OCCUPATA' ? (
                            <div className="text-[9px] text-center text-ticket-muted font-sans border-t border-black/5 pt-1.5 mt-1">
                              {currentRole === 'PREPOSTO' ? 'Dettagli & Checklist ➔' : 'Gestisci Rampa ➔'}
                            </div>
                          ) : (
                            <div className="h-4" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* VISTA: CODA PIAZZALE */}
            {guardiolaView === 'gate' && (
              <Card title="Coda Check-In al Cancello (Attesa Assegnazione Baia)">
                <Table
                  data={gateBookings}
                  emptyMessage="Nessun camion registrato al cancello in attesa di rampa."
                  columns={[
                    {
                      header: 'Triage Ticket',
                      accessor: (b) => {
                        const isIncomplete = !b.orderNumber || !b.driverLicense || !b.driverLicenseRelease || !b.driverLicenseExpiry || !b.clientUsageId;
                        const isExpired = b.driverLicenseExpiry && new Date(b.driverLicenseExpiry) < new Date();
                        return (
                          <div className="flex flex-col items-center gap-1.5">
                            {renderTriageTicket(b.ticketNumber)}
                            {isIncomplete && (
                              <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider">
                                ⚠️ Incompleto
                              </span>
                            )}
                            {isExpired && (
                              <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-300 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider animate-pulse-glow">
                                ⚠️ SCADUTA
                              </span>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Vettore / Veicolo',
                      accessor: (b) => {
                        const cName = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                        const usageName = bayUsages.find(u => u.id === b.clientUsageId)?.name || 'Generico';
                        return (
                          <div className="text-xs font-sans">
                            <div className="font-bold text-black">{cName}</div>
                            <div className="font-mono text-ticket-accent mt-0.5">
                              TR: {b.licensePlate} {b.licensePlateTrailer && `/ RIM: ${b.licensePlateTrailer}`}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold mt-0.5">Conduttore: {b.driverName}</div>
                            <div className="text-[9px] text-gray-400 font-mono mt-0.5">Uso Richiesto: {usageName}</div>
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Dettagli',
                      accessor: (b) => (
                        <div className="text-xs max-w-[200px]">
                          {b.palletPlaces && <Badge variant="primary">{b.palletPlaces} PL</Badge>}
                          {b.orderNumber && <div className="text-[9px] font-mono text-gray-600 mt-1">Ord. 1: {b.orderNumber} {b.orderNumber2 && `| Ord. 2: ${b.orderNumber2}`}</div>}
                          {b.driverPhone && <div className="text-[10px] font-mono text-gray-400 mt-0.5">Tel: {b.driverPhone}</div>}
                          {b.notes && <div className="text-[10px] italic text-amber-600 truncate mt-0.5">{b.notes}</div>}
                        </div>
                      )
                    },
                    {
                      header: 'Assegna Baia',
                      accessor: (b) => {
                        const availableBays = activeBays.filter((bay) => bay.status === 'DISPONIBILE');
                        const isGuard = currentRole === 'GUARDIA' || currentRole === 'ADMIN';

                        const sortedBays = [...availableBays].sort((bayA, bayB) => {
                          const matchA = b.clientUsageId && bayA.bayUsageId === b.clientUsageId ? 1 : 0;
                          const matchB = b.clientUsageId && bayB.bayUsageId === b.clientUsageId ? 1 : 0;
                          return matchB - matchA;
                        });

                        return (
                          <div className="flex space-x-2">
                            <select
                              value={tempBayAssignment[b.id] || ''}
                              onChange={(e) =>
                                setTempBayAssignment((prev) => ({ ...prev, [b.id]: e.target.value }))
                              }
                              disabled={!isGuard}
                              className="bg-white border border-black/10 text-xs text-black font-mono p-1.5 rounded-lg focus:ring-0 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Seleziona baia...</option>
                              {sortedBays.map((bay) => {
                                const isRecommended = b.clientUsageId && bay.bayUsageId === b.clientUsageId;
                                const usageName = bayUsages.find(u => u.id === bay.bayUsageId)?.name || 'Generica';
                                return (
                                  <option key={bay.id} value={bay.id} className={isRecommended ? 'font-bold text-emerald-600' : ''}>
                                    {isRecommended ? `⭐ [CONSIGLIATA - ${usageName}] ` : ''}{bay.name}
                                  </option>
                                );
                              })}
                            </select>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleAssignBay(b.id)}
                              disabled={!tempBayAssignment[b.id] || !isGuard}
                            >
                              Fai Entrare
                            </Button>
                          </div>
                        );
                      },
                    },
                  ]}
                />
              </Card>
            )}

            {/* VISTA: MEZZI IN ARRIVO ATTESI OGGI */}
            {guardiolaView === 'expected' && (
              <Card title="Prenotazioni Slot Attese per Oggi (Attesa Arrivo)">
                <Table
                  data={incomingBookings}
                  emptyMessage="Nessun transito prenotato online in attesa per oggi."
                  columns={[
                    {
                      header: 'Ticket',
                      accessor: (b) => {
                        const isIncomplete = !b.orderNumber || !b.driverLicense || !b.driverLicenseRelease || !b.driverLicenseExpiry || !b.clientUsageId;
                        const isExpired = b.driverLicenseExpiry && new Date(b.driverLicenseExpiry) < new Date();
                        return (
                          <div className="flex flex-col items-center gap-1.5">
                            {renderTriageTicket(b.ticketNumber)}
                            {isIncomplete && (
                              <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider">
                                ⚠️ Incompleto
                              </span>
                            )}
                            {isExpired && (
                              <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-300 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider animate-pulse-glow">
                                ⚠️ SCADUTA
                              </span>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Dettagli Richiesta',
                      accessor: (b) => {
                        const cName = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                        const usageName = bayUsages.find(u => u.id === b.clientUsageId)?.name || 'Generico';
                        return (
                          <div className="text-xs">
                            <div className="font-bold text-black">{cName}</div>
                            <div className="font-mono text-gray-500 mt-0.5">
                              TR: {b.licensePlate} {b.licensePlateTrailer && `/ RIM: ${b.licensePlateTrailer}`} ({b.driverName})
                            </div>
                            <div className="text-[9px] text-gray-400 font-mono mt-0.5">Uso/Cliente: {usageName}</div>
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Attività / Sped.',
                      accessor: (b) => (
                        <div className="text-xs font-mono">
                          <Badge variant="info">{b.activityType}</Badge>
                          {b.orderNumber && <div className="text-[9px] mt-1 text-gray-600">Ord 1: {b.orderNumber} {b.orderNumber2 && `| Ord 2: ${b.orderNumber2}`}</div>}
                        </div>
                      ),
                    },
                    {
                      header: 'Check-In',
                      accessor: (b) => {
                        const isGuard = currentRole === 'GUARDIA' || currentRole === 'ADMIN';
                        return (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!isGuard}
                            onClick={() => handleOpenCheckInModal(b)}
                          >
                            Check-In Cancello
                          </Button>
                        );
                      },
                    },
                  ]}
                />
              </Card>
            )}

            {/* VISTA: NUOVO ARRIVO RAPIDO */}
            {guardiolaView === 'rapid' && (
              <Card title="Registrazione Rapida Nuovo Arrivo (Senza Prenotazione)" accent="orange">
                {currentRole === 'PREPOSTO' ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    Funzione riservata alla sola Guardiola.
                  </p>
                ) : (
                  <form onSubmit={handleRegisterManualArrival} className="space-y-4 text-xs font-sans max-w-xl mx-auto p-2 bg-gray-50/50 rounded-xl">
                    <Select
                      label="Vettore Selezionato *"
                      options={carriers.filter(c => c.status === 'APPROVATO').map((c) => ({ value: c.id, label: c.name }))}
                      value={carriers.find(c => c.id === manualCarrierId)?.name || manualCarrierId}
                      onChange={(e) => {
                        const found = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                        if (found) setManualCarrierId(found.id);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Input
                          label="Targa Trattore *"
                          placeholder="AA123BB"
                          value={manualPlate}
                          onChange={(e) => setManualPlate(e.target.value.replace(/\s+/g, '').toUpperCase())}
                          required
                        />
                        {isManualPlateDuplicate && (
                          <span className="text-[10px] text-amber-600 font-bold block leading-tight">
                            ⚠️ Targa associata ad altro vettore!
                          </span>
                        )}
                      </div>
                      <Input
                        label="Targa Rimorchio"
                        placeholder="CC789DD"
                        value={manualPlateTrailer}
                        onChange={(e) => setManualPlateTrailer(e.target.value.replace(/\s+/g, '').toUpperCase())}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Nominativo Autista *"
                        placeholder="Luca Verdi"
                        value={manualDriver}
                        onChange={(e) => setManualDriver(e.target.value)}
                        required
                      />
                      <Input
                        label="Posti Pallet *"
                        type="number"
                        placeholder="33"
                        value={manualPallets}
                        onChange={(e) => setManualPallets(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Riferimento Cliente / Uso Baia"
                        options={[{ value: '', label: 'Nessuno specifico' }, ...bayUsages.map(u => ({ value: u.id, label: u.name }))]}
                        value={bayUsages.find(u => u.id === manualClientUsageId)?.name || manualClientUsageId}
                        onChange={(e) => {
                          const found = bayUsages.find(u => u.name === e.target.value || u.id === e.target.value);
                          setManualClientUsageId(found ? found.id : e.target.value);
                        }}
                      />
                      <Input
                        label="Telefono Autista"
                        placeholder="3331234567"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Rif. Carico 1 (Obbligatorio) *"
                        placeholder="Es. ORD-12345"
                        value={manualOrderNumber}
                        onChange={(e) => setManualOrderNumber(e.target.value)}
                        required
                      />
                      <Input
                        label="Rif. Carico 2 (Facoltativo)"
                        placeholder="Es. ORD-54321"
                        value={manualOrderNumber2}
                        onChange={(e) => setManualOrderNumber2(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Patente N."
                        placeholder="U1928"
                        value={manualDriverLicense}
                        onChange={(e) => setManualDriverLicense(e.target.value)}
                      />
                      <Input
                        label="Data Rilascio"
                        type="date"
                        value={manualDriverLicenseRelease}
                        onChange={(e) => setManualDriverLicenseRelease(e.target.value)}
                      />
                      <div className="space-y-1">
                        <Input
                          label="Data Scadenza"
                          type="date"
                          value={manualDriverLicenseExpiry}
                          onChange={(e) => setManualDriverLicenseExpiry(e.target.value)}
                        />
                        {isManualLicenseExpired && (
                          <span className="text-[9px] text-red-600 font-bold block leading-tight animate-pulse-glow">
                            ⚠️ SCADUTA!
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      label="Attività Richiesta"
                      options={activityTypes.map(act => ({ value: act.code, label: act.name }))}
                      value={activityTypes.find(a => a.code === manualActivityCode)?.name || manualActivityCode}
                      onChange={(e) => {
                        const found = activityTypes.find(a => a.name === e.target.value || a.code === e.target.value);
                        if (found) setManualActivityCode(found.code);
                      }}
                    />
                    <Input
                      label="Note di Ingresso"
                      placeholder="Sigilli, anomalie, Bio..."
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                      Esegui Check-In & Inserisci in Coda
                    </Button>
                  </form>
                )}
              </Card>
            )}

            {/* VISTA: TABELLONE & CALENDARIO */}
            {guardiolaView === 'schedule' && (
              <div className="grid grid-cols-1 gap-6 animate-fade-in">
                
                {/* CALENDARIO */}
                <Card title="Calendario Attività Mensile" accent="orange">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-black/5 pb-2 font-mono">
                      <button
                        onClick={() => {
                          if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(prev => prev - 1);
                          } else {
                            setCurrentMonth(prev => prev - 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-xs font-bold"
                      >
                        ◀
                      </button>
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {monthsNames[currentMonth]} {currentYear}
                      </span>
                      <button
                        onClick={() => {
                          if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(prev => prev + 1);
                          } else {
                            setCurrentMonth(prev => prev + 1);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-xs font-bold"
                      >
                        ▶
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-gray-400 font-bold border-b border-black/5 pb-1">
                      <span>LUN</span><span>MAR</span><span>MER</span><span>GIO</span><span>VEN</span><span>SAB</span><span>DOM</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 font-mono text-xs">
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return <div key={`empty-${index}`} className="h-8" />;
                        }

                        const dateStr = formatDateString(currentYear, currentMonth, day);
                        const isSelected = dateStr === scheduleDate;
                        
                        const dayBookingsList = activeBookings.filter(b => b.date === dateStr);
                        const hasBookings = dayBookingsList.length > 0;
                        const allDone = hasBookings && dayBookingsList.every(b => b.status === 'COMPLETATO' || b.status === 'ANNULLATO');

                        let dayBgClass = 'bg-white border border-black/5 hover:border-black/20 text-gray-700';
                        if (hasBookings) {
                          if (allDone) {
                            dayBgClass = 'bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200';
                          } else {
                            dayBgClass = 'bg-[#11BCEC]/20 border border-[#11BCEC]/40 text-[#004B97] hover:bg-[#11BCEC]/30';
                          }
                        }

                        if (isSelected) {
                          dayBgClass += ' ring-2 ring-ticket-accent font-black scale-105 shadow-xs';
                        }

                        return (
                          <button
                            key={`day-${day}`}
                            onClick={() => setScheduleDate(dateStr)}
                            className={`h-8 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${dayBgClass}`}
                          >
                            <span className="text-[11px] font-bold">{day}</span>
                            {hasBookings && (
                              <span className="text-[7px] leading-none mt-0.5 opacity-80">
                                {dayBookingsList.length} v.
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* TABELLONE */}
                <Card title={`Programmazione Attività del Cantiere - Giorno: ${scheduleDate}`}>
                  <Table
                    data={dayBookings}
                    emptyMessage="Nessun transito pianificato o registrato per questa data."
                    rowClassName={(b: Booking) => b.status === 'COMPLETATO' ? 'opacity-50 line-through bg-gray-50/80 text-gray-400' : ''}
                    columns={[
                      {
                        header: 'Ticket',
                        accessor: (b) => {
                          const isIncomplete = !b.orderNumber || !b.driverLicense || !b.driverLicenseRelease || !b.driverLicenseExpiry || !b.clientUsageId;
                          const isExpired = b.driverLicenseExpiry && new Date(b.driverLicenseExpiry) < new Date();
                          return (
                            <div className="flex flex-col items-center gap-1">
                              {renderTriageTicket(b.ticketNumber)}
                              {isIncomplete && (
                                <span className="text-[7px] font-bold bg-amber-50 text-amber-600 border border-amber-300 px-1 py-0.5 rounded shadow-2xs select-none tracking-wider">
                                  ⚠️ Incompleto
                                </span>
                              )}
                              {isExpired && (
                                <span className="text-[7px] font-bold bg-rose-50 text-rose-600 border border-rose-300 px-1 py-0.5 rounded shadow-2xs select-none tracking-wider animate-pulse-glow">
                                  ⚠️ SCADUTA
                                </span>
                              )}
                            </div>
                          );
                        }
                      },
                      {
                        header: 'Targa Mezzo',
                        accessor: (b) => (
                          <div className="font-mono text-xs text-black">
                            <div className="font-bold">TR: {b.licensePlate}</div>
                            {b.licensePlateTrailer && <div className="text-[10px] text-gray-400">RIM: {b.licensePlateTrailer}</div>}
                          </div>
                        )
                      },
                      {
                        header: 'Autista',
                        accessor: (b) => {
                          const usageName = bayUsages.find(u => u.id === b.clientUsageId)?.name || 'Generico';
                          return (
                            <div className="text-xs font-sans">
                              <div className="font-bold">{b.driverName}</div>
                              {b.driverPhone && <div className="text-[10px] font-mono text-gray-400">Tel: {b.driverPhone}</div>}
                              <div className="text-[9px] font-mono text-gray-400 mt-0.5">Uso: {usageName}</div>
                            </div>
                          );
                        }
                      },
                      {
                        header: 'Vettore / Ordini',
                        accessor: (b) => {
                          const name = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                          return (
                            <div className="text-xs font-sans">
                              <span className="font-bold block text-gray-700">{name}</span>
                              <span className="font-mono text-[9px] text-gray-500">Ord 1: {b.orderNumber}</span>
                              {b.orderNumber2 && <span className="font-mono text-[9px] text-gray-500 block">Ord 2: {b.orderNumber2}</span>}
                            </div>
                          );
                        }
                      },
                      {
                        header: 'Pallet (PL)',
                        accessor: (b) => <span className="font-mono text-xs">{b.palletPlaces || '-'}</span>
                      },
                      {
                        header: 'Attività',
                        accessor: (b) => <Badge variant="info">{b.activityType}</Badge>
                      },
                      {
                        header: 'Baia Assegnata',
                        accessor: (b) => {
                          if (b.bayId) {
                            const bName = bays.find(bay => bay.id === b.bayId)?.name || 'Baia';
                            return <span className="font-mono font-bold text-ticket-accent text-xs bg-white border px-2 py-0.5 rounded shadow-2xs">{bName}</span>;
                          }
                          return <span className="text-xs text-gray-400 italic">Non in Baia</span>;
                        }
                      },
                      {
                        header: 'Orari',
                        accessor: (b) => (
                          <div className="text-[9px] font-mono text-gray-500 space-y-0.5">
                            <div>In: {formatTime(b.timeInGate)}</div>
                            <div>Dock: {formatTime(b.timeInBay)}</div>
                            <div>Out: {formatTime(b.timeOutGate)}</div>
                          </div>
                        )
                      },
                      {
                        header: 'Stato',
                        accessor: (b) => (
                          <div className="flex flex-col gap-1 items-start">
                            {getBookingStatusBadge(b.status)}
                            {b.checklist && (
                              <button
                                onClick={() => handlePrintChecklist(b)}
                                className="text-[8px] font-bold uppercase tracking-wider text-[#11BCEC] hover:underline"
                              >
                                🖨️ Stampa checklist
                              </button>
                            )}
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>
              </div>
            )}

            {/* VISTA: ANOMALIE PLANT */}
            {guardiolaView === 'anomalies' && (
              <Card title={`Gestione Anomalie e Problematiche - Plant: ${activeDepot?.name}`}>
                <p className="text-xs text-ticket-muted mb-4 font-mono uppercase">
                  // LOG ATTIVI DI ACCESSO AL CANTIERE CHE RICHIEDONO VERIFICHE O DEROGHE
                </p>
                <Table
                  data={anomalies.filter(a => a.depotId === selectedDepotId)}
                  emptyMessage="Nessun allarme o anomalia registrata per questo stabilimento."
                  rowClassName={(a) => a.resolved ? 'opacity-65 bg-gray-50/50' : 'bg-rose-50/20 border-l-4 border-rose-500'}
                  columns={[
                    {
                      header: 'Data / Ora',
                      accessor: (a) => <span className="font-mono text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
                    },
                    {
                      header: 'Ticket / Targa',
                      accessor: (a) => (
                        <div className="font-mono text-xs">
                          {a.licensePlate && <div>Targa: <span className="font-bold">{a.licensePlate}</span></div>}
                          {a.ticketNumber && <div className="text-[10px] text-gray-400">Ticket: {a.ticketNumber}</div>}
                        </div>
                      )
                    },
                    {
                      header: 'Tipologia',
                      accessor: (a) => {
                        let color: 'danger' | 'warning' | 'info' | 'primary' = 'danger';
                        if (a.type === 'TARGA_DUPLICATA') color = 'warning';
                        if (a.type === 'SFORAMENTO_TEMPO') color = 'primary';
                        return <Badge variant={color}>{a.type.replace('_', ' ')}</Badge>;
                      }
                    },
                    {
                      header: 'Descrizione Problema',
                      accessor: (a) => <p className="text-xs max-w-[300px] font-medium">{a.message}</p>
                    },
                    {
                      header: 'Stato / Risoluzione',
                      accessor: (a) => {
                        if (a.resolved) {
                          return (
                            <div className="text-[10px] font-sans text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                              <span className="font-bold">Risolta da:</span> {a.resolvedBy}
                              <div className="italic mt-0.5">Note: "{a.resolutionNotes}"</div>
                            </div>
                          );
                        }
                        return (
                          <div className="flex flex-col gap-1">
                            <Badge variant="danger">ATTIVA</Badge>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setActiveResolveAnomalyId(a.id);
                                setResolveNotes('');
                              }}
                            >
                              Giustifica e Risolvi
                            </Button>
                          </div>
                        );
                      }
                    }
                  ]}
                />
              </Card>
            )}

          </div>

        </div>

      </div>

      {/* --- POPUP DI ALLERTA BLOCCO GUARDIOLA --- */}
      {activeAlertForGuardiola && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-4 border-rose-500 overflow-hidden">
            <div className="bg-rose-500 text-white p-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                🚨 BLOCCO QUALITÀ: CHECKLIST FALLITA
              </h3>
              <p className="text-[10px] text-white/80 font-mono mt-1">
                Generata allerta da Preposto: {activeAlertForGuardiola.prepostoName}
              </p>
            </div>
            
            <div className="p-5 space-y-4 font-sans text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                <p className="font-bold">Veicolo in Baia rilevato non conforme!</p>
                <div className="mt-2 text-[11px] font-mono space-y-1">
                  <div>Targa: {bookings.find(b => b.id === activeAlertForGuardiola.bookingId)?.licensePlate}</div>
                  <div>Baia: {bays.find(b => b.id === activeAlertForGuardiola.bayId)?.name}</div>
                </div>
              </div>

              <div>
                <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider mb-1">Anomalie Rilevate:</span>
                <ul className="list-disc pl-4 space-y-1 text-black font-mono text-[10px]">
                  {activeAlertForGuardiola.failedChecks.map((check: string, i: number) => (
                    <li key={i}>{check}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-black/5">
                <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  Giustificazione / Note Risoluzione *
                </label>
                <textarea
                  rows={2}
                  placeholder="Se si respinge il mezzo, inserire il motivo. Se si sblocca, giustificare la deroga..."
                  value={alertResolveReason}
                  onChange={(e) => setAlertResolveReason(e.target.value)}
                  className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:outline-none focus:ring-0 resize-none font-sans"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button
                variant="danger"
                className="flex-1 text-xs"
                onClick={() => handleResolveAlert('RESPINTO')}
              >
                Respingi Mezzo
              </Button>
              <Button
                variant="success"
                className="flex-1 text-xs"
                onClick={() => handleResolveAlert('PROCEDI')}
              >
                Autorizza Transito
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DI RISOLUZIONE ANOMALIA YARD (GUARDIOLA) --- */}
      {activeResolveAnomalyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-black/10 overflow-hidden">
            <div className="bg-rose-500 text-white p-4">
              <h3 className="font-bold text-sm uppercase">Deroga & Risoluzione Anomalia</h3>
            </div>
            <div className="p-4 space-y-3 font-sans text-xs">
              <p className="text-gray-600">Inserire le note o la giustificazione per marcare questa anomalia come risolta:</p>
              <textarea
                rows={3}
                placeholder="Es. Verificato cartaceo patente valida / Deroga approvata da direzione..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
              />
            </div>
            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => setActiveResolveAnomalyId(null)}>Annulla</Button>
              <Button variant="success" className="flex-1 text-xs" onClick={() => {
                resolveAnomaly(activeResolveAnomalyId, resolveNotes);
                setActiveResolveAnomalyId(null);
                setResolveNotes('');
              }} disabled={!resolveNotes.trim()}>Conferma Risoluzione</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: CHECK-IN NOTE E PATENTE (GUARDIOLA) --- */}
      {checkInBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-black/10 overflow-hidden">
            <div className="bg-gradient-to-r from-[#003a75] to-[#004B97] text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Registrazione Check-In Cancello
              </h3>
              <p className="text-[10px] text-white/70 font-mono mt-1">
                Ticket: {checkInBooking.ticketNumber || 'N/D'} | Veicolo: {checkInBooking.licensePlate}
              </p>
            </div>
            <div className="p-4 space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Targa Rimorchio"
                  placeholder="Es. CC789DD"
                  value={checkInPlateTrailer}
                  onChange={(e) => setCheckInPlateTrailer(e.target.value.replace(/\s+/g, '').toUpperCase())}
                />
                <Select
                  label="Uso Baia / Cliente"
                  options={[{ value: '', label: 'Nessun uso specifico' }, ...bayUsages.map(u => ({ value: u.id, label: u.name }))]}
                  value={bayUsages.find(u => u.id === checkInClientUsageId)?.name || checkInClientUsageId}
                  onChange={(e) => {
                    const found = bayUsages.find(u => u.name === e.target.value || u.id === e.target.value);
                    setCheckInClientUsageId(found ? found.id : e.target.value);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Rif. Carico 1 *"
                  placeholder="Riferimento d'ordine 1..."
                  value={checkInOrderNumber}
                  onChange={(e) => setCheckInOrderNumber(e.target.value)}
                />
                <Input
                  label="Rif. Carico 2"
                  placeholder="Riferimento d'ordine 2..."
                  value={checkInOrderNumber2}
                  onChange={(e) => setCheckInOrderNumber2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-1">
                <Input
                  label="Patente Autore"
                  placeholder="Numero patente..."
                  value={checkInLicense}
                  onChange={(e) => setCheckInLicense(e.target.value)}
                />
                <Input
                  label="Rilascio"
                  type="date"
                  value={checkInLicenseRelease}
                  onChange={(e) => setCheckInLicenseRelease(e.target.value)}
                />
                <div className="space-y-1">
                  <Input
                    label="Scadenza"
                    type="date"
                    value={checkInLicenseExpiry}
                    onChange={(e) => setCheckInLicenseExpiry(e.target.value)}
                  />
                  {isCheckInLicenseExpired && (
                    <span className="text-[8px] text-red-600 font-bold block leading-tight animate-pulse-glow">
                      ⚠️ SCADUTA!
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Telefono Autista"
                  placeholder="Es. +39 347 1122334"
                  value={checkInPhone}
                  onChange={(e) => setCheckInPhone(e.target.value)}
                />
                <div className="h-4" />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                  Nota di Check-In
                </label>
                <textarea
                  rows={2}
                  placeholder="Note relative all'arrivo..."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full bg-[#F5F0EB]/40 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => setCheckInBooking(null)}
              >
                Annulla
              </Button>
              <Button
                className="flex-1 text-xs"
                onClick={handleConfirmCheckIn}
              >
                Conferma Ingresso
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: GESTIONE DETTAGLIO BAIA ATTIVA --- */}
      {activeBayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-black/10 overflow-hidden my-8">
            
            <div className="bg-gradient-to-r from-[#004B97] to-[#0062b8] text-white p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Gestione Attiva Baia: {activeBayDetail.bay.name}
                </h3>
                <span className="text-[9px] font-mono text-white/70 block mt-0.5">
                  Modulo: {warehouseModules.find(m => m.id === activeBayDetail.bay.moduleId)?.name || 'Generico'}
                </span>
              </div>
              <Badge variant="warning">{activeBayDetail.booking.ticketNumber || 'Triage'}</Badge>
            </div>

            <div className="p-5 space-y-5 font-sans text-xs">
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-black/5 pb-4 bg-gray-50/50 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Vettore</span>
                  <span className="font-bold text-black text-xs block truncate">
                    {carriers.find(c => c.id === activeBayDetail.booking.carrierId)?.name || 'N/D'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Trattore (Targa)</span>
                  <span className="font-bold text-ticket-accent text-xs block font-mono">
                    {activeBayDetail.booking.licensePlate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Rimorchio</span>
                  <span className="font-bold text-black text-xs block font-mono">
                    {activeBayDetail.booking.licensePlateTrailer || 'Non associato'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Autista</span>
                  <span className="font-bold text-black text-xs block truncate">
                    {activeBayDetail.booking.driverName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Ordini N.</span>
                  <span className="font-bold text-gray-700 text-xs block truncate">
                    {activeBayDetail.booking.orderNumber} {activeBayDetail.booking.orderNumber2 && ` / ${activeBayDetail.booking.orderNumber2}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Attracco</span>
                  <span className="font-bold text-amber-600 text-xs block">
                    {formatTime(activeBayDetail.booking.timeInBay)}
                  </span>
                </div>
              </div>

              {!showChecklistForm ? (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#11BCEC] border-b border-black/5 pb-1">
                      Cronologia Note (Case History)
                    </h4>
                    
                    <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
                      <div className="max-h-[120px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[10px] font-mono">
                          <thead>
                            <tr className="bg-gray-50 border-b border-black/10 text-gray-400 text-[8px] uppercase">
                              <th className="p-2">Orario</th>
                              <th className="p-2">Operatore</th>
                              <th className="p-2">Nota</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {!activeBayDetail.booking.notesHistory || activeBayDetail.booking.notesHistory.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-400 italic">Nessuna nota storica registrata.</td>
                              </tr>
                            ) : (
                              activeBayDetail.booking.notesHistory.map((note: BookingNote) => (
                                <tr key={note.id} className="hover:bg-gray-50/50">
                                  <td className="p-2 text-gray-500">{new Date(note.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</td>
                                  <td className="p-2 text-black font-bold">{note.author}</td>
                                  <td className="p-2 text-gray-600">{note.text}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Aggiungi una nota operativa..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-grow bg-[#F5F0EB]/40 border border-black/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-sans"
                      />
                      <Button size="sm" onClick={handleAddNoteDetail}>Aggiungi Nota</Button>
                    </div>
                  </div>

                  {activeBayDetail.booking.checklist && (
                    <div className={`p-3 rounded-lg border flex justify-between items-center ${activeBayDetail.booking.checklist.isFailed ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                      <div>
                        <span className="font-bold block text-[10px] uppercase font-mono">Checklist di Conformità Qualità</span>
                        <span className="text-[10px] block mt-0.5">Compilata da: {activeBayDetail.booking.checklist.compilataDa} il {new Date(activeBayDetail.booking.checklist.dataOraCheck).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handlePrintChecklist(activeBayDetail.booking)}>
                          🖨️ Stampa
                        </Button>
                        {currentRole === 'PREPOSTO' && (
                          <Button size="sm" variant="primary" onClick={() => setShowChecklistForm(true)}>
                            Modifica Checklist
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {!activeBayDetail.booking.checklist && currentRole === 'PREPOSTO' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase font-mono">Checklist Qualità non compilata!</span>
                      <Button size="sm" variant="warning" onClick={() => setShowChecklistForm(true)}>
                        Compila Checklist Qualità ➔
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 pt-3 border-t border-black/5">
                    <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#11BCEC] border-b border-black/5 pb-1">
                      Aggiornamento Anagrafica Veicolo
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input
                        label="Targa Rimorchio"
                        value={detailPlateTrailer}
                        onChange={(e) => setDetailPlateTrailer(e.target.value.replace(/\s+/g, '').toUpperCase())}
                      />
                      <Input
                        label="Telefono Autista"
                        value={detailPhone}
                        onChange={(e) => setDetailPhone(e.target.value)}
                      />
                      <Input
                        label="Posti Pallet"
                        type="number"
                        value={detailPallets === '' ? '' : detailPallets}
                        onChange={(e) => setDetailPallets(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <Select
                        label="Uso Baia / Cliente"
                        options={[{ value: '', label: 'Generico' }, ...bayUsages.map(u => ({ value: u.id, label: u.name }))]}
                        value={bayUsages.find(u => u.id === detailClientUsageId)?.name || detailClientUsageId}
                        onChange={(e) => {
                          const found = bayUsages.find(u => u.name === e.target.value || u.id === e.target.value);
                          setDetailClientUsageId(found ? found.id : e.target.value);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input
                        label="Rif. Carico 1 *"
                        value={detailOrderNumber}
                        onChange={(e) => setDetailOrderNumber(e.target.value)}
                      />
                      <Input
                        label="Rif. Carico 2"
                        value={detailOrderNumber2}
                        onChange={(e) => setDetailOrderNumber2(e.target.value)}
                      />
                      <Input
                        label="Numero Patente"
                        value={detailLicense}
                        onChange={(e) => setDetailLicense(e.target.value)}
                      />
                      <Input
                        label="Scadenza Patente"
                        type="date"
                        value={detailLicenseExpiry}
                        onChange={(e) => setDetailLicenseExpiry(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Data Rilascio Patente"
                        type="date"
                        value={detailLicenseRelease}
                        onChange={(e) => setDetailLicenseRelease(e.target.value)}
                      />
                      <Select
                        label="Cambia Tipo Attività"
                        options={activityTypes.map(a => ({ value: a.code, label: a.name }))}
                        value={activityTypes.find(a => a.code === detailActivity)?.name || detailActivity}
                        onChange={(e) => {
                          const found = activityTypes.find(a => a.name === e.target.value || a.code === e.target.value);
                          if (found) setDetailActivity(found.code);
                        }}
                      />
                    </div>
                    <Button size="sm" onClick={handleSaveBayDetailChanges} className="w-full">
                      Salva Dettagli Anagrafici
                    </Button>
                  </div>

                  {(currentRole === 'GUARDIA' || currentRole === 'ADMIN') && (
                    <div className="space-y-3 pt-3 border-t border-black/5">
                      <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-amber-600 border-b border-black/5 pb-1">
                        Spostamento ad altra Baia Libera
                      </h4>
                      
                      {activeBays.filter((b) => b.status === 'DISPONIBILE').length === 0 ? (
                        <p className="text-[10px] text-rose-500 italic font-mono">// NESSUNA ALTRA BAIA LIBERA DISPONIBILE PER IL MEZZO</p>
                      ) : (
                        <div className="space-y-2">
                          <Select
                            label="Seleziona Baia Libera"
                            options={[{ value: '', label: 'Scegli baia...' }, ...activeBays.filter(b => b.status === 'DISPONIBILE').map(b => ({ value: b.id, label: b.name }))]}
                            value={bays.find(b => b.id === relocateBayId)?.name || relocateBayId}
                            onChange={(e) => {
                              const found = bays.find(b => b.name === e.target.value || b.id === e.target.value);
                              setRelocateBayId(found ? found.id : e.target.value);
                            }}
                          />
                          <Input
                            label="Motivazione dello Spostamento *"
                            placeholder="Inserisci motivazione..."
                            value={relocateReason}
                            onChange={(e) => setRelocateReason(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={handleConfirmRelocate}
                            disabled={!relocateBayId || !relocateReason}
                            className="w-full"
                          >
                            Conferma Spostamento Baia
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* --- FORM COMPILAZIONE CHECKLIST QUALITÀ --- */
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold text-[11px] uppercase font-mono tracking-wider text-amber-600 border-b border-black/10 pb-1">
                    Compilazione Checklist Qualità & Conformità Mezzo
                  </h4>

                  <div className="space-y-2">
                    <span className="block font-bold text-gray-500 text-[9px] uppercase tracking-wider">1. Idoneità Igienica del Mezzo</span>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">Pianale Sporco?</span>
                        <input
                          type="checkbox"
                          checked={pianaleSporco}
                          onChange={(e) => setPianaleSporco(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">Presenza Infestanti?</span>
                        <input
                          type="checkbox"
                          checked={presenzaInfestantiMezzo}
                          onChange={(e) => setPresenzaInfestantiMezzo(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">Odori Anomali?</span>
                        <input
                          type="checkbox"
                          checked={odoriAnomali}
                          onChange={(e) => setOdoriAnomali(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block font-bold text-gray-500 text-[9px] uppercase tracking-wider">2. Idoneità Igienica del Prodotto & Pallet</span>
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg font-mono">
                      <div className="flex items-center justify-between">
                        <span>Pallet Puliti?</span>
                        <input
                          type="checkbox"
                          checked={puliziaPallet}
                          onChange={(e) => setPuliziaPallet(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pallet Integri?</span>
                        <input
                          type="checkbox"
                          checked={integritaPallet}
                          onChange={(e) => setIntegritaPallet(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Infestanti Prodotto?</span>
                        <input
                          type="checkbox"
                          checked={presenzaInfestantiProdotto}
                          onChange={(e) => setPresenzaInfestantiProdotto(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Presenza Prodotti Bio?</span>
                        <input
                          type="checkbox"
                          checked={presenzaBio}
                          onChange={(e) => setPresenzaBio(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    <Input
                      label="Note Libere Conformità Merci"
                      placeholder="Anomalie pallet, rotture..."
                      value={noteLibere}
                      onChange={(e) => setNoteLibere(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 border-t border-black/5 pt-2">
                    <span className="block font-bold text-gray-500 text-[9px] uppercase tracking-wider">3. Verifica Sigillo di Sicurezza</span>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-3 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Sigillo Presente?</span>
                        <input
                          type="checkbox"
                          checked={sigilloPresente}
                          onChange={(e) => setSigilloPresente(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      {sigilloPresente && (
                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                          <Input
                            label="Numero Sigillo"
                            placeholder="Es. SIG-100293"
                            value={numeroSigillo}
                            onChange={(e) => setNumeroSigillo(e.target.value)}
                          />
                          <div className="flex items-center justify-between mt-6">
                            <span className="text-[10px]">Corrisponde a DDT?</span>
                            <input
                              type="checkbox"
                              checked={corrispondenzaDdt}
                              onChange={(e) => setCorrispondenzaDdt(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      label="Note Sigillo"
                      placeholder="es. Sigillo spezzato..."
                      value={noteSigillo}
                      onChange={(e) => setNoteSigillo(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowChecklistForm(false)}>
                      Annulla
                    </Button>
                    <Button variant="warning" className="flex-1" onClick={handleSaveChecklist}>
                      Salva e Sottoscrivi
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button
                variant="secondary"
                className="flex-grow text-xs"
                onClick={() => setActiveBayDetail(null)}
              >
                Chiudi
              </Button>
              {currentRole === 'PREPOSTO' && !showChecklistForm && (
                <Button
                  variant="success"
                  className="flex-grow text-xs"
                  onClick={() => handleCompleteActivityFromDetail(activeBayDetail.booking.id)}
                >
                  Completa Attività & Libera
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

const getBookingStatusBadge = (status: Booking['status']) => {
  switch (status) {
    case 'PRENOTATO':
      return <Badge variant="info">Prenotato</Badge>;
    case 'AL_CANCELLO':
      return <Badge variant="warning">In Guardiola</Badge>;
    case 'IN_BAIA':
      return <Badge variant="primary">In Baia</Badge>;
    case 'COMPLETATO':
      return <Badge variant="success">Completato</Badge>;
    case 'ANNULLATO':
      return <Badge variant="danger">Respinto / Ann.</Badge>;
    default:
      return null;
  }
};
