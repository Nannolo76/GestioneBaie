import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabPalletTypesProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabPalletTypes: React.FC<TabPalletTypesProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { palletTypes, addPalletType, deletePalletType } = useApp();

  const [newPalletName, setNewPalletName] = useState('');
  const [newPalletDesc, setNewPalletDesc] = useState('');

  const handleAddPalletType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPalletName) return;
    addPalletType(newPalletName, newPalletDesc);
    setNewPalletName('');
    setNewPalletDesc('');
  };

  const handleDeletePalletType = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare la tipologia pallet "${name}"?`,
      onConfirm: () => deletePalletType(id)
    });
  };

  return ( <>
{/* --- TAB: TIPOLOGIE PALLET --- */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Aggiungi Tipologia Pallet" accent="orange">
              <form onSubmit={handleAddPalletType} className="space-y-4">
                <Input
                  label="Sigla / Codice Pallet *"
                  placeholder="Es. EPAL, CHEP, DUSSELDORF"
                  value={newPalletName}
                  onChange={(e) => setNewPalletName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione Tipologia"
                  placeholder="Es. Pallet in legno standard europeo"
                  value={newPalletDesc}
                  onChange={(e) => setNewPalletDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Aggiungi Pallet
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Tipologie Pallet (Legni) Abilitati">
              <Table
                data={palletTypes}
                emptyMessage="Nessun tipo pallet configurato."
                columns={[
                  {
                    header: 'Codice Pallet',
                    accessor: (p) => <span className="font-bold text-xs uppercase text-ticket-accent">{p.name}</span>
                  },
                  {
                    header: 'Descrizione',
                    accessor: (p) => <span className="text-xs text-gray-600">{p.description || '-'}</span>
                  },
                  {
                    header: 'Azioni',
                    accessor: (p) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'palletType',
                            id: p.id,
                            fields: { name: p.name, description: p.description || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeletePalletType(p.id, p.name)}
                        >
                          Rimuovi
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
