import type { DetectionResult, BuildingDetection } from './types';

export function createTestDetectionResult(count: number, sceneName: string = 'Test Satellite Scene'): DetectionResult {
  const detections: BuildingDetection[] = [];

  if (count > 0) {
    const gridCols = Math.ceil(Math.sqrt(count));
    const cellW = 0.8 / gridCols;
    const cellH = 0.8 / gridCols;

    for (let i = 0; i < count; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);

      const x = parseFloat((0.1 + col * cellW).toFixed(4));
      const y = parseFloat((0.1 + row * cellH).toFixed(4));
      const width = parseFloat((cellW * 0.7).toFixed(4));
      const height = parseFloat((cellH * 0.7).toFixed(4));

      // Vary confidence realistically between 0.74 and 0.98
      const conf = parseFloat((0.74 + (i * 0.017) % 0.24).toFixed(2));
      const widthPx = Math.round(width * 800);
      const heightPx = Math.round(height * 600);
      const area = Math.round(widthPx * heightPx * 0.25);

      const buildingTypes: ('residential' | 'commercial' | 'industrial')[] = ['residential', 'commercial', 'industrial'];
      const buildingType = buildingTypes[i % 3];

      detections.push({
        building_id: i + 1,
        confidence: conf,
        bounding_box: { x, y, width, height },
        pixel_box: {
          x: Math.round(x * 800),
          y: Math.round(y * 600),
          width: widthPx,
          height: heightPx
        },
        center: {
          x: Math.round((x + width / 2) * 800),
          y: Math.round((y + height / 2) * 600)
        },
        width: widthPx,
        height: heightPx,
        area_sq_m: area,
        building_type: buildingType
      });
    }
  }

  return {
    imageId: `test_${count}_${Date.now()}`,
    imageDimensions: { width: 800, height: 600 },
    totalBuildings: detections.length,
    detections,
    processingTimeMs: 120,
    modelInfo: {
      name: `SatQuery-TestHarness-${count}-Objs`,
      version: 'v1.0-Test',
      backend: 'Controlled Test Dataset Harness',
      description: `Validation harness for ${count} building detections in ${sceneName}`
    }
  };
}
