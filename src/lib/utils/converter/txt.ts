export async function downloadTextAsFile(textContents: string[], fileName: string) {
  if (textContents.length > 0) {
    const txt = textContents.join('\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
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