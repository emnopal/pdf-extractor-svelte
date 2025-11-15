import Papa from 'papaparse';

export async function downloadTextAsCsv(textContents: string[], fileName: string) {
  if (textContents.length > 0) {
    const csv = Papa.unparse(textContents.map(line => line.split('|')));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    throw new Error('No text content to download');
  }
}