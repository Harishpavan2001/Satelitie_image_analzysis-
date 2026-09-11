export interface BoundingBox {
  x: number; // Normalized 0..1 (relative to image width)
  y: number; // Normalized 0..1 (relative to image height)
  width: number; // Normalized 0..1
  height: number; // Normalized 0..1
}

export interface PixelBoundingBox {
  x: number; // Pixel X position in original image
  y: number; // Pixel Y position in original image
  width: number; // Pixel width
  height: number; // Pixel height
}

export interface BuildingDetection {
  building_id: number;
  confidence: number; // 0.00 to 1.00
  bounding_box: BoundingBox;
  pixel_box: PixelBoundingBox;
  center: {
    x: number;
    y: number;
  };
  width: number; // In pixels
  height: number; // In pixels
  area_sq_m: number;
  building_type: 'residential' | 'commercial' | 'industrial' | 'generic';
}

export interface DetectionResult {
  imageId: string;
  imageDimensions: {
    width: number;
    height: number;
  };
  totalBuildings: number;
  detections: BuildingDetection[];
  processingTimeMs: number;
  modelInfo: {
    name: string;
    version: string;
    backend: string;
    description: string;
  };
}

export interface BuildingDetectionOptions {
  confidenceThreshold?: number;
  minBuildingSizePx?: number;
  maxBuildingSizePx?: number;
  detectTypes?: boolean;
}
