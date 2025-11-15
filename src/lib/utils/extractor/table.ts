import type * as PDFJS from 'pdfjs-dist';

function normalizeText(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function groupByLines(textContent: any) {
  // Group text items by their Y coordinate to reconstruct lines
  const linesMap = new Map<number, { y: number; items: { x: number; str: string }[] }>();
  const items = textContent.items as Array<any>;

  for (const it of items) {
    const str: string = it.str ?? '';
    if (!str.trim()) continue;
    const transform = it.transform as number[]; // [a,b,c,d,e,f]; f ~ y, e ~ x
    const x = transform?.[4] ?? 0;
    const y = transform?.[5] ?? 0;
    const yKey = Math.round(y); // bucket by rounded Y to keep close glyphs together
    if (!linesMap.has(yKey)) linesMap.set(yKey, { y, items: [] });
    linesMap.get(yKey)!.items.push({ x, str: str.trim() });
  }

  const lines = Array.from(linesMap.values())
    .sort((a, b) => b.y - a.y) // from top to bottom
    .map((line) => {
      const text = line.items
        .sort((a, b) => a.x - b.x)
        .map((t) => t.str)
        .join('_');
      return normalizeText(text);
    })
    .filter(Boolean);

  return lines;
}

function normalizeData(service: string, data: string, salary: string): string {
  const splittedData = data.split('_');
  const line = splittedData[0];
  const scheduleLines = "";
  const partDescription = `${splittedData[1]}/${salary}`;
  const typeService = service;
  const returnLine = "";
  const qtyUnit = splittedData[2];
  const price = splittedData[3];
  const subtotal = splittedData[4];

  return `${line}|${scheduleLines}|${partDescription}|${typeService}|${returnLine}|${qtyUnit}|${price}|${subtotal}`;
}

export async function getTableFromPDF(
  pdfjsLib: typeof PDFJS,
  pdfFile: File | null,
): Promise<string[] | null> {
  if (!pdfFile || !pdfjsLib) return null;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const sectionLines: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const lines = groupByLines(textContent);
    const headerLineIndex: number[] = [];

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (line === 'Line #_No. Schedule Lines_Part # / Description_Type_Return_Qty (Unit)_Price_Subtotal') {
        headerLineIndex.push(li);
      }
    }

    for (const headerIndex of headerLineIndex) {
      let service = lines[headerIndex + 1];
      let data = lines[headerIndex + 2];
      let salary = lines[headerIndex + 3];
      if (!service) {
        // get to next page
        const _page = await pdf.getPage(i + 1);
        const _textContent = await _page.getTextContent();
        const _lines = groupByLines(_textContent);
        service = _lines[0];
        data = _lines[1];
        salary = _lines[2];
        sectionLines.push(normalizeData(service, data, salary));
        continue;
      }

      if (!data) {
        // get to next page
        const _page = await pdf.getPage(i + 1);
        const _textContent = await _page.getTextContent();
        const _lines = groupByLines(_textContent);
        data = _lines[0];
        salary = _lines[1];
        sectionLines.push(normalizeData(service, data, salary));
        continue;
      }

      if (!salary) {
        // get to next page
        const _page = await pdf.getPage(i + 1);
        const _textContent = await _page.getTextContent();
        const _lines = groupByLines(_textContent);
        salary = _lines[0];
        sectionLines.push(normalizeData(service, data, salary));
        continue;
      }

      sectionLines.push(normalizeData(service, data, salary));
    }
  }

  const headerLine = 'Line #|No. Schedule Lines|Part # / Description|Type|Return|Qty (Unit)|Price|Subtotal';

  return [headerLine, ...sectionLines];
}