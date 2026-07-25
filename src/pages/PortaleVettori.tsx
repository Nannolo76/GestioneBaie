import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

export const PortaleVettori: React.FC = () => {
  const {
    currentCarrierId,
    carriers,
    depots,
    bookings,
    bays,
    addBooking,
    updateBookingStatus,
  } = useApp();

  const loggedInCarrier = carriers.find((c) => c.id === currentCarrierId);

  // Form states
  const [targetDepotId, setTargetDepotId] = useState(depots[0]?.id || '');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityType, setActivityType] = useState<'CARICO' | 'SCARICO'>('CARICO');
  const [licensePlate, setLicensePlate] = useState(loggedInCarrier?.licensePlate || '');
  const [driverName, setDriverName] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtra le prenotazioni del vettore corrente
  const myBookings = bookings.filter((b) => b.carrierId === currentCarrierId);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!targetDepotId || !targetDate || !licensePlate || !driverName) {
      setFormError('Compilare tutti i campi obbligatori.');
      return;
    }

    // Aggiungi la prenotazione nel context
    addBooking(targetDepotId, targetDate, activityType, licensePlate, driverName);
    setSuccessMsg('Prenotazione registrata con successo!');
    
    // Ripristina form (ma mantieni targa del vettore per comodità)
    setDriverName('');
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Confermi l\'annullamento di questa prenotazione?')) {
      updateBookingStatus(bookingId, 'ANNULLATO');
    }
  };

  if (!loggedInCarrier || loggedInCarrier.status !== 'APPROVATO') {
    return (
      <Card title="Portale Accesso Vettori" accent="red">
        <div className="p-4 text-center font-mono space-y-4">
          <div className="text-red-500 font-bold text-lg uppercase">
            // ACCESSO NEGATO
          </div>
          <p className="text-black">
            Il vettore selezionato ({loggedInCarrier?.name || 'Sconosciuto'}) non è ancora approvato o è stato rifiutato dall'amministrazione.
          </p>
          <p className="text-xs text-ticket-muted">
            Utilizza la console di simulazione a sinistra per passare ad un utente approvato o approva questo vettore nella scheda Amministratore.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // AREA RISERVATA VETTORE: {loggedInCarrier.name.toUpperCase()}
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Registrazione slot di carico/scarico e monitoraggio delle consegne attive
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-ticket-muted uppercase">Account ID: </span>
          <Badge variant="success">{loggedInCarrier.id}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sinistra: Form Prenotazione Slot */}
        <div>
          <Card title="Richiedi Nuovo Slot Prenotazione" accent="orange">
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {formError && (
                <div className="p-2 border border-red-200 bg-red-50 text-red-600 font-mono text-xs rounded-lg">
                  {formError}
                </div>
              )}
              {successMsg && (
                <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-600 font-mono text-xs rounded-lg">
                  {successMsg}
                </div>
              )}

              <Select
                label="Magazzino di Destinazione (Depot)"
                options={depots.map((d) => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                value={targetDepotId}
                onChange={(e) => setTargetDepotId(e.target.value)}
              />

              <Input
                label="Data Target Consegna"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <Select
                label="Tipo di Attività"
                options={[
                  { value: 'CARICO', label: 'CARICO MERCE (Ritiro)' },
                  { value: 'SCARICO', label: 'SCARICO MERCE (Consegna)' },
                ]}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
              />

              <Input
                label="Targa Automezzo"
                placeholder="Es. AA123BB"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
              />

              <Input
                label="Nominativo Autista"
                placeholder="Es. Mario Rossi"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="w-full">
                Invia Richiesta Prenotazione
              </Button>
            </form>
          </Card>
        </div>

        {/* Destra: Elenco Storico Prenotazioni Vettore */}
        <div className="lg:col-span-2">
          <Card title="Storico Prenotazioni & Stato in Tempo Reale">
            <Table
              data={myBookings}
              emptyMessage="Nessuna prenotazione inserita da questo vettore."
              columns={[
                {
                  header: 'Data Target',
                  accessor: (b) => <span className="font-bold">{b.date}</span>,
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
                  header: 'Destinazione',
                  accessor: (b) => {
                    const depotName = depots.find((d) => d.id === b.depotId)?.name || 'Magazzino';
                    return <span className="text-xs uppercase">{depotName}</span>;
                  },
                },
                {
                  header: 'Veicolo / Autista',
                  accessor: (b) => (
                    <div className="text-xs">
                      <div className="font-bold font-mono">{b.licensePlate}</div>
                      <div className="text-ticket-muted">{b.driverName}</div>
                    </div>
                  ),
                },
                {
                  header: 'Stato Operazione',
                  accessor: (b) => {
                    let badgeVar: 'info' | 'success' | 'warning' | 'danger' | 'primary' = 'info';
                    let label: string = b.status;
                    if (b.status === 'PRENOTATO') {
                      badgeVar = 'info';
                      label = 'PRENOTATO';
                    } else if (b.status === 'AL_CANCELLO') {
                      badgeVar = 'warning';
                      label = 'AL CANCELLO';
                    } else if (b.status === 'IN_BAIA') {
                      badgeVar = 'primary';
                      const bayName = bays.find((bay) => bay.id === b.bayId)?.name || 'Baia';
                      label = `IN BAIA (${bayName})`;
                    } else if (b.status === 'COMPLETATO') {
                      badgeVar = 'success';
                      label = 'COMPLETATO';
                    } else if (b.status === 'ANNULLATO') {
                      badgeVar = 'danger';
                      label = 'ANNULLATO';
                    }
                    return <Badge variant={badgeVar}>{label}</Badge>;
                  },
                },
                {
                  header: 'Gestisci',
                  accessor: (b) => {
                    if (b.status === 'PRENOTATO') {
                      return (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          Annulla
                        </Button>
                      );
                    }
                    return <span className="text-xs text-ticket-muted">In Corso...</span>;
                  },
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
