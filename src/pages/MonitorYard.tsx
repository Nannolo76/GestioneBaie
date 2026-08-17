import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { TerritoryAutocomplete } from '../components/TerritoryAutocomplete';
import type { Booking, Bay, BookingNote, Shipment } from '../types';
import { calculateSmartRouting } from '../utils/geo';

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
    addPalletReturn,
    removePalletReturn,
    emitPalletVoucher,
    palletTypes,
    shipments,
    clients,
    addShipment,
    deleteShipment,
    deleteShipments,
    bindShipmentsToBooking,
    unbindShipmentFromBooking,
    updateShipment
  } = useApp();

  // Stato navigazione sottomenu a sinistra (Opzione A)
  const [guardiolaView, setGuardiolaView] = useState<'station' | 'bays' | 'gate' | 'expected' | 'rapid' | 'schedule' | 'anomalies'>('station');
  
  // Stati TMS Spedizioni / Viaggi
  const [stationSubTab, setStationSubTab] = useState<'arrivi' | 'partenze'>('arrivi');
  const [selectedShipmentIdsForCheckIn, setSelectedShipmentIdsForCheckIn] = useState<string[]>([]);
  const [activeLinkingShipmentId, setActiveLinkingShipmentId] = useState<string | null>(null);
  const [linkingBookingId, setLinkingBookingId] = useState<string>('');

  // Stati Gestione Spedizioni Guardiola
  const [shipmentFormId, setShipmentFormId] = useState('');
  const [shipmentFormClient, setShipmentFormClient] = useState('');
  const [shipmentFormCarrier, setShipmentFormCarrier] = useState('');
  const [shipmentFormOrder, setShipmentFormOrder] = useState('');
  const [shipmentFormOrder2, setShipmentFormOrder2] = useState('');
  const [shipmentFormType, setShipmentFormType] = useState<'CARICO' | 'SCARICO' | 'RESO' | 'CONTAINER'>('CARICO');
  const [shipmentFormPallets, setShipmentFormPallets] = useState<number>(24);
  const [shipmentFormExpectedDate, setShipmentFormExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shipmentFormExpectedTime, setShipmentFormExpectedTime] = useState('');
  const [shipmentFormOriginDest, setShipmentFormOriginDest] = useState('');
  const [shipmentFormGoods, setShipmentFormGoods] = useState('');
  const [shipmentFormDeliveryDate, setShipmentFormDeliveryDate] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');

  // Nuovi stati per spedizioni estese (mittente/destinatario e logistica)
  const [shipmentFormSubjectName, setShipmentFormSubjectName] = useState('');
  const [shipmentFormAddress, setShipmentFormAddress] = useState('');
  const [shipmentFormCity, setShipmentFormCity] = useState('');
  const [shipmentFormCap, setShipmentFormCap] = useState('');
  const [shipmentFormProvince, setShipmentFormProvince] = useState('');
  const [shipmentFormRegion, setShipmentFormRegion] = useState('');
  const [shipmentFormCountry, setShipmentFormCountry] = useState('');
  const [shipmentFormGrossWeight, setShipmentFormGrossWeight] = useState('');
  const [shipmentFormDeliveryNotes, setShipmentFormDeliveryNotes] = useState('');
  const [shipmentFormInternalNotes, setShipmentFormInternalNotes] = useState('');

  // Nuovi stati per anagrafica geografica strutturata reale e routing del network
  const [shipmentFormRealOriginName, setShipmentFormRealOriginName] = useState('');
  const [shipmentFormRealOriginAddress, setShipmentFormRealOriginAddress] = useState('');
  const [shipmentFormRealOriginCity, setShipmentFormRealOriginCity] = useState('');
  const [shipmentFormRealOriginCap, setShipmentFormRealOriginCap] = useState('');
  const [shipmentFormRealOriginProvince, setShipmentFormRealOriginProvince] = useState('');
  const [shipmentFormRealOriginCountry, setShipmentFormRealOriginCountry] = useState('');
  const [shipmentFormRealDestinationName, setShipmentFormRealDestinationName] = useState('');
  const [shipmentFormRealDestinationAddress, setShipmentFormRealDestinationAddress] = useState('');
  const [shipmentFormRealDestinationCity, setShipmentFormRealDestinationCity] = useState('');
  const [shipmentFormRealDestinationCap, setShipmentFormRealDestinationCap] = useState('');
  const [shipmentFormRealDestinationProvince, setShipmentFormRealDestinationProvince] = useState('');
  const [shipmentFormRealDestinationCountry, setShipmentFormRealDestinationCountry] = useState('');
  const [shipmentFormHubOrigineOperativo, setShipmentFormHubOrigineOperativo] = useState('');
  const [shipmentFormHubDestinazioneOperativo, setShipmentFormHubDestinazioneOperativo] = useState('');
  const [shipmentFormTipoOperazioneHub, setShipmentFormTipoOperazioneHub] = useState<'INBOUND' | 'OUTBOUND' | 'TRANSITO'>('INBOUND');
  const [isRoutingAutoCalculated, setIsRoutingAutoCalculated] = useState(false);
  const [isRoutingAmbiguous, setIsRoutingAmbiguous] = useState(false);
  const [isAutoRoutingEnabled, setIsAutoRoutingEnabled] = useState(true);
  const [shipmentFormRoutingNotes, setShipmentFormRoutingNotes] = useState('Instradamento confermato');

  // Stati Modali e Selezioni Multipli
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [isImportShipmentModalOpen, setIsImportShipmentModalOpen] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [isQuickResolutionModalOpen, setIsQuickResolutionModalOpen] = useState(false);
  const [selectedResolutionIds, setSelectedResolutionIds] = useState<string[]>([]);

  // Stati Filtri Avanzati
  const [filterReference, setFilterReference] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [matchedShipmentForGate, setMatchedShipmentForGate] = useState<Shipment | null>(null);
  const [shipmentsFilterTab, setShipmentsFilterTab] = useState<'all' | 'unbound' | 'bound'>('all');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  // Stati Importazione da file/testo
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  // Stati KPI & Statistiche
  const [kpiDataSource, setKpiDataSource] = useState<'reali' | 'simulati'>('simulati');
  const [kpiTimeRange, setKpiTimeRange] = useState<'oggi' | '7g' | '30g'>('7g');
  
  // Data selezionata per le attività
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Stato per la navigazione del mese nel calendario
  const [currentYear, setCurrentYear] = useState(new Date(scheduleDate).getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date(scheduleDate).getMonth());

  // Filtro Depot
  const activeDepot = depots.find((d) => d.id === selectedDepotId);
  const activeBays = bays.filter((b) => b.depotId === selectedDepotId);
  const ambiguousShipments = shipments.filter(s => s.routingStatus === 'DA_CONFERMARE');
  const getFreeBaysCount = (depotId: string) => {
    return bays.filter(b => b.depotId === depotId && b.status === 'DISPONIBILE').length;
  };
  
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

  useEffect(() => {
    const approved = carriers.filter(c => c.status === 'APPROVATO');
    if (approved.length > 0) {
      if (!manualCarrierId) setManualCarrierId(approved[0].id);
      if (!shipmentFormCarrier) setShipmentFormCarrier(approved[0].id);
    }
  }, [carriers, manualCarrierId, shipmentFormCarrier]);

  useEffect(() => {
    if (clients.length > 0) {
      if (!shipmentFormClient) setShipmentFormClient(clients[0].id);
    }
  }, [clients, shipmentFormClient]);

  useEffect(() => {
    if (activityTypes.length > 0 && (!manualActivityCode || manualActivityCode === 'SCARICO')) {
      const exists = activityTypes.some(a => a.code === manualActivityCode);
      if (!exists && activityTypes[0]) {
        setManualActivityCode(activityTypes[0].code);
      }
    }
  }, [activityTypes, manualActivityCode]);
  
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
  const [modalTab, setModalTab] = useState<'info' | 'checklist' | 'reso' | 'edit' | 'move'>('info');
  const [palletType, setPalletType] = useState<string>('EPAL');
  const [palletQuantity, setPalletQuantity] = useState<number | ''>('');
  const [palletCondition, setPalletCondition] = useState<'BUONO' | 'ROTTO'>('BUONO');
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
  const [printType, setPrintType] = useState<'checklist' | 'voucher'>('checklist');

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

  const handleSmartGateSearch = (query: string) => {
    setSmartSearchQuery(query);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setMatchedShipmentForGate(null);
      return;
    }

    const match = shipments.find(s => {
      const isForThisHub = s.depotId === selectedDepotId || 
                           s.hubOrigineOperativo === selectedDepotId || 
                           s.hubDestinazioneOperativo === selectedDepotId;
      if (!isForThisHub) return false;

      return s.orderNumber.toLowerCase() === trimmed ||
             (s.orderNumber2 && s.orderNumber2.toLowerCase() === trimmed) ||
             (s.licensePlate && s.licensePlate.toLowerCase().replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''));
    });

    if (match) {
      setMatchedShipmentForGate(match);
      setManualCarrierId(match.carrierId);
      if (match.licensePlate) setManualPlate(match.licensePlate);
      setManualOrderNumber(match.orderNumber);
      setManualOrderNumber2(match.orderNumber2 || '');
      setManualPallets(match.palletPlaces);
      setManualActivityCode(match.activityType);
      
      const clientUsage = bayUsages.find(u => u.name.toLowerCase() === match.clientId.toLowerCase() || u.id === match.clientId);
      if (clientUsage) {
        setManualClientUsageId(clientUsage.id);
      }
    } else {
      setMatchedShipmentForGate(null);
    }
  };

  const handleConfirmSmartCheckIn = () => {
    if (!matchedShipmentForGate) return;
    const s = matchedShipmentForGate;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const newBId = addBooking(
      selectedDepotId,
      todayStr,
      s.activityType,
      manualPlate.toUpperCase() || s.licensePlate?.toUpperCase() || 'TARGA',
      manualDriver || 'Autista Autocompilato',
      manualPhone || undefined,
      manualNotes || `Smart Check-In per ordine ${s.orderNumber}`,
      s.palletPlaces,
      manualDriverLicense || 'DOCUMENTO',
      manualDriverLicenseRelease || undefined,
      s.orderNumber,
      manualClientUsageId || undefined,
      manualPlateTrailer || undefined,
      manualDriverLicenseExpiry || undefined,
      s.orderNumber2
    );

    bindShipmentsToBooking([s.id], newBId);

    setSmartSearchQuery('');
    setMatchedShipmentForGate(null);
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
    
    setGuardiolaView('gate');
  };

  const handleRegisterManualArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver || !manualOrderNumber) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newBId = addBooking(
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
    
    if (selectedShipmentIdsForCheckIn.length > 0) {
      bindShipmentsToBooking(selectedShipmentIdsForCheckIn, newBId);
    }
    
    setSelectedShipmentIdsForCheckIn([]);
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
    if (selectedShipmentIdsForCheckIn.length > 0) {
      bindShipmentsToBooking(selectedShipmentIdsForCheckIn, checkInBooking.id);
    }
    setSelectedShipmentIdsForCheckIn([]);
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
    setModalTab('info');
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
    setPalletType('EPAL');
    setPalletQuantity('');
    setPalletCondition('BUONO');

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
    setPrintType('checklist');
    setPrintBooking(booking);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const resetShipmentForm = () => {
    setShipmentFormId('');
    setShipmentFormOrder('');
    setShipmentFormOrder2('');
    setShipmentFormPallets(24);
    setShipmentFormExpectedTime('');
    setShipmentFormOriginDest('');
    setShipmentFormGoods('');
    setShipmentFormDeliveryDate('');
    setShipmentFormSubjectName('');
    setShipmentFormAddress('');
    setShipmentFormCity('');
    setShipmentFormCap('');
    setShipmentFormProvince('');
    setShipmentFormRegion('');
    setShipmentFormCountry('');
    setShipmentFormGrossWeight('');
    setShipmentFormDeliveryNotes('');
    setShipmentFormInternalNotes('');
    
    // Nuovi campi
    setShipmentFormRealOriginName('');
    setShipmentFormRealOriginAddress('');
    setShipmentFormRealOriginCity('');
    setShipmentFormRealOriginCap('');
    setShipmentFormRealOriginProvince('');
    setShipmentFormRealOriginCountry('');
    setShipmentFormRealDestinationName('');
    setShipmentFormRealDestinationAddress('');
    setShipmentFormRealDestinationCity('');
    setShipmentFormRealDestinationCap('');
    setShipmentFormRealDestinationProvince('');
    setShipmentFormRealDestinationCountry('');
    setShipmentFormHubOrigineOperativo('');
    setShipmentFormHubDestinazioneOperativo('');
    setShipmentFormTipoOperazioneHub('INBOUND');
    setIsRoutingAutoCalculated(false);
    setIsRoutingAmbiguous(false);
    setIsAutoRoutingEnabled(true);
  };

  const handleEditShipmentClick = (s: Shipment) => {
    setShipmentFormId(s.id);
    setShipmentFormClient(s.clientId);
    setShipmentFormCarrier(s.carrierId);
    setShipmentFormOrder(s.orderNumber);
    setShipmentFormOrder2(s.orderNumber2 || '');
    setShipmentFormType(s.activityType);
    setShipmentFormPallets(s.palletPlaces);
    setShipmentFormExpectedDate(s.expectedDate);
    setShipmentFormExpectedTime(s.expectedTime || '');
    setShipmentFormOriginDest(s.originOrDestination || '');
    setShipmentFormGoods(s.goodsType || '');
    setShipmentFormDeliveryDate(s.expectedDeliveryDate || '');
    setShipmentFormSubjectName(s.subjectName || '');
    setShipmentFormAddress(s.address || '');
    setShipmentFormCity(s.city || '');
    setShipmentFormCap(s.cap || '');
    setShipmentFormProvince(s.province || '');
    setShipmentFormRegion(s.region || '');
    setShipmentFormCountry(s.country || '');
    setShipmentFormGrossWeight(s.grossWeight ? String(s.grossWeight) : '');
    setShipmentFormDeliveryNotes(s.deliveryNotes || '');
    setShipmentFormInternalNotes(s.internalNotes || '');

    // Nuovi campi
    setShipmentFormRealOriginName(s.realOriginName || '');
    setShipmentFormRealOriginAddress(s.realOriginAddress || '');
    setShipmentFormRealOriginCity(s.realOriginCity || '');
    setShipmentFormRealOriginCap(s.realOriginCap || '');
    setShipmentFormRealOriginProvince(s.realOriginProvince || '');
    setShipmentFormRealOriginCountry(s.realOriginCountry || '');
    setShipmentFormRealDestinationName(s.realDestinationName || '');
    setShipmentFormRealDestinationAddress(s.realDestinationAddress || '');
    setShipmentFormRealDestinationCity(s.realDestinationCity || '');
    setShipmentFormRealDestinationCap(s.realDestinationCap || '');
    setShipmentFormRealDestinationProvince(s.realDestinationProvince || '');
    setShipmentFormRealDestinationCountry(s.realDestinationCountry || '');
    setShipmentFormHubOrigineOperativo(s.hubOrigineOperativo || '');
    setShipmentFormHubDestinazioneOperativo(s.hubDestinazioneOperativo || '');
    setShipmentFormTipoOperazioneHub(s.tipoOperazioneHub || 'INBOUND');
    setIsRoutingAutoCalculated(false);
    setIsRoutingAmbiguous(false);
    setIsAutoRoutingEnabled(false);

    setIsNewShipmentModalOpen(true);
  };  // Effetto per il calcolo automatico intelligente del Routing di rete (Auto-Routing)
  useEffect(() => {
    if (!isAutoRoutingEnabled) return;

    const hasOriginInfo = !!(shipmentFormRealOriginCity || shipmentFormRealOriginCap || shipmentFormRealOriginProvince || shipmentFormRealOriginName);
    const hasDestInfo = !!(shipmentFormRealDestinationCity || shipmentFormRealDestinationCap || shipmentFormRealDestinationProvince || shipmentFormRealDestinationName);

    if (hasOriginInfo && hasDestInfo) {
      const routing = calculateSmartRouting(
        {
          city: shipmentFormRealOriginCity,
          cap: shipmentFormRealOriginCap,
          province: shipmentFormRealOriginProvince,
          name: shipmentFormRealOriginName
        },
        {
          city: shipmentFormRealDestinationCity,
          cap: shipmentFormRealDestinationCap,
          province: shipmentFormRealDestinationProvince,
          name: shipmentFormRealDestinationName
        },
        shipmentFormType,
        shipmentFormClient,
        depots,
        clients
      );

      setShipmentFormHubOrigineOperativo(routing.hubOrigineOperativo);
      setShipmentFormHubDestinazioneOperativo(routing.hubDestinazioneOperativo);
      setShipmentFormTipoOperazioneHub(routing.tipoOperazioneHub);
      setIsRoutingAutoCalculated(true);
      setIsRoutingAmbiguous(routing.isAmbiguous);
      setShipmentFormRoutingNotes(routing.routingNotes);
    } else {
      setIsRoutingAutoCalculated(false);
      setIsRoutingAmbiguous(false);
      setShipmentFormRoutingNotes('Instradamento confermato');
    }
  }, [
    shipmentFormRealOriginCity,
    shipmentFormRealOriginCap,
    shipmentFormRealOriginProvince,
    shipmentFormRealOriginName,
    shipmentFormRealDestinationCity,
    shipmentFormRealDestinationCap,
    shipmentFormRealDestinationProvince,
    shipmentFormRealDestinationName,
    shipmentFormType,
    shipmentFormClient,
    isAutoRoutingEnabled
  ]);
  const handleSaveShipmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cId = shipmentFormClient || clients[0]?.id;
    const carrId = shipmentFormCarrier || carriers.filter(c => c.status === 'APPROVATO')[0]?.id;
    if (!cId || !carrId || !shipmentFormOrder) return;

    const payloadUpdates = {
      clientId: cId,
      carrierId: carrId,
      depotId: selectedDepotId,
      orderNumber: shipmentFormOrder,
      orderNumber2: shipmentFormOrder2 || undefined,
      activityType: shipmentFormType,
      palletPlaces: shipmentFormPallets,
      expectedDate: shipmentFormExpectedDate,
      expectedTime: shipmentFormExpectedTime || undefined,
      originOrDestination: shipmentFormOriginDest || '',
      goodsType: shipmentFormGoods || undefined,
      expectedDeliveryDate: shipmentFormDeliveryDate || undefined,
      subjectName: shipmentFormSubjectName || undefined,
      address: shipmentFormAddress || undefined,
      city: shipmentFormCity || undefined,
      cap: shipmentFormCap || undefined,
      province: shipmentFormProvince || undefined,
      region: shipmentFormRegion || undefined,
      country: shipmentFormCountry || undefined,
      grossWeight: shipmentFormGrossWeight ? Number(shipmentFormGrossWeight) : undefined,
      deliveryNotes: shipmentFormDeliveryNotes || undefined,
      internalNotes: shipmentFormInternalNotes || undefined,
      realOriginName: shipmentFormRealOriginName || undefined,
      realOriginAddress: shipmentFormRealOriginAddress || undefined,
      realOriginCity: shipmentFormRealOriginCity || undefined,
      realOriginCap: shipmentFormRealOriginCap || undefined,
      realOriginProvince: shipmentFormRealOriginProvince || undefined,
      realOriginCountry: shipmentFormRealOriginCountry || undefined,
      realDestinationName: shipmentFormRealDestinationName || undefined,
      realDestinationAddress: shipmentFormRealDestinationAddress || undefined,
      realDestinationCity: shipmentFormRealDestinationCity || undefined,
      realDestinationCap: shipmentFormRealDestinationCap || undefined,
      realDestinationProvince: shipmentFormRealDestinationProvince || undefined,
      realDestinationCountry: shipmentFormRealDestinationCountry || undefined,
      hubOrigineOperativo: shipmentFormHubOrigineOperativo || undefined,
      hubDestinazioneOperativo: shipmentFormHubDestinazioneOperativo || undefined,
      tipoOperazioneHub: shipmentFormTipoOperazioneHub || undefined,
      routingStatus: isRoutingAmbiguous && isAutoRoutingEnabled ? ('DA_CONFERMARE' as const) : ('CONFERMATO' as const),
      routingNotes: shipmentFormRoutingNotes
    };

    if (shipmentFormId) {
      updateShipment(shipmentFormId, payloadUpdates);
    } else {
      addShipment(payloadUpdates);
    }

    resetShipmentForm();
    setIsNewShipmentModalOpen(false);
  };

  const handleImportShipments = () => {
    if (!importText.trim()) {
      setImportError('Il testo di importazione è vuoto.');
      return;
    }

    const lines = importText.split('\n');
    let successCount = 0;
    let errorCount = 0;

    const defaultClient = clients[0]?.id;
    const defaultCarrier = carriers.filter(c => c.status === 'APPROVATO')[0]?.id;

    if (!defaultClient || !defaultCarrier) {
      setImportError('Impossibile determinare cliente o vettore predefinito.');
      return;
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || (idx === 0 && trimmed.toLowerCase().includes('rif'))) {
        return;
      }

      const separator = trimmed.includes(';') ? ';' : ',';
      const parts = trimmed.split(separator).map(s => s.trim());

      if (parts.length < 5) {
        errorCount++;
        return;
      }

      const orderNumber = parts[0];
      const orderNumber2 = parts[1];
      let activityType = parts[2]?.toUpperCase();
      if (!['CARICO', 'SCARICO', 'RESO', 'CONTAINER'].includes(activityType)) {
        activityType = 'CARICO';
      }
      const palletPlaces = Number(parts[3]) || 24;
      const grossWeight = Number(parts[4]) || 1000;
      const subjectName = parts[5] || 'Importato';
      const city = parts[6] || 'N/D';
      const cap = parts[7] || '';
      const province = parts[8] || 'N/D';
      const expectedDate = parts[9] || new Date().toISOString().split('T')[0];
      const expectedTime = parts[10] || '';
      const goodsType = parts[11] || '';
      const address = parts[12] || '';
      const region = parts[13] || '';
      const country = parts[14] || 'Italia';
      const deliveryNotes = parts[15] || '';
      const internalNotes = parts[16] || '';

      const realOriginName = parts[17] || (activityType === 'SCARICO' ? 'Provenienza Esterna' : 'Milano Logistics Plant');
      const realOriginAddress = parts[18] || '';
      const realOriginCity = parts[19] || '';
      const realOriginCap = parts[20] || '';
      const realOriginProvince = parts[21] || '';
      const realOriginCountry = parts[22] || 'Italia';

      const realDestinationName = parts[23] || (activityType === 'CARICO' ? 'Destinatario Esterno' : 'Milano Logistics Plant');
      const realDestinationAddress = parts[24] || '';
      const realDestinationCity = parts[25] || '';
      const realDestinationCap = parts[26] || '';
      const realDestinationProvince = parts[27] || '';
      const realDestinationCountry = parts[28] || 'Italia';

      let hubOrigineOperativo = parts[29] || '';
      let hubDestinazioneOperativo = parts[30] || '';
      let tipoOperazioneHub = parts[31]?.toUpperCase() || '';
      let finalInternalNotes = internalNotes;
      let routingStatus: 'CONFERMATO' | 'DA_CONFERMARE' = 'CONFERMATO';
      let routingNotes = 'Instradamento confermato';

      if (!hubOrigineOperativo || !hubDestinazioneOperativo || !tipoOperazioneHub) {
        const routing = calculateSmartRouting(
          {
            city: realOriginCity,
            cap: realOriginCap,
            province: realOriginProvince,
            name: realOriginName
          },
          {
            city: realDestinationCity,
            cap: realDestinationCap,
            province: realDestinationProvince,
            name: realDestinationName
          },
          activityType as any,
          defaultClient,
          depots,
          clients
        );

        if (!hubOrigineOperativo) hubOrigineOperativo = routing.hubOrigineOperativo;
        if (!hubDestinazioneOperativo) hubDestinazioneOperativo = routing.hubDestinazioneOperativo;
        if (!tipoOperazioneHub) tipoOperazioneHub = routing.tipoOperazioneHub;
        
        routingStatus = routing.isAmbiguous ? 'DA_CONFERMARE' : 'CONFERMATO';
        routingNotes = routing.routingNotes;

        if (routing.isAmbiguous) {
          finalInternalNotes = finalInternalNotes 
            ? `${finalInternalNotes} | ⚠️ Hub ambiguo - verificare instradamento manuale`
            : `⚠️ Hub ambiguo - verificare instradamento manuale`;
        }
      } else {
        // Se fornito esplicitamente, lo consideriamo confermato
        routingStatus = 'CONFERMATO';
        routingNotes = 'Inserito manualmente / Da file';
      }

      addShipment({
        clientId: defaultClient,
        carrierId: defaultCarrier,
        depotId: selectedDepotId,
        orderNumber,
        orderNumber2: orderNumber2 || undefined,
        activityType: activityType as any,
        palletPlaces,
        expectedDate,
        expectedTime: expectedTime || undefined,
        originOrDestination: city,
        goodsType: goodsType || undefined,
        expectedDeliveryDate: expectedDate,
        subjectName,
        address,
        city,
        cap,
        province,
        region,
        country,
        grossWeight,
        deliveryNotes,
        internalNotes: finalInternalNotes,
        realOriginName,
        realOriginAddress,
        realOriginCity,
        realOriginCap,
        realOriginProvince,
        realOriginCountry,
        realDestinationName,
        realDestinationAddress,
        realDestinationCity,
        realDestinationCap,
        realDestinationProvince,
        realDestinationCountry,
        hubOrigineOperativo,
        hubDestinazioneOperativo,
        tipoOperazioneHub: tipoOperazioneHub as any,
        routingStatus,
        routingNotes
      });
      successCount++;
    });

    if (successCount > 0) {
      setImportSuccess(`Importate con successo ${successCount} spedizioni! (${errorCount} righe errate saltate)`);
      setImportText('');
      setImportError('');
      setTimeout(() => {
        setIsImportShipmentModalOpen(false);
        setImportSuccess('');
      }, 2000);
    } else {
      setImportError('Nessuna riga valida trovata. Controlla il formato.');
    }
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

  // --- CALCOLO DEI KPI E DELLE STATISTICHE ---
  const calculateKpis = () => {
    const depotBookings = bookings.filter(b => b.depotId === selectedDepotId);
    
    const filterByTimeRange = (bDate: string) => {
      if (kpiTimeRange === 'oggi') {
        return bDate === scheduleDate;
      } else if (kpiTimeRange === '7g') {
        const d = new Date(scheduleDate);
        const b = new Date(bDate);
        const diff = (d.getTime() - b.getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      } else {
        const d = new Date(scheduleDate);
        const b = new Date(bDate);
        const diff = (d.getTime() - b.getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 30;
      }
    };

    const periodBookings = depotBookings.filter(b => filterByTimeRange(b.date));

    // Tempi di attesa ed efficienza
    let tatSum = 0;
    let tatCount = 0;
    let waitSum = 0;
    let waitCount = 0;
    let dwellSum = 0;
    let dwellCount = 0;
    let depDelaySum = 0;
    let depDelayCount = 0;
    let otifOnTime = 0;
    let otifTotal = 0;
    let lateCount = 0;

    periodBookings.forEach(b => {
      const matchedShip = shipments.find(s => s.bookingId === b.id);
      const slotTimeStr = matchedShip?.expectedTime || '09:00';
      
      if (b.timeInGate && b.timeOutGate) {
        const diff = (new Date(b.timeOutGate).getTime() - new Date(b.timeInGate).getTime()) / 60000;
        if (diff > 0) {
          tatSum += diff;
          tatCount++;
        }
      }

      if (b.timeInGate && b.timeInBay) {
        const diff = (new Date(b.timeInBay).getTime() - new Date(b.timeInGate).getTime()) / 60000;
        if (diff > 0) {
          waitSum += diff;
          waitCount++;
        }
      }

      if (b.timeInBay && b.timeOutBay) {
        const diff = (new Date(b.timeOutBay).getTime() - new Date(b.timeInBay).getTime()) / 60000;
        if (diff > 0) {
          dwellSum += diff;
          dwellCount++;
        }
      }

      if (b.timeInGate) {
        otifTotal++;
        const [slotH, slotM] = slotTimeStr.split(':').map(Number);
        const actualArrival = new Date(b.timeInGate);
        const slotDate = new Date(b.date);
        slotDate.setHours(slotH || 9, slotM || 0, 0, 0);

        const latenessMinutes = (actualArrival.getTime() - slotDate.getTime()) / 60000;
        if (latenessMinutes <= 15) {
          otifOnTime++;
        } else {
          lateCount++;
        }
      }

      if (b.timeOutGate) {
        const [slotH, slotM] = slotTimeStr.split(':').map(Number);
        const slotDate = new Date(b.date);
        slotDate.setHours(slotH || 9, slotM || 0, 0, 0);
        const expectedExit = slotDate.getTime() + (60 * 60000);
        const actualExit = new Date(b.timeOutGate).getTime();
        const delay = (actualExit - expectedExit) / 60000;
        if (delay > 0) {
          depDelaySum += delay;
          depDelayCount++;
        }
      }
    });

    const avgTat = tatCount > 0 ? Math.round(tatSum / tatCount) : 0;
    const avgWait = waitCount > 0 ? Math.round(waitSum / waitCount) : 0;
    const avgDwell = dwellCount > 0 ? Math.round(dwellSum / dwellCount) : 0;
    const avgDepDelay = depDelayCount > 0 ? Math.round(depDelaySum / depDelayCount) : 0;
    const otifRate = otifTotal > 0 ? Math.round((otifOnTime / otifTotal) * 100) : 100;
    const lateRate = otifTotal > 0 ? Math.round((lateCount / otifTotal) * 100) : 0;

    const inboundBookings = periodBookings.filter(b => ['SCARICO', 'RESO'].includes(b.activityType));
    const outboundBookings = periodBookings.filter(b => ['CARICO', 'CONTAINER'].includes(b.activityType));
    const inboundPallets = inboundBookings.reduce((sum, b) => sum + (b.palletPlaces || 0), 0);
    const outboundPallets = outboundBookings.reduce((sum, b) => sum + (b.palletPlaces || 0), 0);

    const depotShipments = shipments.filter(s => s.depotId === selectedDepotId);
    const assignedCount = depotShipments.filter(s => s.bookingId).length;
    const unassignedCount = depotShipments.filter(s => !s.bookingId).length;
    const totalShipments = depotShipments.length;
    const assignedRatio = totalShipments > 0 ? Math.round((assignedCount / totalShipments) * 100) : 100;
    const unassignedRatio = totalShipments > 0 ? Math.round((unassignedCount / totalShipments) * 100) : 0;

    const depotBays = bays.filter(b => b.depotId === selectedDepotId);
    const bayOccupancy = depotBays.map(bay => {
      let occupiedMinutes = 0;
      periodBookings.filter(b => b.bayId === bay.id).forEach(b => {
        if (b.timeInBay && b.timeOutBay) {
          const m = (new Date(b.timeOutBay).getTime() - new Date(b.timeInBay).getTime()) / 60000;
          if (m > 0) occupiedMinutes += m;
        } else if (b.timeInBay && b.status === 'IN_BAIA') {
          const m = (new Date().getTime() - new Date(b.timeInBay).getTime()) / 60000;
          if (m > 0) occupiedMinutes += m;
        }
      });
      const totalOperativeMinutes = 480;
      const rate = Math.min(100, Math.round((occupiedMinutes / totalOperativeMinutes) * 100));
      return {
        bayId: bay.id,
        bayName: bay.name,
        occupiedMinutes,
        rate
      };
    });

    const avgDockUtilization = bayOccupancy.length > 0
      ? Math.round(bayOccupancy.reduce((sum, b) => sum + b.rate, 0) / bayOccupancy.length)
      : 0;

    if (kpiDataSource === 'simulati') {
      const seed = selectedDepotId === 'depot-milano' ? 1.0 : selectedDepotId === 'depot-roma' ? 0.85 : 0.72;
      return {
        tat: Math.round(48 * seed),
        waitTime: Math.round(18 * seed),
        dwellTime: Math.round(30 * seed),
        otif: Math.round(92 - (seed * 8)),
        lateRate: Math.round(8 + (seed * 5)),
        departureDelay: Math.round(12 * seed),
        throughput: {
          inboundCount: Math.round(24 * seed),
          inboundPallets: Math.round(480 * seed),
          outboundCount: Math.round(18 * seed),
          outboundPallets: Math.round(360 * seed)
        },
        ratios: {
          assigned: Math.round(85 * seed),
          unassigned: Math.round(100 - (85 * seed))
        },
        bayOccupancy: depotBays.map((bay, idx) => ({
          bayId: bay.id,
          bayName: bay.name,
          rate: Math.round(Math.min(95, (60 + (idx * 8)) * seed))
        })),
        avgDockUtilization: Math.round(68 * seed)
      };
    }

    return {
      tat: avgTat,
      waitTime: avgWait,
      dwellTime: avgDwell,
      otif: otifRate,
      lateRate: lateRate,
      departureDelay: avgDepDelay,
      throughput: {
        inboundCount: inboundBookings.length,
        inboundPallets,
        outboundCount: outboundBookings.length,
        outboundPallets
      },
      ratios: {
        assigned: assignedRatio,
        unassigned: unassignedRatio
      },
      bayOccupancy: bayOccupancy.map(bo => ({
        bayId: bo.bayId,
        bayName: bo.bayName,
        rate: bo.rate
      })),
      avgDockUtilization: avgDockUtilization
    };
  };

  const kpis = calculateKpis();

  return (
    <div className="space-y-6 relative font-sans">
      
      {/* AREA DI STAMPA GENERICA */}
      {printBooking && (
        <div id="printable-area" className="hidden print:block p-8 bg-white text-black font-sans text-xs space-y-6">
          {printType === 'voucher' ? (
            /* --- LAYOUT STAMPA BUONO PALLET --- */
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-black pb-4">
                <div>
                  <div className="text-lg font-black uppercase tracking-wider">Logistica Uno Europe</div>
                  <p className="text-[10px] font-mono">BUONO DI RICEVUTA RESO PALLET VUOTI</p>
                </div>
                <div className="border border-black p-2 font-mono text-center font-bold">
                  BUONO N: {printBooking.palletVoucherNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><strong>Targa Trattore:</strong> {printBooking.licensePlate} {printBooking.licensePlateTrailer && `(Rimorchio: ${printBooking.licensePlateTrailer})`}</div>
                <div><strong>Autista:</strong> {printBooking.driverName}</div>
                <div><strong>Vettore:</strong> {carriers.find(c => c.id === printBooking.carrierId)?.name || 'N/D'}</div>
                <div><strong>Data Emissione:</strong> {new Date().toLocaleDateString('it-IT')} {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>Ticket Viaggio:</strong> {printBooking.ticketNumber || printBooking.id}</div>
                <div><strong>Rif. Carico/Scarico:</strong> {printBooking.orderNumber} {printBooking.orderNumber2 && ` / ${printBooking.orderNumber2}`}</div>
              </div>

              <div className="border border-black rounded p-3 space-y-2">
                <h2 className="font-bold border-b border-black pb-1 uppercase tracking-wide">Dettagli Pallet Vuoti Consegnati</h2>
                <table className="w-full text-left border-collapse text-[10px] font-mono">
                  <thead>
                    <tr className="border-b border-black text-gray-500">
                      <th className="py-1">Tipologia Legno</th>
                      <th className="py-1 text-center">Quantità Resa</th>
                      <th className="py-1 text-right">Stato / Condizione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {printBooking.palletReturns?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-1.5 font-bold">{item.palletType}</td>
                        <td className="py-1.5 text-center font-bold">{item.quantity} PL</td>
                        <td className="py-1.5 text-right uppercase font-bold">{item.condition === 'BUONO' ? 'BUONO / CONFORME' : 'ROTTO'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[9px] text-gray-600 font-sans italic">
                * Il presente buono attesta la sola quantità e tipologia di pallet vuoti lasciati a magazzino dall'autista ed ha valore di ricevuta.
              </p>

              <div className="pt-12 grid grid-cols-2 gap-8 text-center font-mono">
                <div>
                  <div className="border-b border-black h-12" />
                  <p className="mt-1 text-[10px]">Firma Conducente / Autore Reso</p>
                </div>
                <div>
                  <div className="border-b border-black h-12" />
                  <p className="mt-1 text-[10px]">Firma Operatore / Guardiola Ricevente</p>
                </div>
              </div>
              
              <div className="text-center pt-8 font-mono text-[8px] text-gray-500">
                Logistica Uno SpA - Yard Control Systems - Documento Generato Automaticamente
              </div>
            </div>
          ) : (
            /* --- LAYOUT STAMPA QUALITY ASSURANCE REPORT (Esistente) --- */
            printBooking.checklist && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-black pb-4">
                  <div>
                    <div className="text-lg font-black uppercase tracking-wider">Logistica Uno Europe</div>
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
            )
          )}
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

        {/* Banner di risoluzione rapida per instradamenti ambigui */}
        {ambiguousShipments.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide">Spedizioni con instradamento ambiguo</h4>
                <p className="text-[10.5px] text-amber-700 font-sans mt-0.5">
                  Rilevate <strong>{ambiguousShipments.length}</strong> spedizioni con ambivalenza geografica sull'hub (es. Oppeano 1 vs Oppeano 2). È richiesta la conferma o l'instradamento manuale dell'operatore per sbloccarle nello Yard Board.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="warning"
              onClick={() => {
                setSelectedResolutionIds([]);
                setIsQuickResolutionModalOpen(true);
              }}
              className="w-full md:w-auto font-bold uppercase tracking-wide text-xs cursor-pointer shadow-sm"
            >
              Risolvi Ora ({ambiguousShipments.length})
            </Button>
          </div>
        )}

        {/* Layout responsive: Barra di Navigazione a sinistra, Contenuto a destra */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* Menu Laterale Guardiola */}
          <div className="lg:col-span-1 space-y-2 bg-gray-50 border border-black/5 p-3.5 rounded-xl font-mono text-xs shadow-2xs">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-3 px-2">// MENU GUARDIOLA</div>
            
            <button
              onClick={() => setGuardiolaView('station')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === 'station'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">🚂 Yard Board</span>
              <Badge variant={guardiolaView === 'station' ? 'info' : 'primary'}>
                {shipments.filter(s => s.depotId === selectedDepotId && s.status !== 'COMPLETATO').length}
              </Badge>
            </button>

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

            {currentRole !== 'PREPOSTO' && (
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
            )}

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

            <button
              onClick={() => setGuardiolaView('shipments' as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === ('shipments' as any)
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">🚢 Gestione Spedizioni</span>
              <Badge variant={guardiolaView === ('shipments' as any) ? 'info' : 'primary'}>
                {shipments.filter(s => s.depotId === selectedDepotId).length}
              </Badge>
            </button>

            <button
              onClick={() => setGuardiolaView('kpis' as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer border ${
                guardiolaView === ('kpis' as any)
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-black border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">📊 Statistiche & KPI</span>
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
            
            {/* VISTA: TABELLONE YARD BOARD */}
            {guardiolaView === 'station' && (
              <div className="space-y-6 animate-fade-in">
                {/* Board Layout (Grafica Standard) */}
                <Card
                  title={`YARD BOARD ARRIVI E PARTENZE - Plant: ${activeDepot?.name}`}
                  accent="orange"
                  headerAction={
                    <div className="flex gap-2 font-mono">
                      <button
                        onClick={() => setStationSubTab('arrivi')}
                        className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                          stationSubTab === 'arrivi'
                            ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                            : 'bg-transparent text-gray-500 border-black/10 hover:text-black hover:bg-white/20'
                        }`}
                      >
                        🛬 Arrivi / Accettazione ({shipments.filter(s => (s.hubOrigineOperativo === selectedDepotId && (s.tipoOperazioneHub === 'INBOUND' || s.tipoOperazioneHub === 'TRANSITO')) || (!s.hubOrigineOperativo && s.depotId === selectedDepotId && s.activityType !== 'CARICO')).length})
                      </button>
                      <button
                        onClick={() => setStationSubTab('partenze')}
                        className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                          stationSubTab === 'partenze'
                            ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                            : 'bg-transparent text-gray-500 border-black/10 hover:text-black hover:bg-white/20'
                        }`}
                      >
                        🛫 Partenze / Spedizioni ({shipments.filter(s => (s.hubDestinazioneOperativo === selectedDepotId && (s.tipoOperazioneHub === 'OUTBOUND' || s.tipoOperazioneHub === 'TRANSITO')) || (!s.hubDestinazioneOperativo && s.depotId === selectedDepotId && s.activityType === 'CARICO')).length})
                      </button>
                    </div>
                  }
                >
                  {stationSubTab === 'arrivi' ? (
                    <Table
                      data={shipments
                        .filter(s => (s.hubOrigineOperativo === selectedDepotId && (s.tipoOperazioneHub === 'INBOUND' || s.tipoOperazioneHub === 'TRANSITO')) || (!s.hubOrigineOperativo && s.depotId === selectedDepotId && s.activityType !== 'CARICO'))
                        .sort((a, b) => {
                          const dateComp = (a.expectedDate || '').localeCompare(b.expectedDate || '');
                          if (dateComp !== 0) return dateComp;
                          return (a.expectedTime || '').localeCompare(b.expectedTime || '');
                        })}
                      emptyMessage="Nessun arrivo in tabella per questo stabilimento."
                      columns={[
                        {
                          header: 'Ora Slot',
                          accessor: (s) => <span className="font-bold text-xs font-mono text-ticket-accent">{s.expectedTime || '--:--'}</span>
                        },
                        {
                          header: 'Cliente Committente',
                          accessor: (s) => {
                            const clientName = bayUsages.find(c => c.id === s.clientId)?.name || 'Generico';
                            const carrierName = carriers.find(c => c.id === s.carrierId)?.name || 'Vettore';
                            return (
                              <div className="text-xs font-sans">
                                <span className="font-bold block text-gray-800">{clientName}</span>
                                <span className="text-[10px] text-gray-400 block">{carrierName}</span>
                              </div>
                            );
                          }
                        },
                        {
                          header: 'Riferimenti',
                          accessor: (s) => (
                            <div className="text-xs font-mono">
                              <span className="font-bold block text-gray-800">{s.orderNumber}</span>
                              {s.orderNumber2 && <span className="text-[10px] text-gray-400 block">Ref 2: {s.orderNumber2}</span>}
                            </div>
                          )
                        },
                        {
                          header: 'Provenienza',
                          accessor: (s) => <span className="text-xs font-sans text-gray-600">{s.originOrDestination || '-'}</span>
                        },
                        {
                          header: 'Merce',
                          accessor: (s) => <span className="text-xs font-sans text-gray-600">{s.goodsType || '-'}</span>
                        },
                        {
                          header: 'PLT',
                          accessor: (s) => <span className="font-bold text-xs font-mono text-gray-700">{s.palletPlaces} PL</span>
                        },
                        {
                          header: 'Targa',
                          accessor: (s) => {
                            const booking = s.bookingId ? bookings.find(b => b.id === s.bookingId) : null;
                            return <span className="text-xs font-mono text-gray-800">{s.licensePlate || booking?.licensePlate || '-'}</span>;
                          }
                        },
                        {
                          header: 'Stato Viaggio',
                          accessor: (s) => {
                            const booking = s.bookingId ? bookings.find(b => b.id === s.bookingId) : null;
                            const isAssigned = !!s.bookingId;
                            return isAssigned ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <Badge variant="success">🔗 {booking?.ticketNumber || 'Abbinato'}</Badge>
                                {booking?.status && <span className="text-[8px] text-gray-400 font-mono uppercase">({booking.status.replace('_', ' ')})</span>}
                              </div>
                            ) : (
                              <Badge variant="warning">📭 Da abbinare</Badge>
                            );
                          }
                        }
                      ]}
                    />
                  ) : (
                    <Table
                      data={shipments
                        .filter(s => (s.hubDestinazioneOperativo === selectedDepotId && (s.tipoOperazioneHub === 'OUTBOUND' || s.tipoOperazioneHub === 'TRANSITO')) || (!s.hubDestinazioneOperativo && s.depotId === selectedDepotId && s.activityType === 'CARICO'))
                        .sort((a, b) => {
                          const dateComp = (a.expectedDate || '').localeCompare(b.expectedDate || '');
                          if (dateComp !== 0) return dateComp;
                          return (a.expectedTime || '').localeCompare(b.expectedTime || '');
                        })}
                      emptyMessage="Nessuna spedizione in tabella per questo stabilimento."
                      columns={[
                        {
                          header: 'Ora Slot',
                          accessor: (s) => <span className="font-bold text-xs font-mono text-ticket-accent">{s.expectedTime || '--:--'}</span>
                        },
                        {
                          header: 'Cliente Committente',
                          accessor: (s) => {
                            const clientName = bayUsages.find(c => c.id === s.clientId)?.name || 'Generico';
                            const carrierName = carriers.find(c => c.id === s.carrierId)?.name || 'Vettore';
                            return (
                              <div className="text-xs font-sans">
                                <span className="font-bold block text-gray-800">{clientName}</span>
                                <span className="text-[10px] text-gray-400 block">{carrierName}</span>
                              </div>
                            );
                          }
                        },
                        {
                          header: 'Riferimenti',
                          accessor: (s) => (
                            <div className="text-xs font-mono">
                              <span className="font-bold block text-gray-800">{s.orderNumber}</span>
                              {s.orderNumber2 && <span className="text-[10px] text-gray-400 block">Ref 2: {s.orderNumber2}</span>}
                            </div>
                          )
                        },
                        {
                          header: 'Destinazione',
                          accessor: (s) => <span className="text-xs font-sans text-gray-600">{s.originOrDestination || '-'}</span>
                        },
                        {
                          header: 'Merce',
                          accessor: (s) => <span className="text-xs font-sans text-gray-600">{s.goodsType || '-'}</span>
                        },
                        {
                          header: 'PLT',
                          accessor: (s) => <span className="font-bold text-xs font-mono text-gray-700">{s.palletPlaces} PL</span>
                        },
                        {
                          header: 'Targa',
                          accessor: (s) => {
                            const booking = s.bookingId ? bookings.find(b => b.id === s.bookingId) : null;
                            return <span className="text-xs font-mono text-gray-800">{s.licensePlate || booking?.licensePlate || '-'}</span>;
                          }
                        },
                        {
                          header: 'Stato Viaggio',
                          accessor: (s) => {
                            const booking = s.bookingId ? bookings.find(b => b.id === s.bookingId) : null;
                            const isAssigned = !!s.bookingId;
                            return isAssigned ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <Badge variant="success">🔗 {booking?.ticketNumber || 'Abbinato'}</Badge>
                                {booking?.status && <span className="text-[8px] text-gray-400 font-mono uppercase">({booking.status.replace('_', ' ')})</span>}
                              </div>
                            ) : (
                              <Badge variant="warning">📭 Da abbinare</Badge>
                            );
                          }
                        }
                      ]}
                    />
                  )}
                </Card>
              </div>
            )}

            {/* AREA ASSOCIAZIONE POSTUMA - Solo nello Yard Board */}
            {guardiolaView === 'station' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Spedizioni da abbinare */}
                  <Card title="Spedizioni in attesa di abbinamento a camion fisici" accent="orange">
                    <div className="space-y-4 max-h-[350px] overflow-y-auto">
                      {shipments
                        .filter(s => s.depotId === selectedDepotId && !s.bookingId && s.status !== 'COMPLETATO' && s.routingStatus !== 'DA_CONFERMARE')
                        .map(s => {
                          const clientName = bayUsages.find(c => c.id === s.clientId)?.name || 'Generico';
                          const isLinking = activeLinkingShipmentId === s.id;
                          
                          // Filtra i mezzi attivi presenti in Yard
                          const activeYardVehicles = bookings.filter(b => b.depotId === selectedDepotId && b.status !== 'COMPLETATO');

                          return (
                            <div key={s.id} className="p-3 bg-gray-50 border border-black/5 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold font-mono text-ticket-accent text-xs block">{s.orderNumber}</span>
                                  {s.orderNumber2 && <span className="text-[10px] text-gray-400 block font-mono">Ref 2: {s.orderNumber2}</span>}
                                  <span className="text-[10px] font-sans text-gray-700 block mt-0.5">
                                    Cliente: <span className="font-bold">{clientName}</span> | {s.palletPlaces} PLT | {s.activityType}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                                  {s.expectedTime ? `${s.expectedDate} [${s.expectedTime}]` : s.expectedDate}
                                </span>
                              </div>

                              {isLinking ? (
                                <div className="p-2 bg-white border border-amber-500/30 rounded-lg space-y-2 font-sans">
                                  <label className="block text-[9px] font-mono uppercase text-gray-500">Seleziona Veicolo in Yard:</label>
                                  <select
                                    value={linkingBookingId}
                                    onChange={(e) => setLinkingBookingId(e.target.value)}
                                    className="w-full bg-gray-50 border p-1 rounded font-mono text-xs focus:outline-none"
                                  >
                                    <option value="">Seleziona...</option>
                                    {activeYardVehicles.map(b => (
                                      <option key={b.id} value={b.id}>
                                        {b.ticketNumber} | Targa: {b.licensePlate} ({b.driverName})
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="secondary" onClick={() => { setActiveLinkingShipmentId(null); setLinkingBookingId(''); }}>
                                      Annulla
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="success"
                                      disabled={!linkingBookingId}
                                      onClick={() => {
                                        bindShipmentsToBooking([s.id], linkingBookingId);
                                        setActiveLinkingShipmentId(null);
                                        setLinkingBookingId('');
                                      }}
                                    >
                                      Conferma Abbina
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-end pt-1">
                                  <Button size="sm" variant="primary" className="text-[10px]" onClick={() => { setActiveLinkingShipmentId(s.id); setLinkingBookingId(''); }}>
                                    🔗 Collega a Veicolo
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {shipments.filter(s => s.depotId === selectedDepotId && !s.bookingId && s.status !== 'COMPLETATO').length === 0 && (
                        <div className="text-center py-6 text-gray-400 italic text-xs">
                          Nessuna spedizione orfana in attesa.
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Spedizioni associate attive */}
                  <Card title="Spedizioni già associate ai viaggi in corso" accent="green">
                    <div className="space-y-4 max-h-[350px] overflow-y-auto">
                      {shipments
                        .filter(s => s.depotId === selectedDepotId && s.bookingId && s.status !== 'COMPLETATO')
                        .map(s => {
                          const clientName = bayUsages.find(c => c.id === s.clientId)?.name || 'Generico';
                          const booking = bookings.find(b => b.id === s.bookingId);

                          return (
                            <div key={s.id} className="p-3 bg-white border border-emerald-100 rounded-xl space-y-2 shadow-xs">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold font-mono text-emerald-600 text-xs block">{s.orderNumber}</span>
                                  <span className="text-[10px] font-sans text-gray-700 block mt-0.5">
                                    Cliente: <span className="font-bold">{clientName}</span> | {s.palletPlaces} PLT | {s.activityType}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-400 block mt-1">
                                    Veicolo: <span className="font-bold text-ticket-accent">{booking?.ticketNumber || 'Sconosciuto'}</span> ({booking?.licensePlate})
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  className="text-[9px] py-1 px-2"
                                  onClick={() => unbindShipmentFromBooking(s.id)}
                                >
                                  Scollega
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      {shipments.filter(s => s.depotId === selectedDepotId && s.bookingId && s.status !== 'COMPLETATO').length === 0 && (
                        <div className="text-center py-6 text-gray-400 italic text-xs">
                          Nessuna spedizione associata attiva al momento.
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
            )}

            {/* VISTA: GESTIONE SPEDIZIONI GUARDIOLA */}
            {guardiolaView === ('shipments' as any) && (
              <div className="lg:col-span-3 space-y-6 animate-fade-in font-sans">
                
                {/* BARRA DELLE AZIONI PRINCIPALI (BOTTONI MANUALE & IMPORT E BATCH DELETE) */}
                <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-black/10 p-4 rounded-xl shadow-xs">
                  <div className="flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        resetShipmentForm();
                        setIsNewShipmentModalOpen(true);
                      }}
                      className="font-bold text-xs uppercase tracking-wide cursor-pointer"
                    >
                      ➕ Nuova Spedizione Manuale
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setIsImportShipmentModalOpen(true);
                      }}
                      className="font-bold text-xs uppercase tracking-wide cursor-pointer"
                    >
                      📥 Import Spedizioni (CSV/TXT)
                    </Button>
                  </div>

                  {/* AZIONI MASSIVE (Solo se ci sono elementi selezionati) */}
                  {selectedShipmentIds.length > 0 && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg animate-fade-in">
                      <span className="text-[10px] font-mono text-rose-700 font-bold">
                        {selectedShipmentIds.length} spedizion{selectedShipmentIds.length === 1 ? 'e' : 'i'} selezionat{selectedShipmentIds.length === 1 ? 'a' : 'e'}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Sei sicuro di voler eliminare permanentemente queste ${selectedShipmentIds.length} spedizioni?`)) {
                            deleteShipments(selectedShipmentIds);
                            setSelectedShipmentIds([]);
                          }
                        }}
                        className="py-1 text-[9px] uppercase font-bold"
                      >
                        🗑️ Elimina Selezionate
                      </Button>
                    </div>
                  )}
                </div>

                {/* BARRA FILTRI AVANZATI CON CARATTERE speciale & */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 border border-black/5 p-4 rounded-xl">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Cerca Riferimento (Es. ORD1&ORD2)
                    </label>
                    <input
                      type="text"
                      placeholder="Codice ordine o riferimento..."
                      value={filterReference}
                      onChange={(e) => setFilterReference(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Cerca Soggetto / Città / Tratta (Con &)
                    </label>
                    <input
                      type="text"
                      placeholder="Nome, comune o tratta..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Filtra per Provincia (Es. RM&LT)
                    </label>
                    <input
                      type="text"
                      placeholder="Sigla provincia (MI, RM, etc)..."
                      value={filterProvince}
                      onChange={(e) => setFilterProvince(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-0 focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                      Filtra per Nazione (Es. Italia&Francia)
                    </label>
                    <input
                      type="text"
                      placeholder="Stato di provenienza/consegna..."
                      value={filterCountry}
                      onChange={(e) => setFilterCountry(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                {/* TABELLA FULL-WIDTH DEI RISULTATI */}
                <Card
                  title="Viaggi e Spedizioni Daily Program"
                  headerAction={
                    <div className="flex gap-2 font-mono">
                      <button
                        onClick={() => setShipmentsFilterTab('all')}
                        className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                          shipmentsFilterTab === 'all'
                            ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                            : 'bg-transparent text-gray-500 border-black/10 hover:text-black'
                        }`}
                      >
                        Tutte ({shipments.filter(s => (s.depotId === selectedDepotId || s.hubOrigineOperativo === selectedDepotId || s.hubDestinazioneOperativo === selectedDepotId) && s.routingStatus !== 'DA_CONFERMARE').length})
                      </button>
                      <button
                        onClick={() => setShipmentsFilterTab('unbound')}
                        className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                          shipmentsFilterTab === 'unbound'
                            ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                            : 'bg-transparent text-gray-500 border-black/10 hover:text-black'
                        }`}
                      >
                        Da Associare ({shipments.filter(s => (s.depotId === selectedDepotId || s.hubOrigineOperativo === selectedDepotId || s.hubDestinazioneOperativo === selectedDepotId) && !s.bookingId && s.routingStatus !== 'DA_CONFERMARE').length})
                      </button>
                      <button
                        onClick={() => setShipmentsFilterTab('bound')}
                        className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                          shipmentsFilterTab === 'bound'
                            ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                            : 'bg-transparent text-gray-500 border-black/10 hover:text-black'
                        }`}
                      >
                        Già Associate ({shipments.filter(s => (s.depotId === selectedDepotId || s.hubOrigineOperativo === selectedDepotId || s.hubDestinazioneOperativo === selectedDepotId) && !!s.bookingId && s.routingStatus !== 'DA_CONFERMARE').length})
                      </button>
                    </div>
                  }
                >
                  <Table
                    data={shipments.filter(s => {
                      if (s.routingStatus === 'DA_CONFERMARE') return false;
                      if (s.depotId !== selectedDepotId && s.hubOrigineOperativo !== selectedDepotId && s.hubDestinazioneOperativo !== selectedDepotId) return false;

                      // Filtro Stato Associazione
                      if (shipmentsFilterTab === 'unbound' && s.bookingId) return false;
                      if (shipmentsFilterTab === 'bound' && !s.bookingId) return false;

                      // Riferimenti
                      if (filterReference.trim()) {
                        const query = filterReference.trim().toLowerCase();
                        const terms = query.split('&').map(t => t.trim()).filter(Boolean);
                        if (terms.length > 0) {
                          const matchesAny = terms.some(term => 
                            s.orderNumber.toLowerCase() === term || 
                            (s.orderNumber2 && s.orderNumber2.toLowerCase() === term)
                          );
                          if (!matchesAny) return false;
                        }
                      }

                      // Ricerca Libera
                      if (filterSearch.trim()) {
                        const query = filterSearch.trim().toLowerCase();
                        const terms = query.split('&').map(t => t.trim()).filter(Boolean);
                        if (terms.length > 0) {
                          const matchesAny = terms.some(term => {
                            const sName = (s.subjectName || '').toLowerCase();
                            const sCity = (s.city || '').toLowerCase();
                            const sProv = (s.province || '').toLowerCase();
                            const sCountry = (s.country || '').toLowerCase();
                            const sOriginDest = (s.originOrDestination || '').toLowerCase();
                            return sName.includes(term) || 
                                   sCity.includes(term) || 
                                   sProv.includes(term) || 
                                   sCountry.includes(term) ||
                                   sOriginDest.includes(term);
                          });
                          if (!matchesAny) return false;
                        }
                      }

                      // Provincia
                      if (filterProvince.trim()) {
                        const query = filterProvince.trim().toLowerCase();
                        const terms = query.split('&').map(t => t.trim()).filter(Boolean);
                        if (terms.length > 0) {
                          const matchesAny = terms.some(term => (s.province || '').toLowerCase() === term);
                          if (!matchesAny) return false;
                        }
                      }

                      // Nazione
                      if (filterCountry.trim()) {
                        const query = filterCountry.trim().toLowerCase();
                        const terms = query.split('&').map(t => t.trim()).filter(Boolean);
                        if (terms.length > 0) {
                          const matchesAny = terms.some(term => (s.country || '').toLowerCase() === term);
                          if (!matchesAny) return false;
                        }
                      }

                      return true;
                    })}
                    emptyMessage="Nessun viaggio commissionato corrisponde ai filtri impostati."
                    columns={[
                      {
                        header: (
                          <input
                            type="checkbox"
                            checked={
                              shipments.filter(s => s.depotId === selectedDepotId).length > 0 &&
                              selectedShipmentIds.length === shipments.filter(s => s.depotId === selectedDepotId).length
                            }
                            onChange={(e) => {
                              const deptShips = shipments.filter(s => s.depotId === selectedDepotId);
                              if (e.target.checked) {
                                setSelectedShipmentIds(deptShips.map(s => s.id));
                              } else {
                                setSelectedShipmentIds([]);
                              }
                            }}
                            className="rounded border-black/10 text-[#004B97] focus:ring-[#004B97] cursor-pointer"
                          />
                        ),
                        className: "w-10 text-center",
                        accessor: (s) => (
                          <input
                            type="checkbox"
                            checked={selectedShipmentIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedShipmentIds(prev => [...prev, s.id]);
                              } else {
                                setSelectedShipmentIds(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            className="rounded border-black/10 text-[#004B97] focus:ring-[#004B97] cursor-pointer"
                          />
                        )
                      },
                      {
                        header: 'Flusso',
                        accessor: (s) => (
                          <div className="space-y-1">
                            <Badge variant={['SCARICO', 'RESO'].includes(s.activityType) ? 'info' : 'success'}>
                              {['SCARICO', 'RESO'].includes(s.activityType) ? 'ARRIVO PLANT' : 'PARTENZA PLANT'}
                            </Badge>
                            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">{s.activityType}</span>
                          </div>
                        )
                      },
                      {
                        header: 'Riferimenti',
                        accessor: (s) => (
                          <div className="font-mono text-xs">
                            <span className="font-bold text-ticket-accent block">{s.orderNumber}</span>
                            {s.orderNumber2 && <span className="text-gray-400 text-[10px] block">Rif 2: {s.orderNumber2}</span>}
                            {s.deliveryNotes && (
                              <span className="inline-block mt-1 text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded max-w-[130px] truncate" title={s.deliveryNotes}>
                                📝 {s.deliveryNotes}
                              </span>
                            )}
                            {s.internalNotes && (
                              <span className="inline-block mt-1 text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded max-w-[130px] truncate" title={s.internalNotes}>
                                🔒 {s.internalNotes}
                              </span>
                            )}
                          </div>
                        )
                      },
                      {
                        header: 'Committente / Soggetto & Tratta',
                        accessor: (s) => {
                          const clientName = clients.find(c => c.id === s.clientId)?.name || 'Sconosciuto';
                          const carrierName = carriers.find(c => c.id === s.carrierId)?.name || 'Sconosciuto';
                          return (
                            <div className="text-xs font-sans space-y-0.5">
                              <div><span className="text-[9px] text-gray-400 font-mono">Client:</span> <span className="font-bold">{clientName}</span></div>
                              {s.subjectName && (
                                <div>
                                  <span className="text-[9px] text-gray-400 font-mono">Soggetto:</span> <span className="font-semibold text-ticket-accent">{s.subjectName}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-gray-500 font-semibold mt-1">
                                📍 {s.city || s.originOrDestination || 'N/D'} 
                                {s.province && ` (${s.province})`}
                                {s.country && ` - ${s.country}`}
                              </div>
                              {s.address && <div className="text-[9px] text-gray-400 italic">via {s.address}</div>}
                              <div className="text-gray-500 text-[9px] mt-1 italic">Vettore: {carrierName}</div>
                            </div>
                          );
                        }
                      },
                      {
                        header: 'Data / Ora Slot',
                        accessor: (s) => (
                          <div className="text-xs font-mono">
                            <span className="font-bold">{s.expectedDate}</span>
                            {s.expectedTime && <span className="block text-ticket-accent">[{s.expectedTime}]</span>}
                          </div>
                        )
                      },
                      {
                        header: 'Carico',
                        accessor: (s) => (
                          <div className="text-xs font-mono">
                            <span className="block font-bold">{s.palletPlaces} PLT</span>
                            {s.grossWeight !== undefined && <span className="block text-[10px] text-gray-500">{s.grossWeight} kg</span>}
                            {s.goodsType && <span className="block text-[9px] text-gray-400 truncate max-w-[100px]">{s.goodsType}</span>}
                          </div>
                        )
                      },
                      {
                        header: 'Viaggio',
                        accessor: (s) => {
                          if (s.bookingId) {
                            const booking = bookings.find(b => b.id === s.bookingId);
                            return (
                              <div className="text-xs font-mono">
                                <span className="font-bold text-emerald-600 block">{booking?.ticketNumber || 'Abbinato'}</span>
                                {s.licensePlate && <span className="text-gray-400 text-[10px] block">Targa: {s.licensePlate}</span>}
                              </div>
                            );
                          }
                          return <span className="text-gray-400 italic text-[10px] font-sans">Non Abbinato</span>;
                        }
                      },
                      {
                        header: 'Stato',
                        accessor: (s) => (
                          <Badge variant={s.status === 'COMPLETATO' ? 'success' : s.status === 'PIANIFICATO' ? 'info' : 'warning'}>
                            {s.status.replace('_', ' ')}
                          </Badge>
                        )
                      },
                      {
                        header: 'Azioni',
                        className: "w-28 text-center",
                        accessor: (s) => (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="secondary" onClick={() => handleEditShipmentClick(s)}>
                              Modifica
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => {
                              if (confirm('Sei sicuro di voler eliminare questa spedizione?')) {
                                deleteShipment(s.id);
                              }
                            }}>
                              Rimuovi
                            </Button>
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>
              </div>
            )}

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
                                {activeBooking.palletReturns && activeBooking.palletReturns.length > 0 && (
                                  <div className="text-[8px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded p-1 text-center mt-1 animate-pulse-glow">
                                    ⚠️ HA RESO PALLET VUOTI
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
                        <div className="text-xs max-w-[200px] flex flex-col gap-1 items-start">
                          <div className="flex gap-1.5 flex-wrap">
                            {b.palletPlaces && <Badge variant="primary">{b.palletPlaces} PL</Badge>}
                            {b.palletReturns && b.palletReturns.length > 0 && (
                              <span className="text-[8px] font-bold bg-amber-500 text-white border border-amber-600 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider animate-pulse-glow">
                                ⚠️ HA RESO PALLET VUOTI
                              </span>
                            )}
                          </div>
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
                        const isGuard = currentRole === 'GUARDIA' || currentRole === 'ADMIN' || currentRole === 'PREPOSTO';

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
                  <div className="space-y-4">
                    {/* BARRA DI RICERCA SMART CHECK-IN */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 max-w-xl mx-auto">
                      <div className="flex items-center gap-2 text-[#004B97] font-bold text-xs uppercase font-mono">
                        <span>🔍 Smart Check-In & Matching al Cancello</span>
                      </div>
                      <p className="text-[10px] text-blue-700 leading-relaxed">
                        Inserisci il <strong>Riferimento Ordine (1 o 2)</strong> o la <strong>Targa del Veicolo</strong> per trovare la spedizione pre-caricata ed eseguire l'abbinamento rapido.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Es. ORD-2026-9923 o AA123BB..."
                          value={smartSearchQuery}
                          onChange={(e) => handleSmartGateSearch(e.target.value)}
                          className="flex-grow bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-0 focus:outline-none placeholder-blue-300 text-blue-900 font-bold"
                        />
                        {smartSearchQuery && (
                          <button
                            type="button"
                            onClick={() => { setSmartSearchQuery(''); setMatchedShipmentForGate(null); }}
                            className="bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {matchedShipmentForGate && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-3 animate-fade-in text-xs">
                          <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                            <span>✅ Spedizione Corrispondente Trovata!</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-emerald-900 bg-white/50 p-2 rounded-md">
                            <div><strong>Rif Ordine 1:</strong> {matchedShipmentForGate.orderNumber}</div>
                            {matchedShipmentForGate.orderNumber2 && <div><strong>Rif Ordine 2:</strong> {matchedShipmentForGate.orderNumber2}</div>}
                            <div><strong>Tipo Flusso:</strong> {matchedShipmentForGate.activityType === 'CARICO' ? 'CARICO (Partenza)' : 'SCARICO (Arrivo)'}</div>
                            <div><strong>Posti Pallet:</strong> {matchedShipmentForGate.palletPlaces} PL</div>
                            <div><strong>Vettore:</strong> {carriers.find(c => c.id === matchedShipmentForGate.carrierId)?.name || matchedShipmentForGate.carrierId}</div>
                            <div><strong>Cliente:</strong> {clients.find(c => c.id === matchedShipmentForGate.clientId)?.name || matchedShipmentForGate.clientId}</div>
                            <div><strong>Partenza Reale:</strong> {matchedShipmentForGate.realOriginCity || '-'} ({matchedShipmentForGate.realOriginProvince || '-'})</div>
                            <div><strong>Destinazione Reale:</strong> {matchedShipmentForGate.realDestinationCity || '-'} ({matchedShipmentForGate.realDestinationProvince || '-'})</div>
                            <div><strong>Tipo Tratta Network:</strong> {matchedShipmentForGate.tipoOperazioneHub || '-'}</div>
                          </div>
                          
                          <div className="border-t border-emerald-200 pt-3 space-y-2">
                            <p className="text-[10px] text-emerald-800 font-bold">
                              Inserisci i dati dell'autista del mezzo presentato al cancello:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Autista *"
                                placeholder="Nome e Cognome Autore"
                                value={manualDriver}
                                onChange={(e) => setManualDriver(e.target.value)}
                                required
                              />
                              <Input
                                label="Telefono Autista"
                                placeholder="Es. 3331234567"
                                value={manualPhone}
                                onChange={(e) => setManualPhone(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Targa Rimorchio"
                                placeholder="Es. CC789DD"
                                value={manualPlateTrailer}
                                onChange={(e) => setManualPlateTrailer(e.target.value)}
                              />
                              <Input
                                label="Numero Patente"
                                placeholder="Es. U12345"
                                value={manualDriverLicense}
                                onChange={(e) => setManualDriverLicense(e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleConfirmSmartCheckIn}
                              disabled={!manualDriver}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono mt-2"
                            >
                              Conferma Check-in e Collega Spedizione
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!matchedShipmentForGate && (
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

                    {/* SMART CHECK-IN MATCHING SYSTEM */}
                    {manualOrderNumber && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                        {shipments.filter(s =>
                          s.depotId === selectedDepotId &&
                          !s.bookingId &&
                          s.status !== 'COMPLETATO' &&
                          (
                            (manualOrderNumber && s.orderNumber?.toUpperCase().includes(manualOrderNumber.toUpperCase())) ||
                            (manualOrderNumber && s.orderNumber2?.toUpperCase().includes(manualOrderNumber.toUpperCase())) ||
                            (manualPlate && s.licensePlate?.toUpperCase().replace(/\s+/g, '') === manualPlate.toUpperCase().replace(/\s+/g, ''))
                          )
                        ).length > 0 ? (
                          <>
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold uppercase tracking-wider font-mono">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              🎯 Spedizioni Abbinabili Trovate!
                            </div>
                            <p className="text-[9px] text-gray-500 font-sans">Seleziona le spedizioni previste a sistema per questo carico:</p>
                            <div className="space-y-1.5 font-mono text-[10px]">
                              {shipments.filter(s =>
                                s.depotId === selectedDepotId &&
                                !s.bookingId &&
                                s.status !== 'COMPLETATO' &&
                                (
                                  (manualOrderNumber && s.orderNumber?.toUpperCase().includes(manualOrderNumber.toUpperCase())) ||
                                  (manualOrderNumber && s.orderNumber2?.toUpperCase().includes(manualOrderNumber.toUpperCase())) ||
                                  (manualPlate && s.licensePlate?.toUpperCase().replace(/\s+/g, '') === manualPlate.toUpperCase().replace(/\s+/g, ''))
                                )
                              ).map(s => {
                                const clientName = bayUsages.find(u => u.id === s.clientId)?.name || 'Cliente';
                                const isChecked = selectedShipmentIdsForCheckIn.includes(s.id);
                                return (
                                  <label key={s.id} className="flex items-center gap-2 bg-white border p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all select-none border-black/5">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedShipmentIdsForCheckIn(prev => [...prev, s.id]);
                                        } else {
                                          setSelectedShipmentIdsForCheckIn(prev => prev.filter(id => id !== s.id));
                                        }
                                      }}
                                    />
                                    <div>
                                      <span className="font-bold text-ticket-accent">{s.orderNumber}</span>
                                      {s.orderNumber2 && <span className="text-gray-400"> (Ref 2: {s.orderNumber2})</span>}
                                      <span className="block text-[9px] text-gray-500">Cliente: {clientName} | {s.palletPlaces} PLT | {s.activityType}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[10px] font-sans">
                            <span className="text-xs">⚠️</span>
                            <div>
                              <span className="font-bold block">Nessun viaggio/spedizione pianificato trovato per '{manualOrderNumber}'</span>
                              <span className="text-rose-600 block mt-0.5">Il mezzo verrà registrato in Yard sul piazzale come transito generico. Potrà essere abbinato postumo nel tabellone.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                  </div>
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
                <Card title={`Programmazione Attività del Yard - Giorno: ${scheduleDate}`}>
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
                            {b.palletReturns && b.palletReturns.length > 0 && (
                              <span className="text-[7px] font-bold bg-amber-500 text-white border border-amber-600 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider animate-pulse-glow">
                                ⚠️ RESO PALLET
                              </span>
                            )}
                            {b.palletVoucherNumber && (
                              <span className="text-[7px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 py-0.5 rounded shadow-2xs select-none uppercase tracking-wider">
                                Buono: {b.palletVoucherNumber}
                              </span>
                            )}
                            {b.checklist && (
                              <button
                                onClick={() => handlePrintChecklist(b)}
                                className="text-[8px] font-bold uppercase tracking-wider text-[#11BCEC] hover:underline cursor-pointer"
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
                  // LOG ATTIVI DI ACCESSO AL YARD CHE RICHIEDONO VERIFICHE O DEROGHE
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

            {/* VISTA: STATISTICHE E KPI */}
            {guardiolaView === ('kpis' as any) && (
              <div className="lg:col-span-4 space-y-6 animate-fade-in font-sans">
                
                {/* Barra di Controllo Filtri */}
                <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-black/10 p-4 rounded-xl shadow-xs">
                  <div>
                    <h3 className="font-bold text-sm uppercase text-ticket-accent tracking-wide">
                      📊 Cruscotto Direzionale KPI & Performance
                    </h3>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                      Statistiche di efficienza piazzale, puntualità vettori e saturazione baie per {activeDepot?.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Filtro Periodo */}
                    <div className="flex rounded-lg bg-gray-100 p-0.5 border border-black/5 font-mono text-[9px]">
                      <button
                        onClick={() => setKpiTimeRange('oggi')}
                        className={`px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          kpiTimeRange === 'oggi' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        OGGI
                      </button>
                      <button
                        onClick={() => setKpiTimeRange('7g')}
                        className={`px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          kpiTimeRange === '7g' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        7 GIORNI
                      </button>
                      <button
                        onClick={() => setKpiTimeRange('30g')}
                        className={`px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          kpiTimeRange === '30g' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        30 GIORNI
                      </button>
                    </div>

                    {/* Filtro Sorgente Dati */}
                    <div className="flex rounded-lg bg-gray-100 p-0.5 border border-black/5 font-mono text-[9px]">
                      <button
                        onClick={() => setKpiDataSource('reali')}
                        className={`px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          kpiDataSource === 'reali' ? 'bg-[#004B97] text-white shadow-xs' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        DATI REALI
                      </button>
                      <button
                        onClick={() => setKpiDataSource('simulati')}
                        className={`px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          kpiDataSource === 'simulati' ? 'bg-[#004B97] text-white shadow-xs' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        DEMO SIMULATI
                      </button>
                    </div>
                  </div>
                </div>

                {/* GRIGLIA KPI PRINCIPALI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* KPI 1: Turnaround Time */}
                  <Card title="Avg Turnaround Time (TAT)" accent="orange">
                    <div className="flex flex-col items-center py-4 space-y-3">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="#f97316" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * Math.min(100, (kpis.tat / 90) * 100)) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                          <span className="text-2xl font-bold text-black">{kpis.tat}</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">MINUTI</span>
                        </div>
                      </div>
                      <div className="text-center font-mono text-[10px] text-gray-500 space-y-1">
                        <div>Tempo medio totale del mezzo nel plant</div>
                        <div className="text-orange-600 font-bold uppercase text-[9px]">Soglia Target: &lt; 60 min</div>
                      </div>
                    </div>
                  </Card>

                  {/* KPI 2: OTIF Carrier Performance */}
                  <Card title="Slot Adherence / OTIF" accent="green">
                    <div className="flex flex-col items-center py-4 space-y-3">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="#10b981" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * kpis.otif) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                          <span className="text-2xl font-bold text-black">{kpis.otif}%</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">PUNTUALE</span>
                        </div>
                      </div>
                      <div className="text-center font-mono text-[10px] text-gray-500 space-y-1">
                        <div>Vettori arrivati entro 15m dallo slot</div>
                        <div className="text-emerald-600 font-bold uppercase text-[9px]">Target: &gt; 90%</div>
                      </div>
                    </div>
                  </Card>

                  {/* KPI 3: Dock Utilization */}
                  <Card title="Avg Dock Utilization" accent="yellow">
                    <div className="flex flex-col items-center py-4 space-y-3">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="#3b82f6" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * kpis.avgDockUtilization) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                          <span className="text-2xl font-bold text-black">{kpis.avgDockUtilization}%</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">SATURATO</span>
                        </div>
                      </div>
                      <div className="text-center font-mono text-[10px] text-gray-500 space-y-1">
                        <div>Percentuale occupazione baie (8h)</div>
                        <div className="text-blue-600 font-bold uppercase text-[9px]">Ottimale: 60% - 80%</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* DETTAGLI DELLE MACRO-AREE IN GRIGLIA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* SINISTRA: TEMPI OPERATIVI E DI ATTESA */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card title="1. Dettaglio Efficienza Tempi (Operational & Wait)">
                      <div className="space-y-4 font-mono text-xs">
                        
                        {/* Yard Wait Time */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50 border border-black/5 rounded-xl">
                          <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500">
                            <span>Yard Wait Time (Attesa Piazzale)</span>
                            <span className="text-ticket-accent font-bold">{kpis.waitTime} Minuti</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (kpis.waitTime / 45) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-400 leading-normal">
                            Tempo intercorso tra il check-in in Guardiola e l'aggancio in baia. Obiettivo: ridurre al minimo per sbloccare la coda a piazzale.
                          </p>
                        </div>

                        {/* Dwell Time Loading/Unloading */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50 border border-black/5 rounded-xl">
                          <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500">
                            <span>Dwell Loading/Unloading Time (Carico/Scarico)</span>
                            <span className="text-ticket-accent font-bold">{kpis.dwellTime} Minuti</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (kpis.dwellTime / 60) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-400 leading-normal">
                            Tempo effettivo speso alla rampa di carico. Misura l'efficienza degli addetti interni alla movimentazione.
                          </p>
                        </div>

                        {/* Departure Delay */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50 border border-black/5 rounded-xl">
                          <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500">
                            <span>Departure Delay (Ritardo in Partenza)</span>
                            <span className="text-rose-600 font-bold">{kpis.departureDelay} Minuti</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-rose-400 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (kpis.departureDelay / 30) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-400 leading-normal">
                            Tempo accumulato oltre lo slot previsto per l'uscita, solitamente dovuto a ritardi documentali (DDT/Buoni).
                          </p>
                        </div>

                      </div>
                    </Card>

                    {/* Carrier Performance */}
                    <Card title="2. Affidabilità e Ritardi Vettori (Carrier Performance)">
                      <div className="space-y-4 font-mono text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl space-y-1">
                            <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">Tasso di Ritardo</span>
                            <div className="text-xl font-bold">{kpis.lateRate}%</div>
                            <span className="text-[8px] text-gray-400 block font-sans">Vettori fuori dallo slot concordato</span>
                          </div>
                          
                          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl space-y-1">
                            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block">Unassigned Ratio</span>
                            <div className="text-xl font-bold">{kpis.ratios.unassigned}%</div>
                            <span className="text-[8px] text-gray-400 block font-sans">Spedizioni orfane senza mezzo associato</span>
                          </div>
                        </div>

                        {/* Carrier list */}
                        <div className="space-y-2.5">
                          <div className="text-[9px] font-bold uppercase text-gray-400 tracking-wider border-b border-black/5 pb-1">Slot Adherence per Carrier</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span>Logistica Uno Europe</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: '94%' }} />
                                </div>
                                <span className="font-bold">94%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span>Freccia Rossa Trasporti</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                                </div>
                                <span className="font-bold">88%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span>Adriatica Cargo Srl</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: '75%' }} />
                                </div>
                                <span className="font-bold">75%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </div>

                  {/* DESTRA: UTILIZZO RISORSE E VOLUMI */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Throughput */}
                    <Card title="3. Throughput & Volumi Gestiti">
                      <div className="space-y-4 font-mono text-xs">
                        
                        {/* Inbound */}
                        <div className="p-3.5 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl space-y-2">
                          <div className="flex justify-between items-center font-bold text-[10px] uppercase">
                            <span>📥 Inbound (Entrata)</span>
                            <span className="font-bold">{kpis.throughput.inboundCount} Camion</span>
                          </div>
                          <div className="text-lg font-bold">{kpis.throughput.inboundPallets} PLT</div>
                          <span className="text-[8px] text-gray-400 block font-sans">Attività di Scarico e Ricezione Resi</span>
                        </div>

                        {/* Outbound */}
                        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl space-y-2">
                          <div className="flex justify-between items-center font-bold text-[10px] uppercase">
                            <span>📤 Outbound (Uscita)</span>
                            <span className="font-bold">{kpis.throughput.outboundCount} Camion</span>
                          </div>
                          <div className="text-lg font-bold">{kpis.throughput.outboundPallets} PLT</div>
                          <span className="text-[8px] text-gray-400 block font-sans">Attività di Carico e Containerizzazioni</span>
                        </div>

                      </div>
                    </Card>

                    {/* Dock Utilization */}
                    <Card title="4. Saturazione Baie (Dock Usage)">
                      <div className="space-y-3 font-mono text-xs">
                        <p className="text-[9px] text-gray-400 leading-normal border-b border-black/5 pb-2">
                          Tasso di saturazione su base 8 ore operative per singola baia dello stabilimento.
                        </p>
                        
                        <div className="space-y-3">
                          {kpis.bayOccupancy.map(bay => (
                            <div key={bay.bayId} className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="font-bold">{bay.bayName}</span>
                                <span className="font-bold text-ticket-accent">{bay.rate}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    bay.rate > 85 ? 'bg-rose-500' : bay.rate > 60 ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${bay.rate}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {kpis.bayOccupancy.length === 0 && (
                            <div className="text-center py-6 text-gray-400 italic text-xs">
                              Nessuna baia configurata in questo stabilimento.
                            </div>
                          )}
                        </div>

                      </div>
                    </Card>

                  </div>

                </div>

              </div>
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

              {/* SMART CHECK-IN MATCHING SYSTEM IN MODAL */}
              {checkInOrderNumber && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                  {shipments.filter(s =>
                    s.depotId === selectedDepotId &&
                    !s.bookingId &&
                    s.status !== 'COMPLETATO' &&
                    (
                      (checkInOrderNumber && s.orderNumber?.toUpperCase().includes(checkInOrderNumber.toUpperCase())) ||
                      (checkInOrderNumber && s.orderNumber2?.toUpperCase().includes(checkInOrderNumber.toUpperCase())) ||
                      (checkInBooking?.licensePlate && s.licensePlate?.toUpperCase().replace(/\s+/g, '') === checkInBooking.licensePlate.toUpperCase().replace(/\s+/g, ''))
                    )
                  ).length > 0 ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold uppercase tracking-wider font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        🎯 Spedizioni Abbinabili Trovate!
                      </div>
                      <p className="text-[9px] text-gray-500 font-sans">Seleziona le spedizioni previste a sistema per questo carico:</p>
                      <div className="space-y-1.5 font-mono text-[10px]">
                        {shipments.filter(s =>
                          s.depotId === selectedDepotId &&
                          !s.bookingId &&
                          s.status !== 'COMPLETATO' &&
                          (
                            (checkInOrderNumber && s.orderNumber?.toUpperCase().includes(checkInOrderNumber.toUpperCase())) ||
                            (checkInOrderNumber && s.orderNumber2?.toUpperCase().includes(checkInOrderNumber.toUpperCase())) ||
                            (checkInBooking?.licensePlate && s.licensePlate?.toUpperCase().replace(/\s+/g, '') === checkInBooking.licensePlate.toUpperCase().replace(/\s+/g, ''))
                          )
                        ).map(s => {
                          const clientName = bayUsages.find(u => u.id === s.clientId)?.name || 'Cliente';
                          const isChecked = selectedShipmentIdsForCheckIn.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 bg-white border p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all select-none border-black/5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedShipmentIdsForCheckIn(prev => [...prev, s.id]);
                                  } else {
                                    setSelectedShipmentIdsForCheckIn(prev => prev.filter(id => id !== s.id));
                                  }
                                }}
                              />
                              <div>
                                <span className="font-bold text-ticket-accent">{s.orderNumber}</span>
                                {s.orderNumber2 && <span className="text-gray-400"> (Ref 2: {s.orderNumber2})</span>}
                                <span className="block text-[9px] text-gray-500">Cliente: {clientName} | {s.palletPlaces} PLT | {s.activityType}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[10px] font-sans">
                      <span className="text-xs">⚠️</span>
                      <div>
                        <span className="font-bold block">Nessun viaggio/spedizione pianificato trovato per '{checkInOrderNumber}'</span>
                        <span className="text-rose-600 block mt-0.5">Il mezzo farà ingresso senza spedizioni collegate a sistema.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-black/5 pb-4 bg-gray-50/50 p-3 rounded-lg font-mono">
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
                  <span className="text-gray-400 block text-[9px] uppercase">Posti Pallet</span>
                  <span className="font-bold text-black text-xs block font-mono">
                    {activeBayDetail.booking.palletPlaces !== undefined ? `${activeBayDetail.booking.palletPlaces} PL` : 'N/D'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Cliente Committente</span>
                  <span className="font-bold text-gray-700 text-xs block truncate">
                    {bayUsages.find(u => u.id === activeBayDetail.booking.clientUsageId)?.name || 'Generico'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Attracco</span>
                  <span className="font-bold text-amber-600 text-xs block">
                    {formatTime(activeBayDetail.booking.timeInBay)}
                  </span>
                </div>
              </div>

              {/* BARRA DEI TAB INTERNI MODALE */}
              <div className="flex border-b border-black/10 font-mono text-[10px] mb-4 bg-gray-50/50 rounded-lg p-1">
                <button
                  onClick={() => { setModalTab('info'); setShowChecklistForm(false); }}
                  className={`flex-1 text-center py-2 font-bold rounded-md transition-all cursor-pointer ${
                    modalTab === 'info' ? 'bg-[#004B97] text-white shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  📋 Info & Note
                </button>
                <button
                  onClick={() => { setModalTab('checklist'); }}
                  className={`flex-1 text-center py-2 font-bold rounded-md transition-all cursor-pointer ${
                    modalTab === 'checklist' ? 'bg-[#004B97] text-white shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  🛡️ Checklist Qualità
                </button>
                <button
                  onClick={() => { setModalTab('reso'); setShowChecklistForm(false); }}
                  className={`flex-1 text-center py-2 font-bold rounded-md transition-all cursor-pointer ${
                    modalTab === 'reso' ? 'bg-[#004B97] text-white shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  📦 Reso Pallet
                </button>
                <button
                  onClick={() => { setModalTab('edit'); setShowChecklistForm(false); }}
                  className={`flex-1 text-center py-2 font-bold rounded-md transition-all cursor-pointer ${
                    modalTab === 'edit' ? 'bg-[#004B97] text-white shadow-2xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  ✏️ Modifica Dati
                </button>
                {(currentRole === 'GUARDIA' || currentRole === 'ADMIN' || currentRole === 'PREPOSTO') && (
                  <button
                    onClick={() => { setModalTab('move'); setShowChecklistForm(false); }}
                    className={`flex-1 text-center py-2 font-bold rounded-md transition-all cursor-pointer ${
                      modalTab === 'move' ? 'bg-[#004B97] text-white shadow-2xs' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    🔄 Sposta Baia
                  </button>
                )}
              </div>

              {/* VISTA: INFO & NOTE */}
              {modalTab === 'info' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#11BCEC] border-b border-black/5 pb-1">
                      Cronologia Note (Case History)
                    </h4>
                    
                    <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
                      <div className="max-h-[140px] overflow-y-auto">
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
                </div>
              )}

              {/* VISTA: CHECKLIST QUALITÀ */}
              {modalTab === 'checklist' && (
                <div className="space-y-4 animate-fade-in">
                  {!showChecklistForm ? (
                    <div className="space-y-4">
                      {activeBayDetail.booking.checklist ? (
                        <div className={`p-4 rounded-xl border flex justify-between items-start ${activeBayDetail.booking.checklist.isFailed ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                          <div className="space-y-2">
                            <span className="font-bold block text-[11px] uppercase font-mono">Checklist di Conformità Qualità</span>
                            <span className="text-[10px] block text-gray-500">Compilata da: {activeBayDetail.booking.checklist.compilataDa} il {new Date(activeBayDetail.booking.checklist.dataOraCheck).toLocaleString()}</span>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 font-mono text-[10px] bg-white/60 p-2.5 rounded-lg border border-black/5">
                              <div>Pianale Sporco: <span className="font-bold">{activeBayDetail.booking.checklist.pianaleSporco ? 'SI (⚠️)' : 'NO'}</span></div>
                              <div>Presenza Infestanti Mezzo: <span className="font-bold">{activeBayDetail.booking.checklist.presenzaInfestantiMezzo ? 'SI (⚠️)' : 'NO'}</span></div>
                              <div>Odori Anomali: <span className="font-bold">{activeBayDetail.booking.checklist.odoriAnomali ? 'SI (⚠️)' : 'NO'}</span></div>
                              <div>Pallet Puliti: <span className="font-bold">{activeBayDetail.booking.checklist.puliziaPallet ? 'SI' : 'NO (⚠️)'}</span></div>
                              <div>Pallet Integri: <span className="font-bold">{activeBayDetail.booking.checklist.integritaPallet ? 'SI' : 'NO (⚠️)'}</span></div>
                              <div>Presenza Infestanti Prodotto: <span className="font-bold">{activeBayDetail.booking.checklist.presenzaInfestantiProdotto ? 'SI (⚠️)' : 'NO'}</span></div>
                              <div>Prodotti biologici (Bio): <span className="font-bold">{activeBayDetail.booking.checklist.presenzaBio ? 'SI' : 'NO'}</span></div>
                              <div>Sigillo di Sicurezza: <span className="font-bold">{activeBayDetail.booking.checklist.sigilloPresente ? `Presente (${activeBayDetail.booking.checklist.numeroSigillo || 'N/A'})` : 'Assente'}</span></div>
                              {activeBayDetail.booking.checklist.sigilloPresente && (
                                <div className="col-span-2">Corrispondenza DDT Sigillo: <span className="font-bold">{activeBayDetail.booking.checklist.corrispondenzaDdt ? 'CONFORME' : 'NON CONFORME (⚠️)'}</span></div>
                              )}
                            </div>
                            {activeBayDetail.booking.checklist.noteLibere && (
                              <p className="text-[10px] text-gray-700 bg-white/40 p-2 rounded-lg border border-black/5 mt-2"><strong>Note Libere:</strong> {activeBayDetail.booking.checklist.noteLibere}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handlePrintChecklist(activeBayDetail.booking)}>
                              🖨️ Stampa QA
                            </Button>
                            {currentRole === 'PREPOSTO' && (
                              <Button size="sm" variant="primary" onClick={() => setShowChecklistForm(true)}>
                                Modifica
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        currentRole === 'PREPOSTO' ? (
                          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="text-[11px] font-bold uppercase font-mono">Checklist Qualità non compilata!</span>
                              <p className="text-[10px] text-amber-700/80 mt-0.5 font-sans">Compilare la checklist per procedere con le operazioni.</p>
                            </div>
                            <Button size="sm" variant="warning" onClick={() => setShowChecklistForm(true)}>
                              Compila Checklist ➔
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-xs font-mono text-gray-400 italic bg-gray-50 border border-black/5 rounded-xl">
                            // CHECKLIST QUALITÀ NON ANCORA COMPILATA DAL PREPOSTO DI MAGAZZINO
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    /* --- FORM COMPILAZIONE CHECKLIST QUALITÀ --- */
                    <div className="space-y-4">
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
              )}

              {/* VISTA: RESO PALLET VUOTI */}
              {modalTab === 'reso' && (
                <div className="space-y-4 animate-fade-in pt-1">
                  <div className="flex justify-between items-center border-b border-black/5 pb-1">
                    <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#11BCEC]">
                      Dichiarazione Pallet Vuoti Rilasciati a Magazzino
                    </h4>
                    {activeBayDetail.booking.palletVoucherNumber && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                        Buono Emesso: {activeBayDetail.booking.palletVoucherNumber}
                      </span>
                    )}
                  </div>

                  {/* Elenco dei resi inseriti */}
                  <div className="border border-black/10 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-[10px] font-mono">
                      <thead>
                        <tr className="bg-gray-50 border-b border-black/10 text-gray-400 text-[8px] uppercase">
                          <th className="p-2">Tipologia Legno</th>
                          <th className="p-2">Quantità Resa</th>
                          <th className="p-2">Stato/Condizione</th>
                          {(currentRole === 'PREPOSTO' || currentRole === 'ADMIN') && <th className="p-2 text-right">Azione</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {!activeBayDetail.booking.palletReturns || activeBayDetail.booking.palletReturns.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-400 italic">Nessun reso pallet registrato per questo viaggio.</td>
                          </tr>
                        ) : (
                          activeBayDetail.booking.palletReturns.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="p-2 font-bold text-black">{item.palletType}</td>
                              <td className="p-2 font-bold">{item.quantity} PL</td>
                              <td className="p-2">
                                <Badge variant={item.condition === 'BUONO' ? 'success' : 'danger'}>
                                  {item.condition === 'BUONO' ? 'Conforme / Buono' : 'Rotto'}
                                </Badge>
                              </td>
                              {(currentRole === 'PREPOSTO' || currentRole === 'ADMIN') && (
                                <td className="p-2 text-right">
                                  <button
                                    onClick={() => {
                                      removePalletReturn(activeBayDetail.booking.id, item.id);
                                      // Rinfresca il booking attivo nel modal
                                      setTimeout(() => {
                                        const refreshed = bookings.find(b => b.id === activeBayDetail.booking.id);
                                        if (refreshed) {
                                          setActiveBayDetail({ bay: activeBayDetail.bay, booking: refreshed });
                                        }
                                      }, 50);
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                                  >
                                    Elimina
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Form di inserimento (solo Preposto/Admin) */}
                  {(currentRole === 'PREPOSTO' || currentRole === 'ADMIN') && (
                    <div className="bg-gray-50/80 p-3 rounded-lg border border-black/5 space-y-3 font-sans">
                      <span className="block font-bold text-[9px] uppercase tracking-wider text-gray-400 font-mono">// REGISTRA NUOVA VOCE RESO</span>
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          label="Tipologia Legno *"
                          options={palletTypes.length > 0 ? palletTypes.map(p => ({ value: p.name, label: p.name })) : [
                            { value: 'EPAL', label: 'EPAL' },
                            { value: 'CHEP', label: 'CHEP' },
                            { value: 'DUSSELDORF', label: 'DUSSELDORF' },
                            { value: 'MINI-DUSS', label: 'MINI-DUSS' },
                            { value: 'ALTRO', label: 'ALTRO' }
                          ]}
                          value={palletType}
                          onChange={(e) => setPalletType(e.target.value as any)}
                        />
                        <Input
                          label="Quantità *"
                          type="number"
                          placeholder="Es. 15"
                          value={palletQuantity}
                          onChange={(e) => setPalletQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                        <Select
                          label="Stato Legno *"
                          options={[
                            { value: 'BUONO', label: 'BUONO / CONFORME' },
                            { value: 'ROTTO', label: 'ROTTO / DA RIPARARE' }
                          ]}
                          value={palletCondition}
                          onChange={(e) => setPalletCondition(e.target.value as any)}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!palletQuantity) return;
                          addPalletReturn(activeBayDetail.booking.id, palletType, Number(palletQuantity), palletCondition);
                          setPalletQuantity('');
                          // Rinfresca il booking attivo nel modal
                          setTimeout(() => {
                            const refreshed = bookings.find(b => b.id === activeBayDetail.booking.id);
                            if (refreshed) {
                              setActiveBayDetail({ bay: activeBayDetail.bay, booking: refreshed });
                            }
                          }, 50);
                        }}
                        disabled={!palletQuantity}
                        className="w-full"
                      >
                        Aggiungi Reso Pallet
                      </Button>
                    </div>
                  )}

                  {/* Azione emissione/stampa Buono Pallet (solo Guardiola/Admin) */}
                  {(currentRole === 'GUARDIA' || currentRole === 'ADMIN') && activeBayDetail.booking.palletReturns && activeBayDetail.booking.palletReturns.length > 0 && (
                    <div className="pt-3 border-t border-black/5 flex gap-2">
                      {!activeBayDetail.booking.palletVoucherNumber ? (
                        <Button
                          className="w-full text-xs font-bold"
                          variant="warning"
                          onClick={() => {
                            emitPalletVoucher(activeBayDetail.booking.id);
                            // Rinfresca il booking attivo nel modal
                            setTimeout(() => {
                              const refreshed = bookings.find(b => b.id === activeBayDetail.booking.id);
                              if (refreshed) {
                                setActiveBayDetail({ bay: activeBayDetail.bay, booking: refreshed });
                              }
                            }, 50);
                          }}
                        >
                          📄 Emetti Buono Pallet Ricevuta
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-xs font-bold"
                          variant="success"
                          onClick={() => {
                            setPrintType('voucher');
                            setPrintBooking(activeBayDetail.booking);
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                        >
                          🖨️ Stampa Ricevuta Buono Pallet
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VISTA: MODIFICA ANAGRAFICA */}
              {modalTab === 'edit' && (
                <div className="space-y-3 animate-fade-in pt-1">
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
              )}

              {/* VISTA: SPOSTAMENTO BAIA */}
              {modalTab === 'move' && (currentRole === 'GUARDIA' || currentRole === 'ADMIN' || currentRole === 'PREPOSTO') && (
                <div className="space-y-3 pt-1 animate-fade-in">
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
              )}            </div>

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

      {/* MODALE DI INSERIMENTO / MODIFICA SPEDIZIONE MANUALE */}
      {isNewShipmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in print:hidden overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-black/10 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {shipmentFormId ? "Modifica Spedizione Manuale" : "Nuova Spedizione Manuale"}
              </h3>
              <button 
                onClick={() => { resetShipmentForm(); setIsNewShipmentModalOpen(false); }}
                className="text-white hover:text-gray-200 font-bold text-lg cursor-pointer font-mono"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveShipmentForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* DISTINZIONE NETTA ARRIVO / PARTENZA */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                  Tipologia Flusso (Distinzione Arrivo/Partenza sul Plant)
                </label>
                <div className="flex rounded-xl bg-gray-100 p-1 border border-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShipmentFormType('SCARICO');
                    }}
                    className={`flex-grow py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      ['SCARICO', 'RESO'].includes(shipmentFormType)
                        ? 'bg-[#004B97] text-white shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    📥 Arrivo sul Plant (Accettazione / Scarico / Reso)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShipmentFormType('CARICO');
                    }}
                    className={`flex-grow py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      ['CARICO', 'CONTAINER'].includes(shipmentFormType)
                        ? 'bg-[#004B97] text-white shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    📤 Partenza dal Plant (Spedizione / Carico / Container)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Cliente Committente *"
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={clients.find(c => c.id === shipmentFormClient)?.name || (clients[0]?.name || '')}
                  onChange={(e) => {
                    const found = clients.find(c => c.name === e.target.value || c.id === e.target.value);
                    if (found) setShipmentFormClient(found.id);
                  }}
                  required
                />
                <Select
                  label="Vettore Assegnato *"
                  options={carriers.filter(c => c.status === 'APPROVATO').map(c => ({ value: c.id, label: c.name }))}
                  value={carriers.find(c => c.id === shipmentFormCarrier)?.name || (carriers.filter(c => c.status === 'APPROVATO')[0]?.name || '')}
                  onChange={(e) => {
                    const found = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                    if (found) setShipmentFormCarrier(found.id);
                  }}
                  required
                />
              </div>

              {/* SEZIONE 2: ANAGRAFICA ORIGINE REALE */}
              <div className="border-t border-black/5 pt-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 mb-2">Luogo di Carico Reale (Origine)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ragione Sociale Mittente *"
                    placeholder="Nome mittente"
                    value={shipmentFormRealOriginName}
                    onChange={(e) => setShipmentFormRealOriginName(e.target.value)}
                    required
                  />
                  <Input
                    label="Indirizzo Mittente"
                    placeholder="Via, civico"
                    value={shipmentFormRealOriginAddress}
                    onChange={(e) => setShipmentFormRealOriginAddress(e.target.value)}
                  />
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Località (Città) Mittente *</label>
                    <TerritoryAutocomplete
                      value={shipmentFormRealOriginCity}
                      onChange={(val: string, record: any) => {
                        setShipmentFormRealOriginCity(val);
                        if (record) {
                          setShipmentFormRealOriginCap(record.cap);
                          setShipmentFormRealOriginProvince(record.provincia_sigla);
                          setShipmentFormRealOriginCountry('Italia');
                        }
                      }}
                      placeholder="Milano, Torino..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="relative">
                    <Input
                      label="CAP Mittente"
                      placeholder="Es. 20100"
                      value={shipmentFormRealOriginCap}
                      onChange={(e) => setShipmentFormRealOriginCap(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Provincia Mittente"
                    placeholder="MI, TO..."
                    value={shipmentFormRealOriginProvince}
                    onChange={(e) => setShipmentFormRealOriginProvince(e.target.value.toUpperCase())}
                  />
                  <Input
                    label="Nazione Mittente"
                    placeholder="Es. Italia"
                    value={shipmentFormRealOriginCountry}
                    onChange={(e) => setShipmentFormRealOriginCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* SEZIONE 3: ANAGRAFICA DESTINAZIONE REALE */}
              <div className="border-t border-black/5 pt-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 mb-2">Luogo di Destinazione Reale</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ragione Sociale Destinatario *"
                    placeholder="Nome destinatario"
                    value={shipmentFormRealDestinationName}
                    onChange={(e) => setShipmentFormRealDestinationName(e.target.value)}
                    required
                  />
                  <Input
                    label="Indirizzo Destinatario"
                    placeholder="Via, civico"
                    value={shipmentFormRealDestinationAddress}
                    onChange={(e) => setShipmentFormRealDestinationAddress(e.target.value)}
                  />
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Località (Città) Destinatario *</label>
                    <TerritoryAutocomplete
                      value={shipmentFormRealDestinationCity}
                      onChange={(val: string, record: any) => {
                        setShipmentFormRealDestinationCity(val);
                        if (record) {
                          setShipmentFormRealDestinationCap(record.cap);
                          setShipmentFormRealDestinationProvince(record.provincia_sigla);
                          setShipmentFormRealDestinationCountry('Italia');
                        }
                      }}
                      placeholder="Roma, Bari..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="relative">
                    <Input
                      label="CAP Destinatario"
                      placeholder="Es. 00100"
                      value={shipmentFormRealDestinationCap}
                      onChange={(e) => setShipmentFormRealDestinationCap(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Provincia Destinatario"
                    placeholder="RM, BA..."
                    value={shipmentFormRealDestinationProvince}
                    onChange={(e) => setShipmentFormRealDestinationProvince(e.target.value.toUpperCase())}
                  />
                  <Input
                    label="Nazione Destinatario"
                    placeholder="Es. Italia"
                    value={shipmentFormRealDestinationCountry}
                    onChange={(e) => setShipmentFormRealDestinationCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* SEZIONE 1: ROUTING DI RETE */}
              <div className="border-t border-black/5 pt-4 bg-gray-50/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
                    Routing di Rete (Network TMS)
                  </h4>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAutoRoutingEnabled}
                      onChange={(e) => setIsAutoRoutingEnabled(e.target.checked)}
                      className="rounded border-black/10 text-[#004B97] focus:ring-[#004B97] h-3 w-3"
                    />
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">Auto-Routing Attivo</span>
                  </label>
                </div>

                {isRoutingAutoCalculated && (
                  <div className="animate-fade-in">
                    {isRoutingAmbiguous ? (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md font-medium block">
                        ⚠️ **Instradamento Ambiguo:** I dati geografici inseriti non sono sufficienti per una determinazione univoca. Verifica o seleziona gli hub corretti manualmente.
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md font-medium block">
                        ✨ **Auto-Routing Attivo:** Hub calcolati in base alla provenienza e destinazione reale.
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Hub Origine Operativo *"
                    options={depots.map(d => ({ value: d.id, label: d.name }))}
                    value={shipmentFormHubOrigineOperativo}
                    onChange={(e) => {
                      const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                      if (found) {
                        setShipmentFormHubOrigineOperativo(found.id);
                        setIsAutoRoutingEnabled(false);
                      }
                    }}
                    required
                  />
                  <Select
                    label="Hub Destinazione Operativo *"
                    options={depots.map(d => ({ value: d.id, label: d.name }))}
                    value={shipmentFormHubDestinazioneOperativo}
                    onChange={(e) => {
                      const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                      if (found) {
                        setShipmentFormHubDestinazioneOperativo(found.id);
                        setIsAutoRoutingEnabled(false);
                      }
                    }}
                    required
                  />
                  <Select
                    label="Tipo Operazione Hub *"
                    options={[
                      { value: 'INBOUND', label: 'Inbound (Scarico)' },
                      { value: 'OUTBOUND', label: 'Outbound (Carico)' },
                      { value: 'TRANSITO', label: 'Transito / Cross-dock' }
                    ]}
                    value={shipmentFormTipoOperazioneHub}
                    onChange={(e) => {
                      setShipmentFormTipoOperazioneHub(e.target.value as any);
                      setIsAutoRoutingEnabled(false);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-black/5 pt-4">
                <Input
                  label="Data Prevista Slot *"
                  type="date"
                  value={shipmentFormExpectedDate}
                  onChange={(e) => setShipmentFormExpectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-black/5 pt-4">
                <Input
                  label="Riferimento 1 *"
                  placeholder="Ordine / Rif 1"
                  value={shipmentFormOrder}
                  onChange={(e) => setShipmentFormOrder(e.target.value)}
                  required
                />
                <Input
                  label="Riferimento 2"
                  placeholder="DDT / Rif 2"
                  value={shipmentFormOrder2}
                  onChange={(e) => setShipmentFormOrder2(e.target.value)}
                />
                <Input
                  label="Ora Prevista"
                  placeholder="Es. 09:30"
                  value={shipmentFormExpectedTime}
                  onChange={(e) => setShipmentFormExpectedTime(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Posti Pallet *"
                  type="number"
                  value={shipmentFormPallets}
                  onChange={(e) => setShipmentFormPallets(Number(e.target.value))}
                  required
                />
                <Input
                  label="Peso Lordo (kg) *"
                  type="number"
                  value={shipmentFormGrossWeight}
                  onChange={(e) => setShipmentFormGrossWeight(e.target.value)}
                  required
                />
                <Input
                  label="Tipologia Merce"
                  placeholder="Alimentare / Secco / Fresco"
                  value={shipmentFormGoods}
                  onChange={(e) => setShipmentFormGoods(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-black/5 pt-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Note Consegna
                  </label>
                  <textarea
                    rows={2}
                    value={shipmentFormDeliveryNotes}
                    onChange={(e) => setShipmentFormDeliveryNotes(e.target.value)}
                    placeholder="Specifiche e note di consegna..."
                    className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Note Interne
                  </label>
                  <textarea
                    rows={2}
                    value={shipmentFormInternalNotes}
                    onChange={(e) => setShipmentFormInternalNotes(e.target.value)}
                    placeholder="Note interne di yard / guardiola..."
                    className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50 -mx-6 -mb-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 cursor-pointer" 
                  onClick={() => { resetShipmentForm(); setIsNewShipmentModalOpen(false); }}
                >
                  Annulla
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold cursor-pointer">
                  {shipmentFormId ? "Salva Modifiche" : "Registra Spedizione"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DI IMPORTAZIONE MASSIVA DA CSV/TXT */}
      {isImportShipmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-black/10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Importazione Spedizioni da File (CSV/TXT)
              </h3>
              <button 
                onClick={() => { setIsImportShipmentModalOpen(false); setImportError(''); setImportSuccess(''); }}
                className="text-white hover:text-gray-200 font-bold text-lg cursor-pointer font-mono"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[10px] text-blue-800 font-mono leading-relaxed">
                <p className="font-bold mb-1">Tracciato Campi Richiesto (delimitato da virgola o punto e virgola):</p>
                <code>Rif1;Rif2;TipoAttivita;PostiPallet;PesoLordo;Nome;Localita;CAP;Provincia;DataPrevista;OraPrevista;Merce;Indirizzo;Regione;Nazione;NoteConsegna;NoteInterne</code>
                <p className="mt-2 text-gray-500 italic">Esempio:<br/>ORD-12345;REF-AAA;SCARICO;24;15000;Rossi Srl;Milano;20121;MI;2026-08-10;10:30;Alimentari</p>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-mono">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-mono">
                  {importSuccess}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                  Copia e Incolla Righe Dati:
                </label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Incolla qui le righe di dati del foglio Excel o file TXT..."
                  className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none font-mono"
                />
              </div>

              {/* OPZIONE CARICAMENTO FILE REALISTICA */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
                  Oppure seleziona un file locale:
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        setImportText(text);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 border-t border-black/5 pt-4 bg-gray-50 -mx-6 -mb-6 p-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-grow text-xs cursor-pointer" 
                  onClick={() => { setIsImportShipmentModalOpen(false); setImportError(''); setImportSuccess(''); }}
                >
                  Annulla
                </Button>
                <Button 
                  type="button" 
                  variant="success" 
                  className="flex-grow text-xs font-bold cursor-pointer" 
                  onClick={handleImportShipments}
                  disabled={!importText.trim()}
                >
                  Procedi con Importazione
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DI RISOLUZIONE RAPIDA DEL ROUTING */}
      {isQuickResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in print:hidden overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full border border-black/10 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Risoluzione Rapida / Revisione Import Spedizioni
                </h3>
              </div>
              <button 
                onClick={() => { setIsQuickResolutionModalOpen(false); setSelectedResolutionIds([]); }}
                className="text-white hover:text-gray-200 font-bold text-lg cursor-pointer font-mono"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-relaxed">
                Le seguenti spedizioni presentano tratte geografiche ambigue (es. più hub nella stessa zona) o inserite da importazione CSV con dati incompleti.
                Conferma l'hub suggerito o assegna manualmente l'hub corretto verificando la disponibilità delle baie in tempo reale.
              </div>

              {/* Barra delle azioni massive */}
              {selectedResolutionIds.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-between animate-fade-in border border-black/5">
                  <div className="text-xs font-mono font-bold text-gray-700">
                    Selezionate: {selectedResolutionIds.length} spedizioni
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-mono font-bold font-mono">Assegna Massivamente:</span>
                    <select
                      className="bg-white border text-xs p-1.5 rounded-lg focus:outline-none focus:ring-0 font-mono"
                      onChange={(e) => {
                        const targetHub = e.target.value;
                        if (!targetHub) return;
                        
                        selectedResolutionIds.forEach(id => {
                          const s = shipments.find(item => item.id === id);
                          if (!s) return;
                          
                          const finalOpType = s.activityType === 'SCARICO' ? 'INBOUND' : 'OUTBOUND';

                          updateShipment(id, {
                            hubOrigineOperativo: s.activityType === 'SCARICO' ? targetHub : s.hubOrigineOperativo,
                            hubDestinazioneOperativo: s.activityType === 'CARICO' ? targetHub : s.hubDestinazioneOperativo,
                            tipoOperazioneHub: finalOpType,
                            routingStatus: 'CONFERMATO',
                            routingNotes: `Confermato massivamente su ${depots.find(d => d.id === targetHub)?.name || targetHub}`
                          });
                        });

                        setSelectedResolutionIds([]);
                      }}
                    >
                      <option value="">Scegli Hub...</option>
                      {depots.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({getFreeBaysCount(d.id)} baie libere)
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        selectedResolutionIds.forEach(id => {
                          const s = shipments.find(item => item.id === id);
                          if (!s) return;
                          updateShipment(id, {
                            routingStatus: 'CONFERMATO',
                            routingNotes: `Accettato suggerito: ${depots.find(d => d.id === s.hubOrigineOperativo)?.name || s.hubOrigineOperativo}`
                          });
                        });
                        setSelectedResolutionIds([]);
                      }}
                      className="font-bold text-xs cursor-pointer"
                    >
                      Accetta Suggeriti Selezionati
                    </Button>
                  </div>
                </div>
              )}

              {/* Tabella di risoluzione */}
              {ambiguousShipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-mono text-xs uppercase">
                  Tutte le spedizioni sono state instradate correttamente.
                </div>
              ) : (
                <div className="overflow-x-auto border border-black/5 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black/5 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 font-mono">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedResolutionIds.length === ambiguousShipments.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedResolutionIds(ambiguousShipments.map(s => s.id));
                              } else {
                                setSelectedResolutionIds([]);
                              }
                            }}
                            className="rounded border-black/10 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Ordine / Committente</th>
                        <th className="p-3">Provenienza Reale ➡️ Destinazione Reale</th>
                        <th className="p-3">Nota Calcolata</th>
                        <th className="p-3">Hub Suggerito</th>
                        <th className="p-3 text-right">Risoluzione Rapida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-sans text-xs">
                      {ambiguousShipments.map(s => {
                        const clientName = clients.find(c => c.id === s.clientId)?.name || s.clientId || 'Generico';
                        const suggestedHubId = s.hubOrigineOperativo || 'depot-milano';
                        const suggestedHubName = depots.find(d => d.id === suggestedHubId)?.name || suggestedHubId;

                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-all">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedResolutionIds.includes(s.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedResolutionIds(prev => [...prev, s.id]);
                                  } else {
                                    setSelectedResolutionIds(prev => prev.filter(id => id !== s.id));
                                  }
                                }}
                                className="rounded border-black/10 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <span className="font-bold font-mono text-gray-800 text-xs block">{s.orderNumber}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{clientName}</span>
                            </td>
                            <td className="p-3 leading-relaxed">
                              <div className="font-medium text-gray-700">
                                {s.realOriginCity || 'N/D'} <span className="text-[10px] text-gray-400">({s.realOriginProvince || '-'})</span>
                                <span className="text-gray-400 mx-1.5">➡️</span>
                                {s.realDestinationCity || 'N/D'} <span className="text-[10px] text-gray-400">({s.realDestinationProvince || '-'})</span>
                              </div>
                              {s.address && <span className="text-[10px] text-gray-400 block">{s.address}</span>}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-medium block w-max">
                                {s.routingNotes || 'Ambivalenza geografica'}
                              </span>
                            </td>
                            <td className="p-3">
                              <Badge variant="primary">{suggestedHubName}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => {
                                    updateShipment(s.id, {
                                      routingStatus: 'CONFERMATO',
                                      routingNotes: `Accettato suggerito: ${suggestedHubName}`
                                    });
                                  }}
                                  className="font-bold text-[10px] cursor-pointer"
                                >
                                  ✓ Accetta Suggerito
                                </Button>

                                <select
                                  className="bg-white border text-[11px] p-1.5 rounded-lg focus:outline-none font-mono"
                                  value=""
                                  onChange={(e) => {
                                    const targetHub = e.target.value;
                                    if (!targetHub) return;

                                    const finalOpType = s.activityType === 'SCARICO' ? 'INBOUND' : 'OUTBOUND';

                                    updateShipment(s.id, {
                                      hubOrigineOperativo: s.activityType === 'SCARICO' ? targetHub : s.hubOrigineOperativo,
                                      hubDestinazioneOperativo: s.activityType === 'CARICO' ? targetHub : s.hubDestinazioneOperativo,
                                      tipoOperazioneHub: finalOpType,
                                      routingStatus: 'CONFERMATO',
                                      routingNotes: `Risolto manualmente su ${depots.find(d => d.id === targetHub)?.name || targetHub}`
                                    });
                                  }}
                                >
                                  <option value="">Scegli Hub...</option>
                                  {depots.map(d => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} ({getFreeBaysCount(d.id)} baie libere)
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-black/5 bg-gray-50">
              <Button
                variant="secondary"
                onClick={() => { setIsQuickResolutionModalOpen(false); setSelectedResolutionIds([]); }}
                className="text-xs font-bold font-mono uppercase cursor-pointer"
              >
                Chiudi Risoluzione Rapida
              </Button>
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
