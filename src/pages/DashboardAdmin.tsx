import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

// Mock per utenti interni
interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO';
  depotId: string;
}

export const DashboardAdmin: React.FC<{ defaultTab?: 'hubs' | 'users' | 'carriers' }> = ({ defaultTab = 'hubs' }) => {
  const {
    depots,
    bays,
    carriers,
    addDepot,
    addBay,
    updateBayStatus,
    approveCarrier,
    rejectCarrier,
  } = useApp();

  // Tab locale per separare i pannelli admin
  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers'>(defaultTab);

  // Stato per form Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState('');

  // Stato per form Baia
  const [selectedHubForBay, setSelectedHubForBay] = useState(depots[0]?.id || '');
  const [newBayName, setNewBayName] = useState('');

  // Mock stato utenti interni (modificabile localmente)
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([
    { id: 'user-1', name: 'Alessandro Neri', email: 'a.neri@logisticauno.it', role: 'ADMIN', depotId: 'depot-milano' },
    { id: 'user-2', name: 'Fabio Gialli', email: 'f.gialli@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-milano' },
    { id: 'user-3', name: 'Roberto Verdi', email: 'r.verdi@logisticauno.it', role: 'OPERATORE_YARD', depotId: 'depot-roma' },
    { id: 'user-4', name: 'Sara Rossi', email: 's.rossi@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-bari' },
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO'>('GUARDIA_CANCELLO');
  const [newUserDepot, setNewUserDepot] = useState(depots[0]?.id || '');

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity) return;
    addDepot(newHubName, newHubCity);
    setNewHubName('');
    setNewHubCity('');
  };

  const handleAddBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBayName || !selectedHubForBay) return;
    addBay(selectedHubForBay, newBayName);
    setNewBayName('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser: InternalUser = {
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      depotId: newUserDepot,
    };
    setInternalUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleChangeUserRole = (userId: string, role: InternalUser['role']) => {
    setInternalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Pagina */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // PANNELLO DI CONTROLLO AMMINISTRATORE
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Configurazione di sistema, gestione accessi utenti e anagrafica vettori
          </p>
        </div>
      </div>

      {/* Sotto-Navigazione Amministrativa */}
      <div className="flex space-x-2 border-b border-black/10 pb-px font-mono">
        <button
          onClick={() => setAdminTab('hubs')}
          className={`px-4 py-2 text-[10px] font-bold uppercase transition-all border-b-2 rounded-t-lg ${
            adminTab === 'hubs'
              ? 'border-ticket-accent text-ticket-accent bg-white/50'
              : 'border-transparent text-ticket-muted hover:text-ticket-fg hover:bg-white/20'
          }`}
        >
          [ HUB & BAIE ]
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 text-[10px] font-bold uppercase transition-all border-b-2 rounded-t-lg ${
            adminTab === 'users'
              ? 'border-ticket-accent text-ticket-accent bg-white/50'
              : 'border-transparent text-ticket-muted hover:text-ticket-fg hover:bg-white/20'
          }`}
        >
          [ UTENTI & PERMESSI ]
        </button>
        <button
          onClick={() => setAdminTab('carriers')}
          className={`px-4 py-2 text-[10px] font-bold uppercase transition-all border-b-2 rounded-t-lg ${
            adminTab === 'carriers'
              ? 'border-ticket-accent text-ticket-accent bg-white/50'
              : 'border-transparent text-ticket-muted hover:text-ticket-fg hover:bg-white/20'
          }`}
        >
          [ APPROVAZIONE VETTORI ({carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE').length}) ]
        </button>
      </div>

      {/* --- PANNELLO HUB & BAIE --- */}
      {adminTab === 'hubs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sezione Sinistra: Form Creazione Hub e Form Creazione Baia */}
          <div className="space-y-6">
            <Card title="Nuovo Hub (Magazzino)" accent="orange">
              <form onSubmit={handleAddHub} className="space-y-4">
                <Input
                  label="Nome Hub Logistico"
                  placeholder="Es. Milano Ovest Hub"
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  required
                />
                <Input
                  label="Città / Provincia"
                  placeholder="Es. Lainate (MI)"
                  value={newHubCity}
                  onChange={(e) => setNewHubCity(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" className="w-full">
                  Registra Magazzino
                </Button>
              </form>
            </Card>

            <Card title="Aggiungi Baia di Carico" accent="yellow">
              <form onSubmit={handleAddBay} className="space-y-4">
                <Select
                  label="Seleziona Hub Destinazione"
                  options={depots.map((d) => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={selectedHubForBay}
                  onChange={(e) => setSelectedHubForBay(e.target.value)}
                />
                <Input
                  label="Identificativo Baia"
                  placeholder="Es. Baia M-05"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  required
                />
                <Button type="submit" variant="warning" className="w-full">
                  Crea Baia
                </Button>
              </form>
            </Card>
          </div>

          {/* Sezione Destra: Elenco Hub e relative baie */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Configurazione Attuale Magazzini & Baie">
              <div className="space-y-6">
                {depots.map((depot) => {
                  const depotBays = bays.filter((b) => b.depotId === depot.id);
                  return (
                    <div key={depot.id} className="border border-black/10 rounded-lg p-4 bg-white/40 mb-4">
                      <div className="flex justify-between items-center border-b border-black/10 pb-2 mb-3">
                        <div className="font-sans">
                          <span className="text-ticket-accent font-bold uppercase">{depot.name}</span>
                          <span className="text-xs text-ticket-muted ml-2">({depot.city})</span>
                        </div>
                        <Badge variant="primary">{depotBays.length} Baie Totali</Badge>
                      </div>

                      {depotBays.length === 0 ? (
                        <p className="text-xs font-mono text-ticket-muted uppercase">Nessuna baia configurata per questo Hub.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {depotBays.map((bay) => (
                            <div
                              key={bay.id}
                              className="border border-black/10 rounded-lg p-2 bg-white flex flex-col justify-between h-20 shadow-2xs"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-xs font-bold text-ticket-fg">{bay.name}</span>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    bay.status === 'DISPONIBILE'
                                      ? 'bg-ticket-success'
                                      : bay.status === 'OCCUPATA'
                                      ? 'bg-ticket-warning animate-pulse-glow'
                                      : 'bg-ticket-error'
                                  }`}
                                />
                              </div>
                              <select
                                value={bay.status}
                                onChange={(e) => updateBayStatus(bay.id, e.target.value as any)}
                                className="bg-gray-50 border border-black/10 text-[9px] text-black font-mono p-1 mt-1 rounded-sm focus:ring-0 focus:outline-none cursor-pointer"
                              >
                                <option value="DISPONIBILE">Libera</option>
                                <option value="OCCUPATA" disabled>Occupata</option>
                                <option value="MANUTENZIONE">In Manutenzione</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* --- PANNELLO UTENTI & PERMESSI --- */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Aggiungi Utente Interno" accent="orange">
            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                label="Nome & Cognome"
                placeholder="Es. Mario Rossi"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <Input
                label="Email Aziendale"
                type="email"
                placeholder="m.rossi@logisticauno.it"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <Select
                label="Ruolo Operativo"
                options={[
                  { value: 'ADMIN', label: 'Amministratore' },
                  { value: 'OPERATORE_YARD', label: 'Operatore Yard (Magazzino)' },
                  { value: 'GUARDIA_CANCELLO', label: 'Guardia del Cancello Check-In' },
                ]}
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
              />
              <Select
                label="Assegnato a Hub"
                options={depots.map((d) => ({ value: d.id, label: d.name }))}
                value={newUserDepot}
                onChange={(e) => setNewUserDepot(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full">
                Abilita Utente
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            <Card title="Registro Utenti Interni & Ruoli">
              <Table
                data={internalUsers}
                columns={[
                  {
                    header: 'Nome Utente',
                    accessor: (u) => (
                      <div className="font-bold text-black">
                        {u.name}
                        <div className="text-[10px] text-ticket-muted font-normal lowercase">{u.email}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Magazzino Assegnato',
                    accessor: (u) => {
                      const depotName = depots.find((d) => d.id === u.depotId)?.name || 'Tutti';
                      return <span className="text-xs uppercase">{depotName}</span>;
                    },
                  },
                  {
                    header: 'Permessi / Ruolo',
                    accessor: (u) => (
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'warning'
                            : u.role === 'OPERATORE_YARD'
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {u.role.replace('_', ' ')}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Azioni Cambio Ruolo',
                    accessor: (u) => (
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                        className="bg-white border border-black/10 text-xs text-black font-mono p-1 rounded-md focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="ADMIN">Amministratore</option>
                        <option value="OPERATORE_YARD">Operatore Yard</option>
                        <option value="GUARDIA_CANCELLO">Guardia Cancello</option>
                      </select>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- PANNELLO APPROVAZIONE VETTORI --- */}
      {adminTab === 'carriers' && (
        <div className="space-y-6">
          {/* Sezione Richieste in Attesa */}
          <Card title="Richieste Registrazione Vettori (Approvazione Manuale)" accent="orange">
            <Table
              data={carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE')}
              emptyMessage="Nessun vettore in attesa di approvazione."
              columns={[
                {
                  header: 'Nome Vettore',
                  accessor: (c) => <span className="font-bold text-ticket-accent">{c.name}</span>,
                },
                {
                  header: 'Email Operativa',
                  accessor: (c) => <span className="text-black">{c.email}</span>,
                },
                {
                  header: 'Targa Principale',
                  accessor: (c) => (
                    <span className="font-mono text-xs font-bold border border-black/10 rounded-sm px-2 py-1 bg-gray-50">
                      {c.licensePlate || 'NON SPECIFICATA'}
                    </span>
                  ),
                },
                {
                  header: 'Stato',
                  accessor: () => <Badge variant="warning">In Attesa</Badge>,
                },
                {
                  header: 'Gestisci Richiesta',
                  accessor: (c) => (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveCarrier(c.id)}
                      >
                        Approva
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectCarrier(c.id)}
                      >
                        Rifiuta
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Sezione Elenco Vettori Approvati/Rifiutati */}
          <Card title="Anagrafica Storica Vettori">
            <Table
              data={carriers.filter((c) => c.status !== 'ATTESA_APPROVAZIONE')}
              columns={[
                {
                  header: 'Nome Vettore',
                  accessor: (c) => <span className="font-bold">{c.name}</span>,
                },
                {
                  header: 'Contatto Email',
                  accessor: (c) => <span>{c.email}</span>,
                },
                {
                  header: 'Stato Abilitazione',
                  accessor: (c) => (
                    <Badge variant={c.status === 'APPROVATO' ? 'success' : 'danger'}>
                      {c.status}
                    </Badge>
                  ),
                },
                {
                  header: 'Credenziali Generate',
                  accessor: (c) => (
                    <span className="text-xs text-ticket-muted font-mono">
                      {c.status === 'APPROVATO' ? `AUTO-USER-${c.id.toUpperCase()}` : 'N/A'}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
