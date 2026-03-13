import { Request, Response } from 'express';
// pdf-parse is a CommonJS module; esModuleInterop handles the default import
import pdfParse from 'pdf-parse';
import { extractFromText } from '../utils/pdf-extractor';

export const uploadAndParse = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No PDF file received' });
    return;
  }

  const data = await pdfParse(req.file.buffer);
  const result = extractFromText(data.text);

  res.json({ data: result });
};
