import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage = 'Nessun dato trovato' }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-cyber-border bg-cyber-card">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cyber-bg border-b border-cyber-border">
            {columns.map((col, index) => (
              <th
                key={index}
                className={`p-3 text-xs font-mono font-bold uppercase tracking-wider text-cyber-orange ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cyber-border font-mono text-sm">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-cyber-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-cyber-card-hover transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`p-3 text-cyber-text ${col.className || ''}`}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
