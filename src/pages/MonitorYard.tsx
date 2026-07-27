import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import type { Booking } from '../types';

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
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'schedule'>('monitor');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');

  const activeDepot = depots.find((d) => d.id === selectedDepotId);
  const activeBays = bays.filter((b) => b.depotId === selectedDepotId);
  const activeBookings = bookings.filter((b) => b.depotId === selectedDepotId);
  const activeModules = warehouseModules.filter((m) => m.depotId === selectedDepotId);

  // Filtro Baie per Modulo
  const filteredBays = selectedModuleFilter
    ? activeBays.filter((b) => b.moduleId === selectedModuleFilter)
    : activeBays;

  const incomingBookings = activeBookings.filter((b) => b.status === 'PRENOTATO');
  const gateBookings = activeBookings.filter((b) => b.status === 'AL_CANCELLO');
  const activeLogs = activityLogs.filter((l) => l.depotId === selectedDepotId);

  // Form check-in manuale rapido
  const [manualPlate, setManualPlate] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const [manualCarrierId, setManualCarrierId] = useState(carriers.filter(c => c.status === 'APPROVATO')[0]?.id || '');
  const [manualActivityCode, setManualActivityCode] = useState(activityTypes[0]?.code || 'SCARICO');

  const [tempBayAssignment, setTempBayAssignment] = useState<{ [bookingId: string]: string }>({});

  const handleRegisterManualArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver) return;

    const todayStr = new Date().toISOString().split('T')[0];
    addBooking(selectedDepotId, todayStr, manualActivityCode, manualPlate, manualDriver);
    
    setManualPlate('');
    setManualDriver('');
  };

  const handleAcceptAtGate = (bookingId: string) => {
    updateBookingStatus(bookingId, 'AL_CANCELLO');
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
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper per mostrare badge di stato carini
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
      {/* Intestazione */}
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
      <div className="flex space-x-2 border-b border-black/10 pb-px font-mono text-[10px]">
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
          📅 Programmazione Giornaliera
        </button>
      </div>

      {/* --- VISTA: MONITOR LIVE PIAZZALE --- */}
      {activeSubTab === 'monitor' && (
        <>
          {/* Sezione 1: Visualizzazione Grafica Baie con filtro modulo */}
          <Card
            title="Stato Occupazione Baie Carico/Scarico"
            accent="orange"
            headerAction={
              activeModules.length > 0 ? (
                <div className="flex items-center gap-2 font-mono text-[10px] text-black">
                  <span>Modulo:</span>
                  <select
                    value={selectedModuleFilter}
                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                    className="bg-white border border-black/10 text-[9px] font-mono px-2 py-1 rounded focus:outline-none"
                  >
                    <option value="">Tutti i moduli</option>
                    {activeModules.map(m => (
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
                  const moduleName = activeModules.find(m => m.id === bay.moduleId)?.name || 'Generico';

                  return (
                    <div
                      key={bay.id}
                      className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between min-h-[170px] ${
                        bay.status === 'DISPONIBILE'
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
                      </div>

                      {/* Body Baia */}
                      <div className="py-3 flex-grow">
                        {bay.status === 'OCCUPATA' && activeBooking ? (
                          <div className="font-mono text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-ticket-muted">Targa:</span>
                              <span className="font-bold text-ticket-accent">{activeBooking.licensePlate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted">Vettore:</span>
                              <span className="truncate max-w-[120px] text-right font-bold">{carrierName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted">Attività:</span>
                              <span className="font-bold">{activeBooking.activityType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ticket-muted">Attracco:</span>
                              <span className="text-amber-600 font-bold">{formatTime(activeBooking.timeInBay)}</span>
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

                      {/* Azione Rapida Baia */}
                      {bay.status === 'OCCUPATA' && activeBooking && (
                        <Button
                          size="sm"
                          variant="success"
                          className="w-full text-xs py-1"
                          onClick={() => handleCompleteActivity(activeBooking.id)}
                        >
                          Rilascia & Completa
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Griglia Code e Accettazione manuale */}
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
                      header: 'Veicolo / Autista',
                      accessor: (b) => (
                        <div>
                          <span className="font-bold font-mono">{b.licensePlate}</span>
                          <span className="text-xs text-ticket-muted ml-2">({b.driverName})</span>
                        </div>
                      ),
                    },
                    {
                      header: 'Attività',
                      accessor: (b) => <Badge variant="primary">{b.activityType}</Badge>,
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

              {/* Prenotazioni Attese */}
              <Card title="Prenotazioni Slot Attese per Oggi">
                <Table
                  data={incomingBookings}
                  emptyMessage="Nessun camion prenotato atteso per oggi."
                  columns={[
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
                        <div>
                          <span className="font-mono font-bold">{b.licensePlate}</span>
                          <span className="text-xs text-ticket-muted ml-2">({b.driverName})</span>
                        </div>
                      ),
                    },
                    {
                      header: 'Attività Richiesta',
                      accessor: (b) => <Badge variant="info">{b.activityType}</Badge>,
                    },
                    {
                      header: 'Registra Arrivo',
                      accessor: (b) => (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptAtGate(b.id)}
                        >
                          Check-In Cancello
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            {/* Colonna Destra: Inserimento rapido senza prenotazione e Log live */}
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
                  <Input
                    label="Targa Automezzo"
                    placeholder="Es. AA123BB"
                    value={manualPlate}
                    onChange={(e) => setManualPlate(e.target.value)}
                    required
                  />
                  <Input
                    label="Nominativo Autista"
                    placeholder="Es. Luca Verdi"
                    value={manualDriver}
                    onChange={(e) => setManualDriver(e.target.value)}
                    required
                  />
                  <Select
                    label="Attività Richiesta"
                    options={activityTypes.map(act => ({ value: act.code, label: act.name }))}
                    value={activityTypes.find(a => a.code === manualActivityCode)?.name || manualActivityCode}
                    onChange={(e) => {
                      const found = activityTypes.find(a => a.name === e.target.value || a.code === e.target.value);
                      if (found) setManualActivityCode(found.code);
                    }}
                  />
                  <Button type="submit" className="w-full">
                    Registra Check-In
                  </Button>
                </form>
              </Card>

              <Card title="Log Attività Cantiere (Live)">
                <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-[11px] pr-2">
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

      {/* --- VISTA: PROGRAMMAZIONE GIORNALIERA --- */}
      {activeSubTab === 'schedule' && (
        <Card title="Programmazione Attività Giornaliere (Tabellone Completo)">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 font-sans">
              Elenco cronologico completo di tutti i transiti di camion pianificati, attivi o conclusi per la giornata odierna presso questo stabilimento Plant.
            </p>
            <Table
              data={activeBookings}
              emptyMessage="Nessun transito registrato per la giornata odierna."
              columns={[
                {
                  header: 'Targa Mezzo',
                  accessor: (b) => <span className="font-mono font-bold text-xs">{b.licensePlate}</span>
                },
                {
                  header: 'Autista',
                  accessor: (b) => <span className="text-xs">{b.driverName}</span>
                },
                {
                  header: 'Vettore',
                  accessor: (b) => {
                    const name = carriers.find(c => c.id === b.carrierId)?.name || 'Vettore';
                    return <span className="font-bold text-xs">{name}</span>;
                  }
                },
                {
                  header: 'Tipo Attività',
                  accessor: (b) => <Badge variant="info">{b.activityType}</Badge>
                },
                {
                  header: 'Orario Check-In',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeInGate)}</span>
                },
                {
                  header: 'Ingresso Baia',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeInBay)}</span>
                },
                {
                  header: 'Partenza / Fine',
                  accessor: (b) => <span className="text-xs font-mono">{formatTime(b.timeOutGate)}</span>
                },
                {
                  header: 'Stato Corrente',
                  accessor: (b) => getBookingStatusBadge(b.status)
                }
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
