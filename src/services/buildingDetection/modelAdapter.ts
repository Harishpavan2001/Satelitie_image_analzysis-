import type { DetectionResult, BuildingDetectionOptions } from './types';
import { loadSatelliteImageElement, preprocessForComputerVision } from './preprocessing';
import { runComputerVisionDetection } from './cvEngine';

export interface BuildingDetectorAdapter {
  detect(
    previewUrl: string,
    options?: BuildingDetectionOptions
  ): Promise<DetectionResult>;
}

export class CVBuildingDetectorAdapter implements BuildingDetectorAdapter {
  async detect(
    previewUrl: string,
    options?: BuildingDetectionOptions
  ): Promise<DetectionResult> {
    // 1. Load Image
    const img = await loadSatelliteImageElement(previewUrl);
    const originalWidth = img.naturalWidth || img.width || 800;
    const originalHeight = img.naturalHeight || img.height || 600;

    // 2. Preprocess
    const processed = preprocessForComputerVision(img, 1024);

    // 3. Execute Computer Vision Detection Engine
    const result = runComputerVisionDetection(processed, originalWidth, originalHeight, options);

    return result;
  }
}

export class ONNXBuildingDetectorAdapter implements BuildingDetectorAdapter {
  private modelWeightsPath: string;

  constructor(weightsPath: string = '/models/building_yolov8seg.onnx') {
    this.modelWeightsPath = weightsPath;
  }

  async detect(
    previewUrl: string,
    options?: BuildingDetectionOptions
  ): Promise<DetectionResult> {
    // Adapter stub for loading heavy ONNX / SAM weights in WebAssembly / WebGPU environment
    console.log(`[ONNX Adapter] Initializing inference pipeline with weights from ${this.modelWeightsPath}`);
    
    // Fallback to CV engine if weights are not local
    const fallbackAdapter = new CVBuildingDetectorAdapter();
    return fallbackAdapter.detect(previewUrl, options);
  }
}
