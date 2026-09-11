import type { DetectionResult, BuildingDetection } from './types';

export interface CalculatedBuildingStats {
  totalBuildings: number;
  avgConfidence: number; // In percentage, e.g. 92.4
  highestConfidence: number; // In percentage, e.g. 98
  lowestConfidence: number; // In percentage, e.g. 74
  totalAreaSqM: number;
  summaryText: string;
  validatedDetections: BuildingDetection[];
}

export function sanitizeAndCalculateStats(result: DetectionResult | null | undefined): CalculatedBuildingStats {
  // Edge Case 1: Null or undefined result
  if (!result || !Array.isArray(result.detections)) {
    return {
      totalBuildings: 0,
      avgConfidence: 0,
      highestConfidence: 0,
      lowestConfidence: 0,
      totalAreaSqM: 0,
      summaryText: 'AI did not detect any buildings in the selected satellite image.',
      validatedDetections: []
    };
  }

  // Edge Case 2: Data validation and sanitization
  const seenIds = new Set<number>();
  const validatedDetections: BuildingDetection[] = [];

  result.detections.forEach((d, idx) => {
    if (!d) return;

    // Ensure valid building ID
    let buildingId = typeof d.building_id === 'number' && !isNaN(d.building_id) ? d.building_id : idx + 1;
    while (seenIds.has(buildingId)) {
      buildingId++;
    }
    seenIds.add(buildingId);

    // Ensure valid confidence (clamp 0.0 - 1.0)
    let conf = typeof d.confidence === 'number' && !isNaN(d.confidence) ? d.confidence : 0.85;
    conf = Math.min(1.0, Math.max(0.0, conf));

    // Validate bounding box bounds
    const box = d.bounding_box || { x: 0, y: 0, width: 0.1, height: 0.1 };
    const normX = Math.min(1.0, Math.max(0.0, typeof box.x === 'number' ? box.x : 0));
    const normY = Math.min(1.0, Math.max(0.0, typeof box.y === 'number' ? box.y : 0));
    const normW = Math.min(1.0, Math.max(0.01, typeof box.width === 'number' ? box.width : 0.05));
    const normH = Math.min(1.0, Math.max(0.01, typeof box.height === 'number' ? box.height : 0.05));

    // Validate pixel box & dimensions
    const widthPx = typeof d.width === 'number' && d.width > 0 ? d.width : Math.round(normW * (result.imageDimensions?.width || 800));
    const heightPx = typeof d.height === 'number' && d.height > 0 ? d.height : Math.round(normH * (result.imageDimensions?.height || 600));
    const area = typeof d.area_sq_m === 'number' && d.area_sq_m >= 0 ? d.area_sq_m : Math.round(widthPx * heightPx * 0.25);

    validatedDetections.push({
      ...d,
      building_id: buildingId,
      confidence: parseFloat(conf.toFixed(2)),
      bounding_box: {
        x: parseFloat(normX.toFixed(4)),
        y: parseFloat(normY.toFixed(4)),
        width: parseFloat(normW.toFixed(4)),
        height: parseFloat(normH.toFixed(4))
      },
      pixel_box: d.pixel_box || {
        x: Math.round(normX * (result.imageDimensions?.width || 800)),
        y: Math.round(normY * (result.imageDimensions?.height || 600)),
        width: widthPx,
        height: heightPx
      },
      center: d.center || {
        x: Math.round(normX * (result.imageDimensions?.width || 800) + widthPx / 2),
        y: Math.round(normY * (result.imageDimensions?.height || 600) + heightPx / 2)
      },
      width: widthPx,
      height: heightPx,
      area_sq_m: area,
      building_type: d.building_type || 'residential'
    });
  });

  const count = validatedDetections.length;

  // Edge Case 3: Zero buildings detected
  if (count === 0) {
    return {
      totalBuildings: 0,
      avgConfidence: 0,
      highestConfidence: 0,
      lowestConfidence: 0,
      totalAreaSqM: 0,
      summaryText: 'AI did not detect any buildings in the selected satellite image.',
      validatedDetections: []
    };
  }

  // Calculate statistics
  const confidences = validatedDetections.map(d => d.confidence);
  const sumConf = confidences.reduce((acc, val) => acc + val, 0);
  const avgConfPercent = parseFloat(((sumConf / count) * 100).toFixed(1));
  const maxConfPercent = Math.round(Math.max(...confidences) * 100);
  const minConfPercent = Math.round(Math.min(...confidences) * 100);
  const totalArea = validatedDetections.reduce((acc, d) => acc + d.area_sq_m, 0);

  const summaryText = `AI detected ${count} building${count === 1 ? '' : 's'} in the selected satellite image with an average detection confidence of ${avgConfPercent}%.`;

  return {
    totalBuildings: count,
    avgConfidence: avgConfPercent,
    highestConfidence: maxConfPercent,
    lowestConfidence: minConfPercent,
    totalAreaSqM: totalArea,
    summaryText,
    validatedDetections
  };
}
