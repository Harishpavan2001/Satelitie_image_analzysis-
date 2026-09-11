import type { SatelliteImageFile } from '../../types/analysis';

export interface ProcessedImageData {
  imageElement: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
  width: number;
  height: number;
}

export async function loadSatelliteImageElement(previewUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load satellite image for preprocessing. Corrupted or invalid image format.'));
    img.src = previewUrl;
  });
}

export function validateImageFile(fileInfo: SatelliteImageFile): { isValid: boolean; error?: string } {
  if (!fileInfo || !fileInfo.previewUrl) {
    return { isValid: false, error: 'No satellite image source provided.' };
  }

  const allowedFormats = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
  const ext = fileInfo.name.toLowerCase();
  const isAllowedExt = ['.tif', '.tiff', '.png', '.jpg', '.jpeg', '.webp'].some(e => ext.endsWith(e));

  if (fileInfo.type && !allowedFormats.includes(fileInfo.type) && !isAllowedExt) {
    return { isValid: false, error: `Unsupported image format (${fileInfo.type || ext}). Supported: .tif, .tiff, .png, .jpg, .jpeg` };
  }

  if (fileInfo.sizeBytes > 500 * 1024 * 1024) {
    return { isValid: false, error: 'File size exceeds maximum limit of 500 MB.' };
  }

  return { isValid: true };
}

export function preprocessForComputerVision(
  img: HTMLImageElement,
  maxDimension: number = 1024
): ProcessedImageData {
  const originalWidth = img.naturalWidth || img.width || 800;
  const originalHeight = img.naturalHeight || img.height || 600;

  // Calculate scaled dimensions keeping aspect ratio
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (originalWidth > maxDimension || originalHeight > maxDimension) {
    if (originalWidth > originalHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to create 2D canvas context for satellite image analysis.');
  }

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Extract pixel matrix
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  return {
    imageElement: img,
    canvas,
    ctx,
    imageData,
    width: targetWidth,
    height: targetHeight
  };
}
