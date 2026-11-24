import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { AppError } from './errorHandler';

const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new AppError('Only PDF and DOCX files are allowed.', 400));
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Invalid file type. Only PDF and DOCX are accepted.', 400));
  }

  cb(null, true);
}

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

export { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE };
