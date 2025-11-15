import type * as PDFJS from 'pdfjs-dist';

export async function getAllTextInsidePDF(pdfjsLib: typeof PDFJS, pdfFile: File | null): Promise<string[] | null> {
  if (!pdfFile || !pdfjsLib) return null;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textContents: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    textContents.push(pageText);
  }

  return textContents;
}