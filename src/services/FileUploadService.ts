export class FileUploadService {
  // Upload a file and return the file ID
  static async uploadFile(file: File): Promise<{success: boolean;fileId?: number;error?: string;}> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];


      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported');
      }

      // Upload the file
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) {
        throw new Error(error);
      }

      return {
        success: true,
        fileId: fileId
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(files: FileList | File[]): Promise<{
    success: boolean;
    results: Array<{fileName: string;fileId?: number;error?: string;}>;
  }> {
    try {
      const results = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        const result = await this.uploadFile(file);
        results.push({
          fileName: file.name,
          fileId: result.fileId,
          error: result.error
        });
      }

      const successCount = results.filter((r) => !r.error).length;

      return {
        success: successCount > 0,
        results
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      return {
        success: false,
        results: []
      };
    }
  }

  // Upload image and get URL
  static async uploadImage(file: File): Promise<{success: boolean;imageUrl?: string;error?: string;}> {
    try {
      // Validate that it's an image
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const result = await this.uploadFile(file);

      if (!result.success || !result.fileId) {
        throw new Error(result.error || 'Upload failed');
      }

      // The imageUrl is now directly returned from the backend
      // The fileId is actually the image URL path
      const imageUrl = result.fileId.toString();

      return {
        success: true,
        imageUrl
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image upload failed'
      };
    }
  }

  // Validate image before upload
  static validateImage(file: File): {valid: boolean;error?: string;} {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    // Check image dimensions (optional)
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check max dimensions (optional)
        const maxWidth = 4000;
        const maxHeight = 4000;

        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({ valid: false, error: `Image dimensions must be less than ${maxWidth}x${maxHeight}px` });
        } else {
          resolve({ valid: true });
        }

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        resolve({ valid: false, error: 'Invalid image file' });
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    }) as any;
  }

  // Get file extension
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate thumbnail for image (client-side)
  static generateThumbnail(file: File, maxWidth: number = 200, maxHeight: number = 200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = height * maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.7 // 70% quality
        );

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Compress image before upload
  static compressImage(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
