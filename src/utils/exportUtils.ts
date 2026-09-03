export function exportToCsv(data: any[], filename: string, columns: { header: string; key: string | ((row: any) => string) }[]) {
  if (!data || data.length === 0) return;

  const escapeCSV = (val: any) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = columns.map(c => escapeCSV(c.header)).join(',');
  
  const rows = data.map(row => {
    return columns.map(c => {
      const val = typeof c.key === 'function' ? c.key(row) : row[c.key];
      return escapeCSV(val);
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
