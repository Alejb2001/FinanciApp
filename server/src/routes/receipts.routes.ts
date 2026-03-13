import { Router } from 'express';
import multer from 'multer';
import { uploadAndParse } from '../controllers/receipts.controller';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

const router = Router();

// POST /api/receipts/upload  — multipart/form-data, field name: "pdf"
router.post('/upload', upload.single('pdf'), uploadAndParse);

export default router;
