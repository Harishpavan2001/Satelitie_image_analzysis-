import type { SatelliteImageFile } from '../../types/analysis';
import type { DetectionResult, BuildingDetectionOptions } from './types';
import { validateImageFile } from './preprocessing';
import { CVBuildingDetectorAdapter } from './modelAdapter';

export async function analyzeSatelliteImage(
  satelliteImage: SatelliteImageFile | null,
  options?: BuildingDetectionOptions
): Promise<DetectionResult> {
  if (!satelliteImage) {
    throw new Error('No satellite image provided for building detection analysis.');
  }

  // Step 1: Validate Image
  const validation = validateImageFile(satelliteImage);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid satellite image input.');
  }

  try {
    // Step 2: Initialize CV Building Detector Engine
    const adapter = new CVBuildingDetectorAdapter();

    // Step 3: Run Inference Pipeline
    const result = await adapter.detect(satelliteImage.previewUrl, options);

    return result;
  } catch (error: any) {
    console.error('Building Detection Engine Error:', error);
    throw new Error(error.message || 'An error occurred during satellite image building detection.');
  }
}
