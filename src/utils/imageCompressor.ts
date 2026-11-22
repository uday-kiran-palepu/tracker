/**
 * Client-side image compression utility using HTML5 Canvas.
 * Compresses images to max 1200px width/height maintaining aspect ratio,
 * converts to JPEG quality 0.75, and strips the data URL prefix for clean base64 data.
 */

export interface CompressedImageResult {
  fileName: string;
  mimeType: string;
  base64Data: string;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with specified quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Strip data:image/...;base64, prefix for clean base64 transmission
        const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
        const compressedSizeKb = Math.round((base64Data.length * 3) / 4 / 1024);

        // Clean file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

        resolve({
          fileName: cleanName,
          mimeType: 'image/jpeg',
          base64Data,
          previewUrl: dataUrl,
          originalSizeKb,
          compressedSizeKb
        });
      };

      img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err));
    reader.readAsDataURL(file);
  });
}
