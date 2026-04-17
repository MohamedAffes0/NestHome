import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

// Create base upload directory
const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

type MulterCb = (error: Error | null, destination: string) => void;
type MulterFilenameCb = (error: Error | null, filename: string) => void;

export const multerConfig = {
  storage: diskStorage({
    // Determine destination folder based on fieldname
    destination: (
      req: Request,
      file: Express.Multer.File,
      callback: MulterCb,
    ): void => {
      let folder = './uploads/';

      if (file.fieldname === 'profileImage' || file.fieldname === 'image') {
        folder += 'profiles';
      } else if (file.fieldname === 'images') {
        folder += 'real-estates';
      } else {
        folder += 'others';
      }

      // Ensure folder exists
      if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
      }

      callback(null, folder); // Save files to appropriate folder
    },

    // Generate a unique filename
    filename: (
      req: Request,
      file: Express.Multer.File,
      callback: MulterFilenameCb,
    ): void => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname);
      const basename = file.originalname.replace(ext, '').replace(/\s/g, '-');

      callback(null, `${basename}-${uniqueSuffix}${ext}`); // e.g. my-image-1632345678901-123456789.png
    },
  }),

  // File filter to allow only specific image types
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    // Validate file type
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'),
        false,
      );
    }
  },

  // 1MB file size limit
  limits: {
    fileSize: 1024 * 1024 * 1, // 1MB
  },
};
