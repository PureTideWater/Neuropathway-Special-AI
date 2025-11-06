/**
 * ZIP Helper Utility
 * Creates ZIP archives for bulk PDF exports
 */

import archiver from 'archiver';
import { logger } from './logger';

interface ZipFile {
  filename: string;
  buffer: Buffer;
}

/**
 * Create ZIP archive from multiple buffers
 */
export async function createZip(files: ZipFile[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const buffers: Buffer[] = [];

    archive.on('data', (data) => {
      buffers.push(data);
    });

    archive.on('end', () => {
      const finalBuffer = Buffer.concat(buffers);
      logger.info('ZIP archive created', { fileCount: files.length, sizeKb: (finalBuffer.length / 1024).toFixed(2) });
      resolve(finalBuffer);
    });

    archive.on('error', (err) => {
      logger.error('Error creating ZIP archive', { error: err.message });
      reject(err);
    });

    // Add each file to archive
    files.forEach((file) => {
      archive.append(file.buffer, { name: file.filename });
    });

    // Finalize the archive
    archive.finalize();
  });
}

export default {
  createZip,
};
