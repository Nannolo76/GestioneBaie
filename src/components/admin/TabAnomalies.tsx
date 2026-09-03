import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabAnomaliesProps {
  setActiveResolveAnomalyId: (id: string | null) => void;
  setResolveNotes: (notes: string) => void;
}

export const TabAnomalies: React.FC<TabAnomaliesProps> = ({ setActiveResolveAnomalyId, setResolveNotes }) => {
  const { anomalies, depots } = useApp();

  return ( <>
{/* --- TAB: GESTIONE ANOMALIE --- */}
      
        <div className="space-y-6 animate-fade-in">
          <Card title="Registro Storico delle Anomalie Yard (Tutti i Plant)">
            <p className="text-xs text-ticket-muted mb-4 font-mono uppercase">
              // CONSULTAZIONE E CONFERMA DEROGHE DA DIREZIONE O GUARDIOLA
            </p>
            <Table
              data={anomalies}
              emptyMessage="Nessuna anomalia o problematica registrata nei log."
              rowClassName={(a) => a.resolved ? 'opacity-60 bg-gray-50/50' : 'bg-rose-50/20 border-l-4 border-rose-500'}
              columns={[
                {
                  header: 'Data / Ora',
                  accessor: (a) => <span className="font-mono text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
                },
                {
                  header: 'Plant',
                  accessor: (a) => {
                    const dName = depots.find(d => d.id === a.depotId)?.name || 'Plant';
                    return <span className="text-xs font-bold uppercase">{dName}</span>;
                  }
                },
                {
                  header: 'Ticket / Targa',
                  accessor: (a) => (
                    <div className="font-mono text-xs">
                      {a.licensePlate && <div>Targa: <span className="font-bold">{a.licensePlate}</span></div>}
                      {a.ticketNumber && <div className="text-[10px] text-gray-400">Ticket: {a.ticketNumber}</div>}
                    </div>
                  )
                },
                {
                  header: 'Tipo Anomalia',
                  accessor: (a) => {
                    let color: 'danger' | 'warning' | 'info' | 'primary' = 'danger';
                    if (a.type === 'TARGA_DUPLICATA') color = 'warning';
                    if (a.type === 'SFORAMENTO_TEMPO') color = 'primary';
                    return <Badge variant={color}>{a.type.replace('_', ' ')}</Badge>;
                  }
                },
                {
                  header: 'Descrizione Problema',
                  accessor: (a) => <p className="text-xs max-w-[250px] whitespace-normal font-medium">{a.message}</p>
                },
                {
                  header: 'Stato / Risoluzione',
                  accessor: (a) => {
                    if (a.resolved) {
                      return (
                        <div className="text-[10px] font-sans text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                          <span className="font-bold">Risolta da:</span> {a.resolvedBy}
                          <div className="italic mt-0.5">Note: "{a.resolutionNotes}"</div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-1">
                        <Badge variant="danger">ATTIVA</Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setActiveResolveAnomalyId(a.id);
                            setResolveNotes('');
                          }}
                        >
                          Risolvi
                        </Button>
                      </div>
                    );
                  }
                }
              ]}
            />
          </Card>
        </div>
</>
  );
};
