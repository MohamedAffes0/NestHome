import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { Request } from 'express';

@Injectable()
export class CleanupFilesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const files: Express.Multer.File[] = [];
    if (request.files) {
      // Handle multiple files (array or object with arrays)
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        // When using fields like { images: [...], documents: [...] }
        Object.values(request.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            files.push(...fileArray);
          }
        });
      }
    } else if (request.file) {
      // Handle single file
      files.push(request.file);
    }

    return next.handle().pipe(
      catchError((error) => {
        // Clean up uploaded files on any error
        if (files.length > 0) {
          this.cleanupFiles(files).catch((err) =>
            console.error('Error cleaning up files:', err),
          );
        }
        return throwError(() => error as unknown);
      }),
    );
  }

  /**
   * Delete uploaded files from the filesystem
   */
  private async cleanupFiles(files: Express.Multer.File[]): Promise<void> {
    const deletePromises = files.map(async (file) => {
      if (file.path && existsSync(file.path)) {
        try {
          await unlink(file.path);
          console.log(`Cleaned up file: ${file.path}`);
        } catch (error) {
          console.error(`Failed to delete file ${file.path}:`, error);
        }
      }
    });

    await Promise.all(deletePromises);
  }
}
