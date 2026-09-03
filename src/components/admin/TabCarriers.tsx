import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabCarriersProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabCarriers: React.FC<TabCarriersProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { carriers, approveCarrier, rejectCarrier, deleteCarrier } = useApp();
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);

  const pendingCarriers = carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE');

  const handleBulkApprove = () => {
    selectedPendingIds.forEach(id => approveCarrier(id));
    setSelectedPendingIds([]);
  };

  const handleBulkReject = () => {
    selectedPendingIds.forEach(id => rejectCarrier(id));
    setSelectedPendingIds([]);
  };

  const handleDeleteCarrier = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare il vettore "${name}"? Questa azione è irreversibile.`,
      onConfirm: () => deleteCarrier(id)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card 
        title="Richieste di Registrazione Vettori (Attesa Approvazione)"
        headerAction={
          selectedPendingIds.length > 0 ? (
            <div className="flex space-x-2">
              <Button size="sm" variant="success" onClick={handleBulkApprove}>
                Approva ({selectedPendingIds.length})
              </Button>
              <Button size="sm" variant="danger" onClick={handleBulkReject}>
                Rifiuta ({selectedPendingIds.length})
              </Button>
            </div>
          ) : undefined
        }
      >
        <Table
          data={pendingCarriers}
          selectable
          selectedIds={selectedPendingIds}
          onSelectionChange={setSelectedPendingIds}
          keyExtractor={(c) => c.id}
          emptyMessage="Nessuna richiesta di approvazione pendente."
          columns={[
            {
              header: 'Ragione Sociale Vettore',
              accessor: (c) => <span className="font-bold text-xs uppercase">{c.name}</span>,
            },
            {
              header: 'Email Contatto',
              accessor: (c) => <span className="font-mono text-xs">{c.email}</span>,
            },
            {
              header: 'Partita IVA',
              accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>,
            },
            {
              header: 'Targa Trattore Pref.',
              accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || 'N/A'}</span>,
            },
            {
              header: 'Valida Accesso',
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

      <Card title="Anagrafica Vettori Accreditati a Portale">
        <Table
          data={carriers.filter((c) => c.status === 'APPROVATO')}
          emptyMessage="Nessun vettore registrato a sistema."
          columns={[
            {
              header: 'ID Vettore',
              accessor: (c) => <span className="font-mono font-bold text-xs text-ticket-accent">{c.id}</span>
            },
            {
              header: 'Ragione Sociale Vettore',
              accessor: (c) => <span className="font-bold text-xs text-black">{c.name}</span>,
            },
            {
              header: 'Partita IVA',
              accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>,
            },
            {
              header: 'Indirizzo E-mail',
              accessor: (c) => <span className="font-mono text-xs">{c.email}</span>,
            },
            {
              header: 'Targa default',
              accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || 'N/A'}</span>
            },
            {
              header: 'Stato Abilitazione',
              accessor: () => <Badge variant="success">ACCEDITATO</Badge>,
            },
            {
              header: 'Azioni',
              accessor: (c) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingItem({
                      type: 'carrier',
                      id: c.id,
                      fields: { name: c.name, email: c.email, vatNumber: c.vatNumber || '', licensePlate: c.licensePlate || '' }
                    })}
                  >
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteCarrier(c.id, c.name)}
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
  );
};
