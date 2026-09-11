import type { DetectionResult } from './buildingDetection/types';
import { sanitizeAndCalculateStats } from './buildingDetection/statsValidator';

export type QueryIntent = 
  | 'BUILDING_COUNT'
  | 'AVERAGE_CONFIDENCE'
  | 'HIGHEST_CONFIDENCE'
  | 'LOWEST_CONFIDENCE'
  | 'BUILDING_SUMMARY'
  | 'SHOW_BUILDINGS'
  | 'UNSUPPORTED_DOMAIN'
  | 'UNKNOWN_QUERY';

export interface AIQueryResponse {
  id: string;
  query: string;
  intent: QueryIntent;
  answer: string;
  evidenceText: string;
  timestamp: string;
  focusBuildingId?: number;
}

export function processUserQuery(
  rawQuery: string,
  result: DetectionResult | null | undefined
): AIQueryResponse {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();
  const stats = sanitizeAndCalculateStats(result);
  const count = stats.totalBuildings;
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Unsupported domains check (Floods, Water, Deforestation, Agriculture, etc.)
  const unsupportedKeywords = [
    'flood', 'water', 'deforestation', 'river', 'sea', 'ocean',
    'agriculture', 'crop', 'farm', 'forest', 'disaster', 'land use', 'classification'
  ];
  if (unsupportedKeywords.some(k => lower.includes(k))) {
    return {
      id: responseId,
      query: query || 'Analyze domain',
      intent: 'UNSUPPORTED_DOMAIN',
      answer: 'Currently, SatQuery AI supports building detection and analysis only.',
      evidenceText: 'Domain restriction: Flood, land-use, deforestation, and water-body classification are not enabled in this building detection prototype.',
      timestamp: nowStr
    };
  }

  // Handle empty query -> default to summary
  if (!query) {
    return generateSummaryResponse(query, stats, nowStr, responseId);
  }

  // Intent 1: Building Count
  if (
    lower.includes('how many') ||
    lower.includes('count') ||
    lower.includes('number of building') ||
    lower.includes('total building') ||
    lower.includes('detected building')
  ) {
    if (count === 0) {
      return {
        id: responseId,
        query,
        intent: 'BUILDING_COUNT',
        answer: 'No buildings were detected in the selected satellite image.',
        evidenceText: 'Based on 0 building footprints extracted by the raster analysis engine.',
        timestamp: nowStr
      };
    }
    return {
      id: responseId,
      query,
      intent: 'BUILDING_COUNT',
      answer: `${count} building${count === 1 ? '' : 's'} were detected in the selected satellite image.`,
      evidenceText: `Based on ${count} building detections returned by the satellite analysis engine.`,
      timestamp: nowStr
    };
  }

  // Intent 2: Average Confidence
  if (
    lower.includes('average confidence') ||
    lower.includes('mean confidence') ||
    lower.includes('avg confidence') ||
    lower.includes('accuracy') ||
    lower.includes('how confident')
  ) {
    if (count === 0) {
      return {
        id: responseId,
        query,
        intent: 'AVERAGE_CONFIDENCE',
        answer: 'No buildings were detected, so average confidence is N/A.',
        evidenceText: '0 detections returned by analysis pipeline.',
        timestamp: nowStr
      };
    }
    return {
      id: responseId,
      query,
      intent: 'AVERAGE_CONFIDENCE',
      answer: `The average detection confidence for the ${count} detected buildings is ${stats.avgConfidence}%.`,
      evidenceText: `Calculated from individual building confidence scores ranging between ${stats.lowestConfidence}% and ${stats.highestConfidence}%.`,
      timestamp: nowStr
    };
  }

  // Intent 3: Highest Confidence
  if (
    lower.includes('highest') ||
    lower.includes('max confidence') ||
    lower.includes('best') ||
    lower.includes('top building') ||
    lower.includes('most confident')
  ) {
    if (count === 0) {
      return {
        id: responseId,
        query,
        intent: 'HIGHEST_CONFIDENCE',
        answer: 'No buildings were detected in this satellite scene.',
        evidenceText: '0 building footprints found.',
        timestamp: nowStr
      };
    }
    const topBuilding = [...stats.validatedDetections].sort((a, b) => b.confidence - a.confidence)[0];
    return {
      id: responseId,
      query,
      intent: 'HIGHEST_CONFIDENCE',
      answer: `Building #${topBuilding.building_id} has the highest detection confidence at ${Math.round(topBuilding.confidence * 100)}% (Footprint Area: ${topBuilding.area_sq_m.toLocaleString()} m²).`,
      evidenceText: 'Highest confidence score identified in the spatial feature map.',
      timestamp: nowStr,
      focusBuildingId: topBuilding.building_id
    };
  }

  // Intent 4: Lowest Confidence
  if (
    lower.includes('lowest') ||
    lower.includes('min confidence') ||
    lower.includes('worst') ||
    lower.includes('least confident')
  ) {
    if (count === 0) {
      return {
        id: responseId,
        query,
        intent: 'LOWEST_CONFIDENCE',
        answer: 'No buildings were detected in this satellite scene.',
        evidenceText: '0 building footprints found.',
        timestamp: nowStr
      };
    }
    const minBuilding = [...stats.validatedDetections].sort((a, b) => a.confidence - b.confidence)[0];
    return {
      id: responseId,
      query,
      intent: 'LOWEST_CONFIDENCE',
      answer: `Building #${minBuilding.building_id} has the lowest detection confidence at ${Math.round(minBuilding.confidence * 100)}% (Footprint Area: ${minBuilding.area_sq_m.toLocaleString()} m²).`,
      evidenceText: 'Lowest confidence score among validated building bounding boxes.',
      timestamp: nowStr,
      focusBuildingId: minBuilding.building_id
    };
  }

  // Intent 5: Summary
  if (
    lower.includes('summary') ||
    lower.includes('overview') ||
    lower.includes('describe') ||
    lower.includes('explain') ||
    lower.includes('tell me about')
  ) {
    return generateSummaryResponse(query, stats, nowStr, responseId);
  }

  // Intent 6: Show Buildings / Highlight
  if (
    lower.includes('show') ||
    lower.includes('highlight') ||
    lower.includes('box') ||
    lower.includes('outline')
  ) {
    return {
      id: responseId,
      query,
      intent: 'SHOW_BUILDINGS',
      answer: `Displaying ${count} building bounding box outlines on the satellite scene.`,
      evidenceText: `${count} building bounding boxes rendered on visual overlay.`,
      timestamp: nowStr
    };
  }

  // Fallback: Unknown Query
  return {
    id: responseId,
    query,
    intent: 'UNKNOWN_QUERY',
    answer: 'I can currently answer questions about detected buildings, building count, and detection confidence.',
    evidenceText: 'Query options: "How many buildings?", "What is the average confidence?", "Which building has highest confidence?", "Give me a summary".',
    timestamp: nowStr
  };
}

function generateSummaryResponse(
  query: string,
  stats: ReturnType<typeof sanitizeAndCalculateStats>,
  nowStr: string,
  responseId: string
): AIQueryResponse {
  const count = stats.totalBuildings;
  if (count === 0) {
    return {
      id: responseId,
      query: query || 'Give me a summary',
      intent: 'BUILDING_SUMMARY',
      answer: 'No buildings were detected in the selected satellite image.',
      evidenceText: '0 building footprints extracted from raster pixel matrix.',
      timestamp: nowStr
    };
  }

  const topBuilding = [...stats.validatedDetections].sort((a, b) => b.confidence - a.confidence)[0];
  const answerText = `SatQuery AI detected ${count} building${count === 1 ? '' : 's'} in the selected satellite image. The average detection confidence is ${stats.avgConfidence}%. The highest-confidence detection is Building #${topBuilding.building_id} at ${Math.round(topBuilding.confidence * 100)}%.`;

  return {
    id: responseId,
    query: query || 'Give me a summary',
    intent: 'BUILDING_SUMMARY',
    answer: answerText,
    evidenceText: `Aggregated spatial statistics across ${count} building detections.`,
    timestamp: nowStr,
    focusBuildingId: topBuilding.building_id
  };
}
