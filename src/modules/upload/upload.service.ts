import { Injectable, BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  /**
   * Generate the full URL of an uploaded file
   */
  getFileUrl(filename: string, folder: string = 'profiles'): string {
    const baseUrl = process.env.MULTER_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${folder}/${filename}`;
  }

  /**
   * Extract the filename from a URL
   */
  getFilenameFromUrl(url: string): string | null {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Extract the folder from a URL
   */
  getFolderFromUrl(url: string): string {
    if (!url) return 'profiles';
    try {
      const parts = url.split('/');
      // Trouver l'index de "uploads" et prendre le dossier suivant
      const uploadsIndex = parts.findIndex((part) => part === 'uploads');
      if (uploadsIndex !== -1 && uploadsIndex + 1 < parts.length) {
        return parts[uploadsIndex + 1];
      }
      return 'profiles';
    } catch (error) {
      console.error('Error extracting folder from URL:', error);
      return 'profiles';
    }
  }

  /**
   * Delete a file from the filesystem
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      const filename = this.getFilenameFromUrl(fileUrl);
      const folder = this.getFolderFromUrl(fileUrl);

      if (!filename) return;

      const filePath = join(process.cwd(), 'uploads', folder, filename);

      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`File deleted: ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    if (!fileUrls || fileUrls.length === 0) {
      return;
    }

    const deletePromises = fileUrls.map((url) => this.deleteFile(url));
    await Promise.allSettled(deletePromises); // Utiliser allSettled pour ne pas échouer si un fichier manque
  }

  /**
   * Validate an uploaded file
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
  }

  /**
   * Validate multiple files
   */
  validateFiles(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    files.forEach((file) => this.validateFile(file));
  }
}
