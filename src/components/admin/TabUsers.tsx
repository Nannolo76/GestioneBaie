import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabUsersProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabUsers: React.FC<TabUsersProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { users, depots, addUser, deleteUser, currentUser } = useApp();

  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO'>('OPERATORE_YARD');
  const [newUserDepotIds, setNewUserDepotIds] = useState<string[]>([]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserEmail || newUserDepotIds.length === 0) return;
    
    // Simulate sending email to User
    console.log(`Simulated Email Sent to ${newUserEmail} for account creation.`);
    
    addUser(newUserName, newUserEmail, newUserRole, newUserDepotIds[0], newUserDepotIds, newUserUsername);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserRole('OPERATORE_YARD');
    setNewUserDepotIds([]);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare l'utente "${name}"?`,
      onConfirm: () => deleteUser(id)
    });
  };

  return ( <>
{/* --- TAB: UTENTI E PERMESSI --- */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Crea Utente Interno" accent="orange">
              <form onSubmit={handleAddUser} className="space-y-4">
                <Input
                  label="Nome Completo *"
                  placeholder="Es. Fabio Neri"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <Input
                  label="Username di Accesso *"
                  placeholder="Es. f.neri"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  required
                />
                <Input
                  label="E-mail Aziendale *"
                  type="email"
                  placeholder="f.neri@logisticauno.it"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
                <Select
                  label="Ruolo Organizzativo"
                  options={[
                    { value: 'ADMIN', label: 'Amministratore di Sistema' },
                    { value: 'OPERATORE_YARD', label: 'Operatore Yard' },
                    { value: 'GUARDIA_CANCELLO', label: 'Guardia Cancello (Guardiola)' },
                    { value: 'PREPOSTO', label: 'Preposto Magazzino (Qualità)' }
                  ]}
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase">Stabilimenti Attivi e Visibili *</label>
                  <div className="bg-white border border-black/10 rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto">
                    {depots.map((d) => {
                      const checked = newUserDepotIds.includes(d.id);
                      return (
                        <label key={d.id} className="flex items-center space-x-2 text-xs font-medium text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setNewUserDepotIds((prev) => prev.filter((id) => id !== d.id));
                              } else {
                                setNewUserDepotIds((prev) => [...prev, d.id]);
                              }
                            }}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                          <span>{d.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Crea Utente
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Registro Utenti Interni & Ruoli">
              <Table
                data={users}
                columns={[
                  {
                    header: 'Nome Utente',
                    accessor: (u) => (
                      <div className="font-bold text-black">
                        {u.name}
                        <div className="text-[10px] text-ticket-muted font-mono uppercase">User: {u.username}</div>
                        <div className="text-[10px] text-ticket-muted font-normal lowercase">{u.email}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Stabilimenti Assegnati',
                    accessor: (u) => {
                      const depotNames = u.depotIds && u.depotIds.length > 0 
                        ? u.depotIds.map((id: string) => depots.find((d) => d.id === id)?.name || id).join(', ') 
                        : (depots.find((d) => d.id === u.depotId)?.name || 'Nessuno');
                      return <span className="text-xs uppercase break-words block max-w-[180px]">{depotNames}</span>;
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
                            : u.role === 'PREPOSTO'
                            ? 'info'
                            : 'primary'
                        }
                      >
                        {u.role.replace('_', ' ')}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Stato Attivazione',
                    accessor: (u) => {
                      const statusColors = {
                        PENDING_CONFIRMATION: 'danger' as const,
                        FIRST_ACCESS: 'warning' as const,
                        ACTIVE: 'success' as const
                      };
                      const statusLabels = {
                        PENDING_CONFIRMATION: 'In attesa conferma mail',
                        FIRST_ACCESS: 'Primo accesso (creazione password)',
                        ACTIVE: 'Attivo / Pronto'
                      };
                      return (
                        <Badge variant={statusColors[u.status] || 'info'}>
                          {statusLabels[u.status] || u.status || 'ATTIVO'}
                        </Badge>
                      );
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (u) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'user',
                            id: u.id,
                            fields: {
                              name: u.name,
                              username: u.username || '',
                              email: u.email,
                              role: u.role,
                              depotIds: u.depotIds || (u.depotId ? [u.depotId] : [])
                            }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === currentUser?.id}
                        >
                          Elimina
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
</>
  );
};
