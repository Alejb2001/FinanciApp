export type ExtractionConfidence = 'high' | 'medium' | 'low';

export interface ExtractedReceiptData {
  extractedAmount: number | null;
  extractedDate: string | null;
  confidence: ExtractionConfidence;
  preview: string;
}
