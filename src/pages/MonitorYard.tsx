import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';

export const MonitorYard: React.FC = () => {
  const {
    depots,
    selectedDepotId,
    bookings,
    bays,
    carriers,
    activityLogs,
    updateBookingStatus,
    addBooking,
  } = useApp();

  const activeDepot = depots.find((d) => d.id === selectedDepotId);
  const activeBays = bays.filter((b) => b.depotId === selectedDepotId);
  const activeBookings = bookings.filter((b) => b.depotId === selectedDepotId);

  // Filtra le prenotazioni per lo stato
  const incomingBookings = activeBookings.filter((b) => b.status === 'PRENOTATO');
  const gateBookings = activeBookings.filter((b) => b.status === 'AL_CANCELLO');
  const activeLogs = activityLogs.filter((l) => l.depotId === selectedDepotId);

  // Stati per la registrazione manuale al gate (camion non prenotati o inserimento rapido)
  const [manualPlate, setManualPlate] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const [manualCarrierId, setManualCarrierId] = useState(carriers[0]?.id || '');
  const [manualActivity, setManualActivity] = useState<'CARICO' | 'SCARICO'>('CARICO');
  
  // Stato per l'assegnazione temporanea della baia in UI
  const [tempBayAssignment, setTempBayAssignment] = useState<{ [bookingId: string]: string }>({});

  const handleRegisterManualArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver) return;

    // Crea una prenotazione al momento (in stato PRENOTATO)
    // Usiamo una data di oggi
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Per simularlo come arrivato direttamente, lo creiamo come PRENOTATO e lo passiamo subito AL_CANCELLO
    // Aggiungiamo direttamente
    addBooking(selectedDepotId, todayStr, manualActivity, manualPlate, manualDriver);
    
    // Resetta form
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
    
    // Pulisci l'assegnazione temporanea
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

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // MONITOR MONITORAGGIO LIVE PIAZZALE (YARD)
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Punto di controllo operativo: {activeDepot?.name} ({activeDepot?.city})
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="success">Stazione Attiva</Badge>
          <Badge variant="primary">
            {activeBays.filter((b) => b.status === 'DISPONIBILE').length} / {activeBays.length} Baie Libere
          </Badge>
        </div>
      </div>

      {/* Sezione 1: Visualizzazione Grafica Baie (HUD) */}
      <Card title="Stato Occupazione Baie Carico/Scarico" accent="orange">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeBays.map((bay) => {
            // Trova la prenotazione attiva in questa baia
            const activeBooking = activeBookings.find(
              (b) => b.status === 'IN_BAIA' && b.bayId === bay.id
            );
            const carrierName = activeBooking
              ? carriers.find((c) => c.id === activeBooking.carrierId)?.name
              : '';

            return (
              <div
                key={bay.id}
                className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between min-h-[160px] ${
                  bay.status === 'DISPONIBILE'
                    ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                    : bay.status === 'OCCUPATA'
                    ? 'border-[#11BCEC]/30 bg-[#11BCEC]/5 hover:border-[#11BCEC] shadow-2xs'
                    : 'border-red-200 bg-red-50/30 hover:border-red-400'
                }`}
              >
                {/* Header Baia */}
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="font-mono font-bold text-sm text-black">{bay.name}</span>
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

                {/* Body Baia (Dettagli veicolo occupante) */}
                <div className="py-3 flex-grow">
                   {bay.status === 'OCCUPATA' && activeBooking ? (
                    <div className="font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-ticket-muted">Targa:</span>
                        <span className="font-bold text-ticket-accent">{activeBooking.licensePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ticket-muted">Vettore:</span>
                        <span className="truncate max-w-[140px] text-right font-bold">{carrierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ticket-muted">Tipo:</span>
                        <span className="font-bold">{activeBooking.activityType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ticket-muted">Ingresso:</span>
                        <span className="text-amber-600 font-bold">{formatTime(activeBooking.timeInBay)}</span>
                      </div>
                    </div>
                  ) : bay.status === 'MANUTENZIONE' ? (
                    <div className="text-center py-4 text-xs font-mono text-red-500 font-bold">
                      // BAIA FUORI SERVIZIO
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
                    Rilascia e Completa
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sezione Sinistra: Check-In Cancello e Registrazione Manuale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Coda al Cancello (In Attesa di Assegnazione Baia) */}
          <Card title="Coda Check-In al Cancello (Attesa Baia)" accent="yellow">
            <Table
              data={gateBookings}
              emptyMessage="Nessun camion in attesa al cancello."
              columns={[
                {
                  header: 'Arrivo',
                  accessor: (b) => <span className="text-amber-600 font-bold">{formatTime(b.timeInGate)}</span>,
                },
                {
                  header: 'Targa / Autista',
                  accessor: (b) => (
                    <div>
                      <span className="font-bold">{b.licensePlate}</span>
                      <span className="text-xs text-ticket-muted ml-2">({b.driverName})</span>
                    </div>
                  ),
                },
                {
                  header: 'Attività',
                  accessor: (b) => (
                    <Badge variant={b.activityType === 'CARICO' ? 'primary' : 'warning'}>
                      {b.activityType}
                    </Badge>
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
                          <option value="">Seleziona...</option>
                          {availableBays.map((bay) => (
                            <option key={bay.id} value={bay.id}>
                              {bay.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleAssignBay(b.id)}
                          disabled={!tempBayAssignment[b.id]}
                        >
                          Assegna
                        </Button>
                      </div>
                    );
                  },
                },
              ]}
            />
          </Card>

          {/* Camion in Arrivo (Prenotati per Oggi) */}
          <Card title="Prenotazioni Programmate (Attese in Data Odierna)">
            <Table
              data={incomingBookings}
              emptyMessage="Nessuna prenotazione programmata per oggi."
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
                      <span className="font-mono">{b.licensePlate}</span>
                      <span className="text-xs text-ticket-muted ml-2">({b.driverName})</span>
                    </div>
                  ),
                },
                {
                  header: 'Attività',
                  accessor: (b) => (
                    <Badge variant={b.activityType === 'CARICO' ? 'primary' : 'warning'}>
                      {b.activityType}
                    </Badge>
                  ),
                },
                {
                  header: 'Azioni Guardia',
                  accessor: (b) => (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAcceptAtGate(b.id)}
                    >
                      Registra Arrivo
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>

        {/* Sezione Destra: Registrazione Arrivo non Prenotato (Accettazione Rapida) */}
        <div className="space-y-6">
          <Card title="Accettazione Rapida (Senza Prenotazione)" accent="orange">
            <form onSubmit={handleRegisterManualArrival} className="space-y-4">
              <Select
                label="Vettore Selezionato"
                options={carriers.filter(c => c.status === 'APPROVATO').map((c) => ({ value: c.id, label: c.name }))}
                value={manualCarrierId}
                onChange={(e) => setManualCarrierId(e.target.value)}
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
                label="Attività di Cantiere"
                options={[
                  { value: 'CARICO', label: 'Carico Merce' },
                  { value: 'SCARICO', label: 'Scarico Merce' },
                ]}
                value={manualActivity}
                onChange={(e) => setManualActivity(e.target.value as any)}
              />
              <Button type="submit" variant="primary" className="w-full">
                Accetta al Cancello
              </Button>
            </form>
          </Card>

          {/* Registro Log delle Attività Recenti dell'Hub */}
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
    </div>
  );
};
