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
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  keyExtractor?: (row: T) => string;
}

function TableInner<T>({ 
  columns, 
  data, 
  emptyMessage = 'Nessun dato trovato', 
  rowClassName, 
  expandableContent,
  selectable,
  selectedIds = [],
  onSelectionChange,
  keyExtractor
}: TableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleSelectAll = () => {
    if (!onSelectionChange || !keyExtractor) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(keyExtractor));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

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
    <div className="w-full overflow-x-auto border border-black/10 rounded-xl bg-white shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-black/10">
            {selectable && (
              <th className="w-10 p-3 text-center">
                <input 
                  type="checkbox" 
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#11BCEC] focus:ring-[#11BCEC] cursor-pointer"
                  aria-label="Seleziona tutti"
                />
              </th>
            )}
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
              <td colSpan={columns.length + (expandableContent ? 1 : 0) + (selectable ? 1 : 0)} className="p-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const customClass = rowClassName ? rowClassName(row) : '';
              const isExpanded = expandedRows.has(rowIndex);
              const rowId = keyExtractor ? keyExtractor(row) : String(rowIndex);
              const isSelected = selectedIds.includes(rowId);
              
              return (
                <React.Fragment key={rowId}>
                  <tr 
                    className={`transition-colors ${customClass} ${isSelected ? 'bg-blue-50/50' : ''} ${expandableContent ? 'cursor-pointer hover:bg-gray-50/50' : 'hover:bg-gray-50/30'}`}
                    onClick={() => expandableContent && toggleRow(rowIndex)}
                  >
                    {selectable && (
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="rounded border-gray-300 text-[#11BCEC] focus:ring-[#11BCEC] cursor-pointer"
                          aria-label={`Seleziona riga ${rowId}`}
                        />
                      </td>
                    )}
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
                      <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0 border-b border-black/5">
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

export const Table = React.memo(TableInner) as typeof TableInner;
