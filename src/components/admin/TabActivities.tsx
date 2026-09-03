import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabActivitiesProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabActivities: React.FC<TabActivitiesProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { activityTypes, addActivityType, deleteActivityType } = useApp();

  const [newActName, setNewActName] = useState('');
  const [newActCode, setNewActCode] = useState('');
  const [newActBaseDuration, setNewActBaseDuration] = useState(15);
  const [newActMinPerPallet, setNewActMinPerPallet] = useState(2);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName || !newActCode) return;
    addActivityType(newActCode, newActName, newActBaseDuration, newActMinPerPallet);
    setNewActName('');
    setNewActCode('');
    setNewActBaseDuration(15);
    setNewActMinPerPallet(2);
  };

  const handleDeleteActivity = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare l'attività "${name}"?`,
      onConfirm: () => deleteActivityType(id)
    });
  };

  return ( <>
{/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Tipo Attività" accent="orange">
              <form onSubmit={handleAddActivity} className="space-y-4">
                <Input
                  label="Nome Attività *"
                  placeholder="Es. Carico Ortofrutta"
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  required
                />
                <Input
                  label="Codice Identificativo Attività *"
                  placeholder="Es. CARICO_ORTO"
                  value={newActCode}
                  onChange={(e) => setNewActCode(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Tempo Base (min) *"
                    type="number"
                    value={newActBaseDuration}
                    onChange={(e) => setNewActBaseDuration(Number(e.target.value))}
                    required
                  />
                  <Input
                    label="Minuti/Pallet (min) *"
                    type="number"
                    step="0.1"
                    value={newActMinPerPallet}
                    onChange={(e) => setNewActMinPerPallet(Number(e.target.value))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Crea Attività
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Tipologie di Attività Attive">
              <Table
                data={activityTypes}
                emptyMessage="Nessun tipo attività registrato."
                columns={[
                  {
                    header: 'Codice Attività',
                    accessor: (a) => <span className="font-mono font-bold text-xs text-ticket-accent">{a.code}</span>
                  },
                  {
                    header: 'Nome Visualizzato',
                    accessor: (a) => <span className="font-bold text-xs">{a.name}</span>
                  },
                  {
                    header: 'Tempo Base',
                    accessor: (a) => <span className="font-mono text-xs">{a.baseDurationMinutes} min</span>
                  },
                  {
                    header: 'Tempo per Pallet',
                    accessor: (a) => <span className="font-mono text-xs">{a.minutesPerPallet} min</span>
                  },
                  {
                    header: 'Azioni',
                    accessor: (a) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'activityType',
                            id: a.id,
                            fields: { name: a.name, code: a.code, baseDurationMinutes: a.baseDurationMinutes, minutesPerPallet: a.minutesPerPallet }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteActivity(a.id, a.name)}
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
