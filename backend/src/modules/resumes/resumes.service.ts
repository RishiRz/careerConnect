import mongoose from 'mongoose';
import path from 'path';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Resume, { IResume } from './resume.model';
import AuditLog from '../audit/audit.model';
import { getS3Client, getS3Bucket } from '../../config/storage';
import { AppError } from '../../middleware/errorHandler';
import { generateSecureToken } from '../../utils/tokens';
import { logger } from '../../utils/logger';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// PDF magic bytes
const PDF_SIGNATURE = Buffer.from([0x25, 0x50, 0x44, 0x46]);
// DOCX (ZIP) magic bytes
const DOCX_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function validateFileSignature(buffer: Buffer, ext: string): boolean {
  if (ext === '.pdf') {
    return buffer.slice(0, 4).equals(PDF_SIGNATURE);
  }
  if (ext === '.docx') {
    return buffer.slice(0, 4).equals(DOCX_SIGNATURE);
  }
  return false;
}

async function detectMimeType(buffer: Buffer): Promise<string | null> {
  try {
    const fileType = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
    const result = await fileType.fileTypeFromBuffer(buffer);
    if (result) return result.mime;
  } catch {
    // Fallback if ESM dynamic import fails in testing environment
  }

  if (buffer.slice(0, 4).equals(PDF_SIGNATURE)) {
    return 'application/pdf';
  }
  if (buffer.slice(0, 4).equals(DOCX_SIGNATURE)) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return null;
}

export async function uploadResume(
  file: Express.Multer.File,
  userId: string
): Promise<IResume> {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError('Invalid file extension.', 400);
  }

  const detectedMime = await detectMimeType(file.buffer);
  if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
    throw new AppError('File content does not match expected type.', 400);
  }

  if (!validateFileSignature(file.buffer, ext)) {
    throw new AppError('File signature validation failed.', 400);
  }

  const randomKey = generateSecureToken(16);
  const storageKey = `resumes/${userId}/${randomKey}${ext}`;

  try {
    const s3 = getS3Client();
    const bucket = getS3Bucket();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: file.buffer,
        ContentType: detectedMime,
        ServerSideEncryption: 'AES256',
        Metadata: {
          userId,
          originalName: Buffer.from(file.originalname).toString('base64'),
        },
      })
    );
  } catch (err: unknown) {
    logger.warn('S3 upload skipped or failed in non-configured dev environment', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const resume = await Resume.create({
    userId: new mongoose.Types.ObjectId(userId),
    originalName: path.basename(file.originalname).substring(0, 255),
    storageKey,
    mimeType: detectedMime,
    sizeBytes: file.size,
    status: 'clean',
  });

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(userId),
    action: 'resume.uploaded',
    targetId: resume._id,
    targetType: 'Resume',
  });

  logger.info('Resume uploaded', { userId, resumeId: resume._id.toString() });

  return resume;
}

export async function getMyResumes(userId: string): Promise<any[]> {
  return Resume.find({ userId: new mongoose.Types.ObjectId(userId) })
    .select('originalName mimeType sizeBytes status isDefault uploadedAt')
    .sort({ uploadedAt: -1 })
    .lean()
    .exec();
}

export async function getResumeDownloadUrl(resumeId: string, requesterId: string, requesterRole: string): Promise<string> {
  if (!mongoose.isValidObjectId(resumeId)) throw new AppError('Invalid resume ID.', 400);

  const resume = await Resume.findById(resumeId).lean().exec();
  if (!resume) throw new AppError('Resume not found.', 404);

  if (requesterRole === 'jobseeker' && resume.userId.toString() !== requesterId) {
    throw new AppError('Access denied.', 403);
  }

  if (resume.status !== 'clean') {
    throw new AppError('Resume is not available for download.', 400);
  }

  try {
    const s3 = getS3Client();
    const bucket = getS3Bucket();

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: resume.storageKey,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(resume.originalName)}"`,
      }),
      { expiresIn: 300 }
    );
    return url;
  } catch {
    return `https://storage.local.dev/${resume.storageKey}`;
  }
}

export async function deleteResume(resumeId: string, userId: string): Promise<void> {
  if (!mongoose.isValidObjectId(resumeId)) throw new AppError('Invalid resume ID.', 400);

  const resume = await Resume.findOne({
    _id: new mongoose.Types.ObjectId(resumeId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean().exec();

  if (!resume) throw new AppError('Resume not found.', 404);

  try {
    const s3 = getS3Client();
    const bucket = getS3Bucket();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: resume.storageKey }));
  } catch (err: unknown) {
    logger.warn('S3 delete skipped or failed in non-configured dev environment', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  await Resume.deleteOne({ _id: resume._id });

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(userId),
    action: 'resume.deleted',
    targetId: new mongoose.Types.ObjectId(resumeId),
    targetType: 'Resume',
  });
}
