/**
 * Shared Image Compression, Base64 Encoding & Google Drive Image URL Helpers
 */

export interface CompressedImageResult {
  base64Data: string;
  mimeType: string;
  fileName: string;
  previewUrl: string;
}

/**
 * 1. Shared Image Compression & Raw Base64 Helper
 * - Draws image onto an HTML5 canvas (max width 1200px, aspect-ratio preserved)
 * - Exports via canvas.toDataURL("image/jpeg", 0.78)
 * - CRITICAL: Strips Data URL header so ONLY the pure raw Base64 string is returned
 * - Verifies base64Data is non-empty before returning
 */
export async function compressImageToBase64(file: File): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for compression'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to obtain canvas 2D context'));
            return;
          }

          // Render image on canvas with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export via JPEG 0.78
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);

          // CRITICAL: Strip the Data URL header so ONLY pure raw Base64 is returned
          const parts = dataUrl.split(',');
          const base64Data = (parts[1] || '').trim();

          // Verify base64Data is strictly non-empty
          if (!base64Data || base64Data.length < 50) {
            reject(new Error('Generated base64 image data is empty or corrupt'));
            return;
          }

          const cleanName = (file.name || 'photo').replace(/\.[^/.]+$/, '') + '.jpg';

          resolve({
            base64Data,
            mimeType: 'image/jpeg',
            fileName: cleanName,
            previewUrl: dataUrl
          });
        } catch (err: any) {
          reject(new Error('Image canvas rendering error: ' + (err?.message || err)));
        }
      };

      img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err));
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts Google Drive file ID from an ID string or drive URL
 */
export function extractDriveFileId(urlOrId?: string): string {
  if (!urlOrId) return '';
  const s = String(urlOrId).trim();
  if (!s) return '';

  // 1. Direct Google Drive file ID pattern (alphanumeric, dashes, underscores, length >= 20, no slashes or protocols)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s) && !s.includes('/') && !s.includes(':')) {
    return s;
  }

  // 2. Query parameter: ?id=FILE_ID or &id=FILE_ID
  const queryMatch = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1];
  }

  // 3. Path parameter: /d/FILE_ID
  const slashDMatch = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (slashDMatch && slashDMatch[1]) {
    return slashDMatch[1];
  }

  // 4. googleusercontent pattern: /d/FILE_ID=
  const lh3Match = s.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  return '';
}

/**
 * 2. Shared Reliable Image URL Helper
 * - If photo.driveFileId exists (or can be extracted from a drive.google.com URL),
 *   returns https://lh3.googleusercontent.com/d/${fileId}=w1200
 * - Otherwise returns photo.imageUrl or raw string
 */
export function getReliableImageUrl(
  photo: { imageUrl?: string; driveFileId?: string } | string | null | undefined
): string {
  if (!photo) return '';

  if (typeof photo === 'string') {
    const fileId = extractDriveFileId(photo);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
    }
    return photo;
  }

  const rawId = photo.driveFileId ? String(photo.driveFileId).trim() : '';
  const fileId = rawId || extractDriveFileId(photo.imageUrl);

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
  }

  return photo.imageUrl || '';
}

/**
 * Fallback Thumbnail URL for Google Drive images
 */
export function getFallbackImageUrl(
  photo: { imageUrl?: string; driveFileId?: string } | string | null | undefined
): string {
  if (!photo) return '';

  const rawId = typeof photo === 'string'
    ? extractDriveFileId(photo)
    : (photo.driveFileId ? String(photo.driveFileId).trim() : extractDriveFileId(photo.imageUrl));

  if (rawId) {
    return `https://drive.google.com/thumbnail?id=${rawId}&sz=w1000`;
  }

  return typeof photo === 'string' ? photo : (photo.imageUrl || '');
}

/**
 * Shared onError handler for <img> elements
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  photo: { imageUrl?: string; driveFileId?: string } | string | null | undefined
): void {
  const fallback = getFallbackImageUrl(photo);
  if (fallback && e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
}
