import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabClientsProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabClients: React.FC<TabClientsProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { clients, depots, addClient, deleteClient } = useApp();

  const [newClientName, setNewClientName] = useState('');
  const [newClientVat, setNewClientVat] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDefaultDepotId, setNewClientDefaultDepotId] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    addClient(newClientName, newClientVat, newClientEmail, newClientDefaultDepotId);
    setNewClientName('');
    setNewClientVat('');
    setNewClientEmail('');
    setNewClientDefaultDepotId('');
  };

  const handleDeleteClient = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare il cliente "${name}"?`,
      onConfirm: () => deleteClient(id)
    });
  };

  return ( <>
{/* --- TAB: GESTIONE CLIENTI --- */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Cliente Committente" accent="orange">
              <form onSubmit={handleAddClient} className="space-y-4">
                <Input
                  label="Ragione Sociale Cliente *"
                  placeholder="Es. Rossi SpA"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                />
                <Input
                  label="Partita IVA"
                  placeholder="Es. IT01234567890"
                  value={newClientVat}
                  onChange={(e) => setNewClientVat(e.target.value)}
                />
                <Input
                  label="E-mail Referente"
                  type="email"
                  placeholder="Es. logistica@cliente.it"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
                <Select
                  label="Hub di Default (Opzionale)"
                  options={[
                    { value: '', label: 'Nessun hub di default' },
                    ...depots.map(d => ({ value: d.id, label: d.name }))
                  ]}
                  value={depots.find(d => d.id === newClientDefaultDepotId)?.name || newClientDefaultDepotId}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    setNewClientDefaultDepotId(found ? found.id : e.target.value);
                  }}
                />
                <Button type="submit" className="w-full">
                  Registra Cliente
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Elenco Clienti Committenti Attivi">
              <Table
                data={clients}
                emptyMessage="Nessun cliente registrato."
                columns={[
                  {
                    header: 'Ragione Sociale',
                    accessor: (c) => <span className="font-bold text-xs">{c.name}</span>
                  },
                  {
                    header: 'Partita IVA',
                    accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>
                  },
                  {
                    header: 'E-mail Referente',
                    accessor: (c) => <span className="font-mono text-xs lowercase">{c.email || '-'}</span>
                  },
                  {
                    header: 'Hub di Default',
                    accessor: (c) => {
                      const matchedDepot = depots.find(d => d.id === c.defaultDepotId);
                      return <span className="font-semibold text-xs text-gray-700">{matchedDepot ? matchedDepot.name : '-'}</span>;
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (c) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'client',
                            id: c.id,
                            fields: { name: c.name, vatNumber: c.vatNumber || '', email: c.email || '', defaultDepotId: c.defaultDepotId || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteClient(c.id, c.name)}
                        >
                          Elimina
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
</>
  );
};
