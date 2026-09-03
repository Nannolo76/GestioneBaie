import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabReportsProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabReports: React.FC<TabReportsProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { reportSchedules, addReportSchedule, toggleReportSchedule, deleteReportSchedule } = useApp();

  const [newRepName, setNewRepName] = useState('');
  const [newRepFreq, setNewRepFreq] = useState<'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE'>('GIORNALIERO');
  const [newRepRecipients, setNewRepRecipients] = useState('');
  const [newRepType, setNewRepType] = useState('Saturazione Baie');

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName || !newRepRecipients) return;
    addReportSchedule(newRepName, newRepFreq, newRepRecipients, newRepType);
    setNewRepName('');
    setNewRepRecipients('');
  };

  const handleDeleteReport = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: `Sei sicuro di voler eliminare la pianificazione "${name}"?`,
      onConfirm: () => deleteReportSchedule(id)
    });
  };

  return ( <>
{/* --- TAB: SCHEDULATORE REPORT --- */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuova Pianificazione Report" accent="orange">
              <form onSubmit={handleAddReport} className="space-y-4">
                <Input
                  label="Nome Pianificazione *"
                  placeholder="Es. Report saturazione settimanale"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  required
                />
                <Select
                  label="Frequenza Invio"
                  options={[
                    { value: 'GIORNALIERO', label: 'Ogni Giorno alle 22:00' },
                    { value: 'SETTIMANALE', label: 'Ogni Lunedì alle 06:00' },
                    { value: 'MENSILE', label: 'Il 1° giorno del Mese alle 06:00' }
                  ]}
                  value={newRepFreq}
                  onChange={(e) => setNewRepFreq(e.target.value as any)}
                />
                <Input
                  label="Indirizzi Destinatari (Email) *"
                  placeholder="Es. ops@logisticauno.it, dir@..."
                  value={newRepRecipients}
                  onChange={(e) => setNewRepRecipients(e.target.value)}
                  required
                />
                <Select
                  label="Tipo di Reportistica"
                  options={[
                    { value: 'Saturazione Baie', label: 'Report di Saturazione Rampa' },
                    { value: 'Tempi Turnaround', label: 'Report Tempi di Permanenza Camion' },
                    { value: 'Esiti Checklist', label: 'Report Anomalie & Checklist Fallite' }
                  ]}
                  value={newRepType}
                  onChange={(e) => setNewRepType(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Pianifica Invio
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Pianificazioni Attive di Invio Report automatici">
              <Table
                data={reportSchedules}
                emptyMessage="Nessun invio programmato."
                columns={[
                  {
                    header: 'Identificativo Report',
                    accessor: (r) => <span className="font-bold text-xs">{r.name}</span>
                  },
                  {
                    header: 'Frequenza',
                    accessor: (r) => <Badge variant="info">{r.frequency}</Badge>
                  },
                  {
                    header: 'Destinatari (E-mail)',
                    accessor: (r) => <span className="font-mono text-xs">{r.recipients}</span>
                  },
                  {
                    header: 'Tipo Contenuto',
                    accessor: (r) => <span className="font-mono text-xs text-ticket-accent font-bold uppercase">{r.reportType}</span>
                  },
                  {
                    header: 'Stato',
                    accessor: (r) => <Badge variant={r.active ? 'success' : 'danger'}>{r.active ? 'ATTIVO' : 'DISATTIVATO'}</Badge>
                  },
                  {
                    header: 'Azioni',
                    accessor: (r) => (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant={r.active ? 'warning' : 'success'}
                          onClick={() => toggleReportSchedule(r.id)}
                        >
                          {r.active ? 'Disattiva' : 'Attiva'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'reportSchedule',
                            id: r.id,
                            fields: { name: r.name, frequency: r.frequency, recipients: r.recipients, reportType: r.reportType }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteReport(r.id, r.name)}
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
