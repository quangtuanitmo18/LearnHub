import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { generateRandomFilename } from '../helpers/helpers';

@Injectable()
export class FileValidationAndSavePipe implements PipeTransform {
  private readonly allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
  private readonly maxSize = 2 * 1024 * 1024; // 2MB
  private readonly uploadDir = path.resolve('upload');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async transform(
    files: Express.Multer.File | Express.Multer.File[] | undefined,
  ): Promise<Express.Multer.File | Express.Multer.File[]> {
    console.log('files', files);
    // Check if files is provided
    if (!files) {
      throw new BadRequestException('No file provided');
    }

    // Handle single file
    if (!Array.isArray(files)) {
      return this.processSingleFile(files);
    }

    // Handle multiple files
    if (files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // If all validations pass, save files to disk
    const savedFiles = await Promise.all(
      files.map(async (file) => this.processSingleFile(file)),
    );

    return savedFiles;
  }

  private async processSingleFile(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    // Validate the file
    this.validateFile(file);

    const filename = generateRandomFilename(file.originalname);
    const filepath = path.join(this.uploadDir, filename);

    try {
      await writeFile(filepath, file.buffer);

      // Return file object with disk storage properties
      return {
        ...file,
        filename,
        path: filepath,
        destination: this.uploadDir,
      } as Express.Multer.File;
    } catch (error) {
      throw new BadRequestException(
        `Failed to save file ${file.originalname}: ${error.message}`,
      );
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File ${file.originalname} is too large. Maximum size is ${this.maxSize / (1024 * 1024)}MB`,
      );
    }

    // Check file extension
    if (!this.allowedExtensions.test(file.originalname)) {
      throw new BadRequestException(
        `File ${file.originalname} has invalid extension. Only JPG, JPEG, PNG, and WEBP are allowed`,
      );
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File ${file.originalname} has invalid MIME type: ${file.mimetype}. Only image files are allowed`,
      );
    }

    // Additional validation: check if file has content
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        `File ${file.originalname} is empty or corrupted`,
      );
    }
  }
}
