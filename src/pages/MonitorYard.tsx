import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import type { Booking, Bay } from '../types';

export const MonitorYard: React.FC = () => {
  const {
    depots,
    selectedDepotId,
    bookings,
    bays,
    carriers,
    warehouseModules,
    activityLogs,
    activityTypes,
    updateBookingStatus,
    addBooking,
    updateBookingDetails,
    relocateBookingBay,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'schedule'>('monitor');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');
  
  // Calendario per visualizzare la programmazione di altri giorni
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  const activeDepot = depots.find((d) => d.id === selectedDepotId);
  const activeBays = bays.filter((b) => b.depotId === selectedDepotId);
  
  // Prenotazioni filtrate per giorno e plant
  const activeBookings = bookings.filter((b) => b.depotId === selectedDepotId);
  const dayBookings = activeBookings.filter((b) => b.date === scheduleDate);

  // Filtro Baie per Modulo
  const filteredBays = selectedModuleFilter
    ? activeBays.filter((b) => b.moduleId === selectedModuleFilter)
    : activeBays;

  const incomingBookings = dayBookings.filter((b) => b.status === 'PRENOTATO');
  const gateBookings = activeBookings.filter((b) => b.status === 'AL_CANCELLO'); // La coda al gate è live per chi è arrivato fisicamente
  const activeLogs = activityLogs.filter((l) => l.depotId === selectedDepotId);

  // Form check-in manuale rapido
  const [manualPlate, setManualPlate] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualPallets, setManualPallets] = useState<number | ''>('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualCarrierId, setManualCarrierId] = useState(carriers.filter(c => c.status === 'APPROVATO')[0]?.id || '');
  const [manualActivityCode, setManualActivityCode] = useState(activityTypes[0]?.code || 'SCARICO');

  // Stato Modali
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null);
  const [checkInPhone, setCheckInPhone] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');

  const [activeBayDetail, setActiveBayDetail] = useState<{ bay: Bay; booking: Booking } | null>(null);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailActivity, setDetailActivity] = useState('');
  const [detailPhone, setDetailPhone] = useState('');
  const [detailPallets, setDetailPallets] = useState<number | ''>('');

  // Spostamento Baia
  const [relocateBayId, setRelocateBayId] = useState('');
  const [relocateReason, setRelocateReason] = useState('');

  const [tempBayAssignment, setTempBayAssignment] = useState<{ [bookingId: string]: string }>({});

  const handleRegisterManualArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver) return;

    const todayStr = new Date().toISOString().split('T')[0];
    addBooking(
      selectedDepotId,
      todayStr,
      manualActivityCode,
      manualPlate,
      manualDriver,
      manualPhone || undefined,
      manualNotes || undefined,
      manualPallets ? Number(manualPallets) : undefined
    );
    
    // Resetta
    setManualPlate('');
    setManualDriver('');
    setManualPhone('');
    setManualPallets('');
    setManualNotes('');
  };

  // Apertura modal check-in per prenotato
  const handleOpenCheckInModal = (booking: Booking) => {
    setCheckInBooking(booking);
    setCheckInPhone(booking.driverPhone || '');
    setCheckInNotes(booking.notes || '');
  };

  const handleConfirmCheckIn = () => {
    if (!checkInBooking) return;
    updateBookingStatus(checkInBooking.id, 'AL_CANCELLO', undefined, {
      driverPhone: checkInPhone || undefined,
      notes: checkInNotes || undefined,
    });
    setCheckInBooking(null);
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
  };

  const handleCompleteActivity = (bookingId: string) => {
    updateBookingStatus(bookingId, 'COMPLETATO');
    setActiveBayDetail(null);
  };

  // Apertura modal dettaglio baia
  const handleOpenBayDetail = (bay: Bay, booking: Booking) => {
    setActiveBayDetail({ bay, booking });
    setDetailNotes(booking.notes || '');
    setDetailActivity(booking.activityType);
    setDetailPhone(booking.driverPhone || '');
    setDetailPallets(booking.palletPlaces || '');
    setRelocateBayId('');
    setRelocateReason('');
  };

  const handleSaveBayDetailChanges = () => {
    if (!activeBayDetail) return;
    updateBookingDetails(activeBayDetail.booking.id, {
      notes: detailNotes || undefined,
      activityType: detailActivity,
      driverPhone: detailPhone || undefined,
      palletPlaces: detailPallets ? Number(detailPallets) : undefined,
    });
    setActiveBayDetail(null);
  };

  const handleConfirmRelocate = () => {
    if (!activeBayDetail || !relocateBayId || !relocateReason) {
      alert('Seleziona una nuova baia e inserisci la motivazione.');
      return;
    }
    relocateBookingBay(activeBayDetail.booking.id, relocateBayId, relocateReason);
    setActiveBayDetail(null);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  const getBookingStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'PRENOTATO': return <Badge variant="info">Pianificato</Badge>;
      case 'AL_CANCELLO': return <Badge variant="warning">In Guardiola</Badge>;
      case 'IN_BAIA': return <Badge variant="primary">In Baia</Badge>;
      case 'COMPLETATO': return <Badge variant="success">Completato</Badge>;
      case 'ANNULLATO': return <Badge variant="danger">Annullato</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Pagina */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // PANNELLO DI CONTROLLO GUARDIOLA
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Plant Attivo: {activeDepot?.name} ({activeDepot?.city})
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="success">ONLINE</Badge>
          <Badge variant="primary">
            {activeBays.filter((b) => b.status === 'DISPONIBILE').length} / {activeBays.length} Baie Libere
          </Badge>
        </div>
      </div>

      {/* Sotto-Navigazione Guardiola */}
      <div className="flex justify-between items-center border-b border-black/10 pb-px font-mono text-[10px]">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('monitor')}
            className={`px-4 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
              activeSubTab === 'monitor'
                ? 'border-ticket-accent text-ticket-accent bg-white/50'
                : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
            }`}
          >
            🎛️ Monitor Live Piazzale
          </button>
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
              activeSubTab === 'schedule'
                ? 'border-ticket-accent text-ticket-accent bg-white/50'
                : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
            }`}
          >
            📅 Tabellone Programmazione
          </button>
        </div>
        
        {/* Calendario Unificato per Filtro Giorno */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Data Attività:</span>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="bg-white border border-black/10 font-mono text-xs px-2 py-1 rounded shadow-xs focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      {/* --- VISTA: MONITOR LIVE PIAZZALE --- */}
      {activeSubTab === 'monitor' && (
        <>
          {/* Sezione 1: Visualizzazione Grafica Baie */}
          <Card
            title="Stato Occupazione Baie Carico/Scarico"
            accent="orange"
            headerAction={
              warehouseModules.filter((m) => m.depotId === selectedDepotId).length > 0 ? (
                <div className="flex items-center gap-2 font-mono text-[10px] text-black">
                  <span>Modulo:</span>
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
              <p className="text-center py-6 text-xs text-gray-500 font-mono">Nessuna baia corrisponde ai filtri impostati.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredBays.map((bay) => {
                  const activeBooking = activeBookings.find(
                    (b) => b.status === 'IN_BAIA' && b.bayId === bay.id
                  );
                  const carrierName = activeBooking
                    ? carriers.find((c) => c.id === activeBooking.carrierId)?.name
                    : '';
                  const moduleName = warehouseModules.find(m => m.id === bay.moduleId)?.name || 'Generico';

                  // Stili condizionali se modificato in baia
                  const isModified = activeBooking?.isEditedInBay;

                  return (
                    <div
                      key={bay.id}
                      onClick={() => activeBooking && handleOpenBayDetail(bay, activeBooking)}
                      className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between min-h-[170px] cursor-pointer ${
                        isModified
                          ? 'border-amber-500 border-[3px] border-dashed bg-amber-50/40 ring-4 ring-amber-500/10 shadow-md scale-[1.02]'
                          : bay.status === 'DISPONIBILE'
                          ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                          : bay.status === 'OCCUPATA'
                          ? 'border-[#11BCEC]/30 bg-[#11BCEC]/5 hover:border-[#11BCEC] shadow-2xs'
                          : 'border-red-200 bg-red-50/30 hover:border-red-400'
                      }`}
                    >
                      {/* Header Baia */}
                      <div className="flex justify-between items-center border-b border-black/5 pb-2">
                        <div>
                          <span className="font-mono font-bold text-sm text-black block">{bay.name}</span>
                          <span className="text-[8px] font-mono text-gray-400 uppercase">Sez: {moduleName}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              bay.status === 'DISPONIBILE'
                                ? 'success'
                                : bay.status === 'OCCUPATA'
                                ? 'primary'
                                : 'danger'
                            }
                          >
                            {bay.status === 'DISPONIBILE'
                              ? 'Libera'
                              : bay.status === 'OCCUPATA'
                              ? 'In Uso'
                              : 'Manutenzione'}
                          </Badge>
                          {isModified && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-1 rounded animate-pulse">
                              ⚠️ MODIFICATO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body Baia */}
                      <div className="py-3 flex-grow">
                        {bay.status === 'OCCUPATA' && activeBooking ? (
                          <div className="font-mono text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-ticket-muted text-[10px]">Ticket:</span>
                              <span className="font-bold text-black">{activeBooking.ticketNumber || 'N/D'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted text-[10px]">Targa:</span>
                              <span className="font-bold text-ticket-accent">{activeBooking.licensePlate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted text-[10px]">Vettore:</span>
                              <span className="truncate max-w-[120px] text-right font-bold">{carrierName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted text-[10px]">Attività:</span>
                              <span className="font-bold">{activeBooking.activityType}</span>
                            </div>
                          </div>
                        ) : bay.status === 'MANUTENZIONE' ? (
                          <div className="text-center py-4 text-xs font-mono text-red-500 font-bold">
                            // BAIA IN MANUTENZIONE
                          </div>
                        ) : (
                          <div className="text-center py-4 text-xs font-mono text-emerald-600 font-bold">
                            // PRONTA AL CARICO
                          </div>
                        )}
                      </div>

                      {bay.status === 'OCCUPATA' ? (
                        <div className="text-[9px] text-center text-ticket-muted font-sans border-t border-black/5 pt-1.5 mt-1">
                          Clicca per gestire ➔
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

          {/* Griglie Code e Accettazione manuale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              {/* Coda al Cancello */}
              <Card title="Coda Check-In al Cancello (In Attesa di Baia)" accent="yellow">
                <Table
                  data={gateBookings}
                  emptyMessage="Nessun camion in attesa al cancello."
                  columns={[
                    {
                      header: 'Check-In',
                      accessor: (b) => <span className="text-amber-600 font-bold">{formatTime(b.timeInGate)}</span>,
                    },
                    {
                      header: 'Ticket / Vettore',
                      accessor: (b) => {
                        const carrierName = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                        return (
                          <div className="text-xs">
                            <span className="font-mono font-bold bg-gray-100 border border-black/10 px-1 rounded mr-2">{b.ticketNumber || 'N/D'}</span>
                            <span className="font-bold text-gray-700">{carrierName}</span>
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Veicolo / Autista',
                      accessor: (b) => (
                        <div className="text-xs">
                          <div><span className="font-bold font-mono text-black">{b.licensePlate}</span> ({b.driverName})</div>
                          {b.driverPhone && <div className="text-[10px] font-mono text-gray-400">Tel: {b.driverPhone}</div>}
                          {b.notes && <div className="text-[10px] text-amber-600 italic">Note: {b.notes}</div>}
                        </div>
                      ),
                    },
                    {
                      header: 'Assegna Baia',
                      accessor: (b) => {
                        const availableBays = activeBays.filter((bay) => bay.status === 'DISPONIBILE');
                        return (
                          <div className="flex space-x-2">
                            <select
                              value={tempBayAssignment[b.id] || ''}
                              onChange={(e) =>
                                setTempBayAssignment((prev) => ({ ...prev, [b.id]: e.target.value }))
                              }
                              className="bg-white border border-black/10 text-xs text-black font-mono p-1 rounded-md focus:ring-0 focus:outline-none cursor-pointer"
                            >
                              <option value="">Seleziona baia...</option>
                              {availableBays.map((bay) => {
                                const modName = warehouseModules.find(m => m.id === bay.moduleId)?.name || 'Gen';
                                return (
                                  <option key={bay.id} value={bay.id}>
                                    {bay.name} ({modName})
                                  </option>
                                );
                              })}
                            </select>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleAssignBay(b.id)}
                              disabled={!tempBayAssignment[b.id]}
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

              {/* Prenotazioni Attese filtrate per giorno */}
              <Card title={`Prenotazioni Slot Attese per il ${scheduleDate}`}>
                <Table
                  data={incomingBookings}
                  emptyMessage="Nessun camion prenotato atteso per questa data."
                  columns={[
                    {
                      header: 'Ticket',
                      accessor: (b) => <span className="font-mono font-bold text-xs bg-gray-50 border border-black/5 px-2 py-0.5 rounded">{b.ticketNumber || 'N/D'}</span>
                    },
                    {
                      header: 'Vettore',
                      accessor: (b) => {
                        const name = carriers.find((c) => c.id === b.carrierId)?.name || 'Vettore';
                        return <span className="font-bold">{name}</span>;
                      },
                    },
                    {
                      header: 'Targa / Autista',
                      accessor: (b) => (
                        <div className="text-xs">
                          <div><span className="font-mono font-bold text-black">{b.licensePlate}</span> ({b.driverName})</div>
                          {b.palletPlaces && <div className="text-[10px] text-[#11BCEC] font-sans">Capacità: {b.palletPlaces} PL</div>}
                        </div>
                      ),
                    },
                    {
                      header: 'Attività',
                      accessor: (b) => <Badge variant="info">{b.activityType}</Badge>,
                    },
                    {
                      header: 'Registra Arrivo',
                      accessor: (b) => (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenCheckInModal(b)}
                        >
                          Check-In Cancello
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            {/* Inserimento rapido senza prenotazione */}
            <div className="space-y-6">
              <Card title="Registra Mezzo Senza Prenotazione" accent="orange">
                <form onSubmit={handleRegisterManualArrival} className="space-y-4">
                  <Select
                    label="Vettore Selezionato"
                    options={carriers.filter(c => c.status === 'APPROVATO').map((c) => ({ value: c.id, label: c.name }))}
                    value={carriers.find(c => c.id === manualCarrierId)?.name || manualCarrierId}
                    onChange={(e) => {
                      const found = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                      if (found) setManualCarrierId(found.id);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Targa *"
                      placeholder="AA123BB"
                      value={manualPlate}
                      onChange={(e) => setManualPlate(e.target.value)}
                      required
                    />
                    <Input
                      label="Posti Pallet (Ind.)"
                      type="number"
                      placeholder="33"
                      value={manualPallets}
                      onChange={(e) => setManualPallets(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Nominativo Autista *"
                      placeholder="Luca Verdi"
                      value={manualDriver}
                      onChange={(e) => setManualDriver(e.target.value)}
                      required
                    />
                    <Input
                      label="Telefono"
                      placeholder="3331234567"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                    />
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
                    label="Note Operative Check-In"
                    placeholder="Sponda idraulica, sigillo ecc."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                  />
                  <Button type="submit" className="w-full">
                    Registra Check-In
                  </Button>
                </form>
              </Card>

              <Card title="Log Attività Cantiere (Live)">
                <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[11px] pr-2">
                  {activeLogs.length === 0 ? (
                    <div className="text-ticket-muted text-center py-4">// NESSUN LOG REGISTRATO</div>
                  ) : (
                    activeLogs.map((log) => (
                      <div key={log.id} className="border-b border-black/5 pb-2">
                        <div className="flex justify-between text-[10px] text-ticket-muted">
                          <span>{new Date(log.timestamp).toLocaleTimeString('it-IT')}</span>
                          <span className={
                            log.type === 'SUCCESS' ? 'text-emerald-600' :
                            log.type === 'WARNING' ? 'text-rose-500' : 'text-[#11BCEC]'
                          }>
                            [{log.type}]
                          </span>
                        </div>
                        <div className="text-black mt-0.5">{log.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* --- VISTA: TABELLONE PROGRAMMAZIONE --- */}
      {activeSubTab === 'schedule' && (
        <Card title={`Programmazione Attività del Cantiere - Giorno: ${scheduleDate}`}>
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-sans">
              Elenco completo di tutti i transiti e slot prenotati in questa data presso lo stabilimento logistico. Le attività completate rimangono visibili per lo storico odierno.
            </p>
            <Table
              data={dayBookings}
              emptyMessage="Nessun transito pianificato o registrato per questa data."
              rowClassName={(b: Booking) => b.status === 'COMPLETATO' ? 'opacity-50 line-through bg-gray-50/80 text-gray-400' : ''}
              columns={[
                {
                  header: 'Ticket',
                  accessor: (b) => <span className="font-mono font-bold text-xs bg-gray-100 border px-2 py-0.5 rounded">{b.ticketNumber || 'N/D'}</span>
                },
                {
                  header: 'Targa Mezzo',
                  accessor: (b) => <span className="font-mono font-bold text-xs">{b.licensePlate}</span>
                },
                {
                  header: 'Autista',
                  accessor: (b) => (
                    <div className="text-xs">
                      <div>{b.driverName}</div>
                      {b.driverPhone && <div className="text-[10px] font-mono text-gray-400">Tel: {b.driverPhone}</div>}
                    </div>
                  )
                },
                {
                  header: 'Vettore',
                  accessor: (b) => {
                    const name = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                    return <span className="font-bold text-xs">{name}</span>;
                  }
                },
                {
                  header: 'Pallet (PL)',
                  accessor: (b) => <span className="font-mono text-xs">{b.palletPlaces || '-'}</span>
                },
                {
                  header: 'Tipo Attività',
                  accessor: (b) => <Badge variant="info">{b.activityType}</Badge>
                },
                {
                  header: 'N. Baia Assegnata',
                  accessor: (b) => {
                    if (b.bayId) {
                      const bName = bays.find(bay => bay.id === b.bayId)?.name || 'Baia';
                      return <span className="font-mono font-bold text-ticket-accent text-xs bg-white border px-2 py-0.5 rounded shadow-2xs">{bName}</span>;
                    }
                    return <span className="text-xs text-gray-400 italic">Non in Baia</span>;
                  }
                },
                {
                  header: 'Check-In',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeInGate)}</span>
                },
                {
                  header: 'Ingresso Baia',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeInBay)}</span>
                },
                {
                  header: 'Partenza',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeOutGate)}</span>
                },
                {
                  header: 'Stato',
                  accessor: (b) => getBookingStatusBadge(b.status)
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* --- MODAL 1: REGISTRAZIONE CHECK-IN (TELEFONO E NOTE) --- */}
      {checkInBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-black/10 overflow-hidden">
            <div className="bg-gradient-to-r from-[#003a75] to-[#004B97] text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Registrazione Check-In Cancello
              </h3>
              <p className="text-[10px] text-white/70 font-mono mt-1">
                Ticket: {checkInBooking.ticketNumber || 'N/D'} | Veicolo: {checkInBooking.licensePlate}
              </p>
            </div>
            <div className="p-4 space-y-4 font-sans text-xs">
              <p className="text-gray-500">
                Inserisci o verifica i dettagli del veicolo prima dell'ingresso nello Yard.
              </p>
              <div className="space-y-3">
                <Input
                  label="Telefono Autista per reperibilità"
                  placeholder="Es. +39 347 1122334"
                  value={checkInPhone}
                  onChange={(e) => setCheckInPhone(e.target.value)}
                />
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                    Note di Ingresso / Anomalie
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Es. Sigilli intatti, temperatura registrata, ritardo..."
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    className="w-full bg-[#F5F0EB]/40 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none"
                  />
                </div>
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
                Conferma Check-In
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: DETTAGLIO BAIA ATTIVA (MODIFICA INFO, SPOSTAMENTO BAIA CON MOTIVAZIONE) --- */}
      {activeBayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-black/10 overflow-hidden my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004B97] to-[#0062b8] text-white p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Gestione Attiva Baia: {activeBayDetail.bay.name}
                </h3>
                <span className="text-[9px] font-mono text-white/70 block mt-0.5">
                  Modulo attrazione: {warehouseModules.find(m => m.id === activeBayDetail.bay.moduleId)?.name || 'Generico'}
                </span>
              </div>
              <Badge variant="warning">{activeBayDetail.booking.ticketNumber || 'Triage'}</Badge>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 font-sans text-xs">
              {/* Dati statici */}
              <div className="grid grid-cols-2 gap-4 border-b border-black/5 pb-4 bg-gray-50/50 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Vettore</span>
                  <span className="font-bold text-black text-xs truncate block">
                    {carriers.find(c => c.id === activeBayDetail.booking.carrierId)?.name || 'N/D'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Veicolo (Targa)</span>
                  <span className="font-bold text-ticket-accent text-xs block">
                    {activeBayDetail.booking.licensePlate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Autista</span>
                  <span className="font-bold text-black text-xs block">
                    {activeBayDetail.booking.driverName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Attracco Baia</span>
                  <span className="font-bold text-amber-600 text-xs block">
                    {formatTime(activeBayDetail.booking.timeInBay)}
                  </span>
                </div>
              </div>

              {/* Modifica informazioni in baia */}
              <div className="space-y-3">
                <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#11BCEC] border-b border-black/5 pb-1">
                  1. Modifica Info in Baia (Evidenzia Contorno)
                </h4>
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                <Select
                  label="Cambia Attività In Baia"
                  options={activityTypes.map(a => ({ value: a.code, label: a.name }))}
                  value={activityTypes.find(a => a.code === detailActivity)?.name || detailActivity}
                  onChange={(e) => {
                    const found = activityTypes.find(a => a.name === e.target.value || a.code === e.target.value);
                    if (found) setDetailActivity(found.code);
                  }}
                />
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                    Note Operative (In Baia)
                  </label>
                  <textarea
                    rows={2}
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    className="w-full bg-[#F5F0EB]/40 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                    placeholder="Inserisci note o anomalie che allertano il piazzale..."
                  />
                </div>
                <Button size="sm" onClick={handleSaveBayDetailChanges} className="w-full">
                  Salva Informazioni
                </Button>
              </div>

              {/* Riassegnazione Baia (Spostamento) */}
              <div className="space-y-3 pt-3 border-t border-black/5">
                <h4 className="font-bold text-[10px] uppercase font-mono tracking-widest text-amber-600 border-b border-black/5 pb-1">
                  2. Riassegna / Sposta ad altra Baia Disponibile
                </h4>
                
                {activeBays.filter((b) => b.status === 'DISPONIBILE').length === 0 ? (
                  <p className="text-[10px] text-rose-500 italic font-mono">// NESSUNA ALTRA BAIA DISPONIBILE PER LO SPOSTAMENTO</p>
                ) : (
                  <div className="space-y-2">
                    <Select
                      label="Seleziona Baia di Destinazione"
                      options={[{ value: '', label: 'Scegli baia...' }, ...activeBays.filter(b => b.status === 'DISPONIBILE').map(b => {
                        const mName = warehouseModules.find(m => m.id === b.moduleId)?.name || 'Gen';
                        return { value: b.id, label: `${b.name} (${mName})` };
                      })]}
                      value={bays.find(b => b.id === relocateBayId)?.name || relocateBayId}
                      onChange={(e) => {
                        const found = bays.find(b => b.name === e.target.value || b.id === e.target.value);
                        setRelocateBayId(found ? found.id : e.target.value);
                      }}
                    />
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                        Motivazione dello Spostamento *
                      </label>
                      <textarea
                        rows={2}
                        value={relocateReason}
                        onChange={(e) => setRelocateReason(e.target.value)}
                        className="w-full bg-[#F5F0EB]/40 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                        placeholder="Rampa danneggiata, priorità modulo refrigerato, ecc."
                        required
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={handleConfirmRelocate}
                      disabled={!relocateBayId || !relocateReason}
                      className="w-full"
                    >
                      Sposta Camion
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => setActiveBayDetail(null)}
              >
                Chiudi
              </Button>
              <Button
                variant="success"
                className="flex-1 text-xs"
                onClick={() => handleCompleteActivity(activeBayDetail.booking.id)}
              >
                Completa & Rilascia Baia
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
