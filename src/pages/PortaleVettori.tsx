import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';

export const PortaleVettori: React.FC = () => {
  const {
    depots,
    carriers,
    bookings,
    bays,
    activityTypes,
    bayUsages,
    currentCarrierId,
    addBooking,
    updateBookingStatus,
    updateCarrierProfile,
  } = useApp();

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Booking
  const [targetDepotId, setTargetDepotId] = useState(depots[0]?.id || '');
  const [targetDate, setTargetDate] = useState('');
  const [selectedActivityCode, setSelectedActivityCode] = useState(activityTypes[0]?.code || 'SCARICO');
  const [licensePlate, setLicensePlate] = useState('');
  const [licensePlateTrailer, setLicensePlateTrailer] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [palletPlaces, setPalletPlaces] = useState<number | ''>('');
  
  // Patente e Ordine Cliente
  const [driverLicense, setDriverLicense] = useState('');
  const [driverLicenseRelease, setDriverLicenseRelease] = useState('');
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderNumber2, setOrderNumber2] = useState('');
  const [clientUsageId, setClientUsageId] = useState('');

  // Form Profilo
  const loggedInCarrier = carriers.find((c) => c.id === currentCarrierId);
  const [profEmail, setProfEmail] = useState(loggedInCarrier?.email || '');
  const [profPhone, setProfPhone] = useState(loggedInCarrier?.phone || '');
  const [profPlate, setProfPlate] = useState(loggedInCarrier?.licensePlate || '');
  const [profPlateTrailer, setProfPlateTrailer] = useState(loggedInCarrier?.licensePlateTrailer || '');
  const [profSuccess, setProfSuccess] = useState(false);

  if (!loggedInCarrier) {
    return (
      <Card title="Portale Vettori" accent="red">
        <div className="p-4 text-center font-mono">
          Nessun vettore autenticato. Effettua il login come Vettore.
        </div>
      </Card>
    );
  }

  const isApproved = loggedInCarrier.status === 'APPROVATO';
  const myBookings = bookings.filter((b) => b.carrierId === loggedInCarrier.id);

  // Controlli in tempo reale
  const normalizedPlate = licensePlate.replace(/\s+/g, '').toUpperCase();
  const normalizedTrailer = licensePlateTrailer.replace(/\s+/g, '').toUpperCase();

  const isPlateDuplicate = normalizedPlate !== '' && carriers.some(
    (c) => c.id !== loggedInCarrier.id && c.licensePlate?.replace(/\s+/g, '').toUpperCase() === normalizedPlate
  );

  const isLicenseExpired = driverLicenseExpiry !== '' && new Date(driverLicenseExpiry) < new Date();

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!targetDepotId || !targetDate || !licensePlate || !driverName || !orderNumber) {
      setFormError('Tutti i campi contrassegnati con (*) sono obbligatori.');
      return;
    }

    addBooking(
      targetDepotId,
      targetDate,
      selectedActivityCode,
      normalizedPlate,
      driverName,
      driverPhone || undefined,
      notes || undefined,
      palletPlaces ? Number(palletPlaces) : undefined,
      driverLicense || undefined,
      driverLicenseRelease || undefined,
      orderNumber,
      clientUsageId || undefined,
      normalizedTrailer || undefined,
      driverLicenseExpiry || undefined,
      orderNumber2 || undefined
    );

    setSuccessMsg('Richiesta slot registrata con successo.');
    setLicensePlate('');
    setLicensePlateTrailer('');
    setPalletPlaces('');
    setDriverName('');
    setDriverPhone('');
    setNotes('');
    setDriverLicense('');
    setDriverLicenseRelease('');
    setDriverLicenseExpiry('');
    setOrderNumber('');
    setOrderNumber2('');
    setClientUsageId('');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfSuccess(false);
    if (!profEmail) return;
    updateCarrierProfile(loggedInCarrier.id, profEmail, profPlate || undefined, profPhone || undefined, profPlateTrailer || undefined);
    setProfSuccess(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Sei sicuro di voler annullare questo slot prenotato?')) {
      updateBookingStatus(bookingId, 'ANNULLATO');
    }
  };

  if (!isApproved) {
    return (
      <Card title="Portale Accesso Vettori" accent="red">
        <div className="p-4 text-center font-mono space-y-4">
          <div className="text-red-500 font-bold text-lg uppercase">
            // ACCESSO NEGATO
          </div>
          <p className="text-black">
            Il vettore selezionato ({loggedInCarrier.name}) non è ancora approvato o è stato rifiutato dall'amministrazione.
          </p>
          <p className="text-xs text-ticket-muted">
            Utilizza la console di simulazione per passare ad un utente approvato o approva questo vettore nella scheda Amministratore.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Intestazione */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // AREA RISERVATA VETTORE: {loggedInCarrier.name.toUpperCase()}
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Registrazione slot di carico/scarico e gestione dell'anagrafica aziendale
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-ticket-muted uppercase">Cod. Vettore: </span>
          <Badge variant="success">{loggedInCarrier.id}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sinistra: Form Prenotazione & Form Profilo */}
        <div className="space-y-6">
          <Card title="Richiedi Prenotazione Slot" accent="orange">
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
                label="Stabilimento di Destinazione (Plant) *"
                options={depots.map((d) => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                value={depots.find(d => d.id === targetDepotId)?.name || targetDepotId}
                onChange={(e) => {
                  const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                  if (found) setTargetDepotId(found.id);
                }}
              />

              <Input
                label="Data Target Consegna *"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <Select
                label="Tipo di Attività *"
                options={activityTypes.map(act => ({ value: act.code, label: act.name }))}
                value={activityTypes.find(a => a.code === selectedActivityCode)?.name || selectedActivityCode}
                onChange={(e) => {
                  const found = activityTypes.find(a => a.name === e.target.value || a.code === e.target.value);
                  if (found) setSelectedActivityCode(found.code);
                }}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Input
                    label="Targa Trattore *"
                    placeholder="Es. AA123BB"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.replace(/\s+/g, '').toUpperCase())}
                    required
                  />
                  {isPlateDuplicate && (
                    <span className="text-[9px] text-amber-600 block font-bold leading-tight">
                      ⚠️ Targa già associata ad altro vettore!
                    </span>
                  )}
                </div>
                <Input
                  label="Targa Rimorchio"
                  placeholder="Es. CC789DD"
                  value={licensePlateTrailer}
                  onChange={(e) => setLicensePlateTrailer(e.target.value.replace(/\s+/g, '').toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Nominativo Autista *"
                  placeholder="Es. Mario Rossi"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
                <Input
                  label="Posti Pallet (PL) *"
                  type="number"
                  placeholder="Es. 33"
                  value={palletPlaces === '' ? '' : palletPlaces}
                  onChange={(e) => setPalletPlaces(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Cliente / Uso Baia"
                  options={[{ value: '', label: 'Nessun uso specifico' }, ...bayUsages.map(u => ({ value: u.id, label: u.name }))]}
                  value={bayUsages.find(u => u.id === clientUsageId)?.name || clientUsageId}
                  onChange={(e) => {
                    const found = bayUsages.find(u => u.name === e.target.value || u.id === e.target.value);
                    setClientUsageId(found ? found.id : e.target.value);
                  }}
                />
                <Input
                  label="Telefono Autista"
                  placeholder="Es. 3331234567"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Rif. Carico 1 (Ord.) *"
                  placeholder="Es. ORD-10293"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
                <Input
                  label="Rif. Carico 2"
                  placeholder="Es. ORD-10294"
                  value={orderNumber2}
                  onChange={(e) => setOrderNumber2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Patente Autista"
                  placeholder="U19283"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value)}
                />
                <Input
                  label="Rilascio"
                  type="date"
                  value={driverLicenseRelease}
                  onChange={(e) => setDriverLicenseRelease(e.target.value)}
                />
                <div className="space-y-1">
                  <Input
                    label="Scadenza"
                    type="date"
                    value={driverLicenseExpiry}
                    onChange={(e) => setDriverLicenseExpiry(e.target.value)}
                  />
                  {isLicenseExpired && (
                    <span className="text-[9px] text-red-600 block font-bold leading-tight animate-pulse-glow">
                      ⚠️ SCADUTA!
                    </span>
                  )}
                </div>
              </div>

              <Input
                label="Note Operative / Particolari"
                placeholder="Es. Sponda idraulica, merce fresca..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button type="submit" className="w-full">
                Registra Prenotazione
              </Button>
            </form>
          </Card>

          {/* Registrazione Anagrafica Vettore */}
          <Card title="Profilo Anagrafico Vettore" accent="yellow">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profSuccess && (
                <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-600 font-mono text-xs rounded-lg">
                  Profilo aggiornato con successo.
                </div>
              )}

              <Input
                label="Ragione Sociale Vettore"
                value={loggedInCarrier.name}
                disabled
              />

              <Input
                label="Partita IVA / P.IVA"
                value={loggedInCarrier.vatNumber || 'Nessuna P.IVA'}
                disabled
              />

              <Input
                label="Email Contatto *"
                type="email"
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                required
              />

              <Input
                label="Telefono Referente"
                placeholder="Es. +39 02 123456"
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Trattore Predefinito"
                  placeholder="Es. AA123BB"
                  value={profPlate}
                  onChange={(e) => setProfPlate(e.target.value.replace(/\s+/g, '').toUpperCase())}
                />
                <Input
                  label="Rimorchio Predefinito"
                  placeholder="Es. CC789DD"
                  value={profPlateTrailer}
                  onChange={(e) => setProfPlateTrailer(e.target.value.replace(/\s+/g, '').toUpperCase())}
                />
              </div>

              <Button type="submit" variant="warning" className="w-full">
                Aggiorna Anagrafica
              </Button>
            </form>
          </Card>
        </div>

        {/* Destra: Elenco Prenotazioni Storiche del Vettore */}
        <div className="lg:col-span-2">
          <Card title="Storico Prenotazioni Slot Vettore">
            <Table
              data={myBookings}
              emptyMessage="Nessuna prenotazione inserita da questo vettore."
              columns={[
                {
                  header: 'Ticket',
                  accessor: (b) => {
                    const isAnyIncomplete = !b.orderNumber || !b.driverLicense || !b.driverLicenseRelease || !b.driverLicenseExpiry || !b.clientUsageId;
                    const isExpired = b.driverLicenseExpiry && new Date(b.driverLicenseExpiry) < new Date();
                    return (
                      <div className="flex flex-col items-start gap-1 font-mono">
                        <span className="font-bold text-xs bg-gray-100 border border-black/10 px-2 py-0.5 rounded text-gray-800">
                          {b.ticketNumber || 'N/D'}
                        </span>
                        {isAnyIncomplete && (
                          <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded" title="Patente o Numero Ordine mancante">
                            ⚠️ INCOMPLETO
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1 py-0.5 rounded animate-pulse-glow" title="Patente autista scaduta">
                            ⚠️ SCADUTA
                          </span>
                        )}
                      </div>
                    );
                  }
                },
                {
                  header: 'Data Slot',
                  accessor: (b) => <span className="font-bold">{b.date}</span>,
                },
                {
                  header: 'Plant Destinazione',
                  accessor: (b) => {
                    const depotName = depots.find((d) => d.id === b.depotId)?.name || 'Magazzino';
                    return <span className="text-xs uppercase">{depotName}</span>;
                  },
                },
                {
                  header: 'Veicolo / Autista',
                  accessor: (b) => {
                    const usageName = bayUsages.find(u => u.id === b.clientUsageId)?.name || 'Generico';
                    return (
                      <div className="text-xs">
                        <div className="font-bold font-mono text-black">
                          TR: {b.licensePlate} 
                          {b.licensePlateTrailer && <span className="text-gray-400 font-normal"> (RIM: {b.licensePlateTrailer})</span>}
                          {b.palletPlaces && <span className="text-[10px] text-[#11BCEC] font-sans ml-1">({b.palletPlaces} PL)</span>}
                        </div>
                        <div className="text-ticket-muted mt-0.5">
                          {b.driverName} {b.driverPhone && <span className="text-[10px] font-mono">({b.driverPhone})</span>}
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                          Uso: {usageName} | Ord. 1: {b.orderNumber || 'N/D'} {b.orderNumber2 && `| Ord. 2: ${b.orderNumber2}`}
                        </div>
                        {b.notes && <div className="text-[10px] italic text-gray-400 truncate max-w-[150px] mt-0.5">{b.notes}</div>}
                      </div>
                    );
                  },
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
                    return <span className="text-xs text-ticket-muted font-mono">In Corso...</span>;
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
