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
    <div className="w-full overflow-x-auto border border-black/10 rounded-xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-black/10">
            {columns.map((col, index) => (
              <th
                key={index}
                className={`p-3 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 font-mono text-[11px]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/30 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`p-3 text-black ${col.className || ''}`}>
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
