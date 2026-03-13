/**
 * Extracts amount and date from raw PDF text.
 * Handles Spanish-language receipts (Mexico, Argentina, Chile, etc.)
 */

const MONTH_MAP: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
};

// ---------------------------------------------------------------------------
// Amount helpers
// ---------------------------------------------------------------------------

/** Convert string like "1.234,56" or "1,234.56" or "1234.56" to number */
function parseRawAmount(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;

  const lastDot   = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  let normalized: string;
  if (lastComma > lastDot) {
    // European format: 1.234,56
    normalized = s.replace(/\./g, '').replace(',', '.');
  } else {
    // US format: 1,234.56  or  plain: 1234.56
    normalized = s.replace(/,/g, '');
  }

  const value = parseFloat(normalized);
  return isNaN(value) || value <= 0 ? null : value;
}

const AMOUNT_PATTERN = /[\$\s]?([\d]{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/;

function searchAmount(text: string, keywords: string[]): number | null {
  for (const kw of keywords) {
    // Build a regex: keyword ... optional separators ... number
    const re = new RegExp(
      `${kw}[^\\n]{0,40}?(?:\\$|MXN|ARS|CLP|USD|€)?\\s*(\\d[\\d.,\\s]{0,20})`,
      'im',
    );
    const match = text.match(re);
    if (match?.[1]) {
      const value = parseRawAmount(match[1]);
      if (value !== null) return value;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toISODate(day: string, month: string, year: string): string {
  return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractDateFromText(text: string): string | null {
  // 1. Preceded by date keyword — highest priority
  const kwDateRe = /(?:fecha|emisi[oó]n|vencimiento|per[ií]odo|date)[^\n]{0,20}?(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/im;
  const kwMatch = text.match(kwDateRe);
  if (kwMatch) {
    const [, d, m, y] = kwMatch;
    return toISODate(d, m, y.length === 2 ? `20${y}` : y);
  }

  // 2. Spanish textual: "15 de enero de 2024"
  const textualRe = new RegExp(
    `(\\d{1,2})\\s+de\\s+(${Object.keys(MONTH_MAP).join('|')})\\s+(?:de\\s+)?(\\d{4})`,
    'i',
  );
  const textualMatch = text.match(textualRe);
  if (textualMatch) {
    const [, d, m, y] = textualMatch;
    return toISODate(d, MONTH_MAP[m.toLowerCase()], y);
  }

  // 3. Generic DD/MM/YYYY or DD-MM-YYYY (prefer year > 2000)
  const genericRe = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g;
  let bestDate: string | null = null;
  let gMatch: RegExpExecArray | null;
  while ((gMatch = genericRe.exec(text)) !== null) {
    const [, d, m, y] = gMatch;
    const year = parseInt(y, 10);
    if (year >= 2000 && year <= 2100) {
      bestDate = toISODate(d, m, y);
      break;
    }
  }
  if (bestDate) return bestDate;

  // 4. ISO format YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d{2})[\/\-](0[1-9]|1[0-2])[\/\-](\d{2})\b/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m}-${d}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ExtractionResult {
  extractedAmount: number | null;
  extractedDate: string | null;
  confidence: 'high' | 'medium' | 'low';
  preview: string; // first 800 chars of raw text for debugging
}

export function extractFromText(rawText: string): ExtractionResult {
  // Normalise: collapse multiple spaces/tabs but keep newlines for context
  const text = rawText.replace(/[^\S\n]+/g, ' ').trim();

  // --- Amount extraction ---
  const highKeywords  = ['total a pagar', 'total pagar', 'importe total', 'gran total', 'neto a pagar', 'monto a pagar'];
  const medKeywords   = ['total', 'subtotal', 'importe', 'monto', 'valor total', 'a pagar', 'pago'];

  let amount = searchAmount(text, highKeywords);
  let amountConf: 'high' | 'medium' | 'low' = 'high';

  if (amount === null) {
    amount = searchAmount(text, medKeywords);
    amountConf = amount !== null ? 'medium' : 'low';
  }

  // Fallback: largest plausible currency value in the document
  if (amount === null) {
    const allNumbers = [...text.matchAll(/\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\b/g)]
      .map(m => parseRawAmount(m[1]))
      .filter((n): n is number => n !== null && n >= 1 && n < 1_000_000);
    if (allNumbers.length) {
      amount = Math.max(...allNumbers);
      amountConf = 'low';
    }
  }

  // --- Date extraction ---
  const dateStr = extractDateFromText(text);
  const dateConf: 'high' | 'medium' | 'low' = dateStr ? 'high' : 'low';

  // --- Combined confidence ---
  const scores = { high: 2, medium: 1, low: 0 };
  const avg = (scores[amountConf] + scores[dateConf]) / 2;
  const confidence: 'high' | 'medium' | 'low' =
    avg >= 1.5 ? 'high' : avg >= 0.5 ? 'medium' : 'low';

  return {
    extractedAmount: amount,
    extractedDate: dateStr,
    confidence,
    preview: text.slice(0, 800),
  };
}
