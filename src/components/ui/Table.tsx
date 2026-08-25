import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TableColumn<T> {
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
  expandableContent?: (row: T) => React.ReactNode;
}

export function Table<T>({ columns, data, emptyMessage = 'Nessun dato trovato', rowClassName, expandableContent }: TableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="w-full overflow-x-auto border border-black/10 rounded-xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-black/10">
            {expandableContent && (
              <th className="w-10 p-3"></th>
            )}
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
              <td colSpan={columns.length + (expandableContent ? 1 : 0)} className="p-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const customClass = rowClassName ? rowClassName(row) : '';
              const isExpanded = expandedRows.has(rowIndex);
              return (
                <React.Fragment key={rowIndex}>
                  <tr 
                    className={`transition-colors ${customClass} ${expandableContent ? 'cursor-pointer hover:bg-gray-50/50' : 'hover:bg-gray-50/30'}`}
                    onClick={() => expandableContent && toggleRow(rowIndex)}
                  >
                    {expandableContent && (
                      <td className="p-3 text-gray-400 w-10 text-center">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`p-3 text-black ${col.className || ''}`}>
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                  {expandableContent && isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={columns.length + 1} className="p-0 border-b border-black/5">
                        {expandableContent(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
