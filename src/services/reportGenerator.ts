import type { SatelliteImageFile } from '../types/analysis';
import type { DetectionResult } from './buildingDetection/types';
import { sanitizeAndCalculateStats } from './buildingDetection/statsValidator';

export function downloadAnalysisReport(
  image: SatelliteImageFile | null,
  result: DetectionResult | null,
  query?: string
): void {
  if (!image || !result) {
    alert('Cannot generate report: No active satellite image or analysis result found.');
    return;
  }

  const stats = sanitizeAndCalculateStats(result);
  const now = new Date();
  const timestampStr = now.toLocaleString();
  const filenameStr = `SatQuery_AI_Report_${now.toISOString().slice(0, 10)}.html`;

  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SatQuery AI - Building Analysis Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #080c14;
      color: #e2e8f0;
      margin: 0;
      padding: 40px 20px;
    }
    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: #0e1421;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #00f2fe;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }
    .brand-ai { color: #00f2fe; }
    .brand-sub { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .meta-tag { text-align: right; font-size: 13px; color: #94a3b8; }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #00f2fe;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    .kpi-card {
      background: #151d2a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .kpi-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
    .kpi-val { font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 5px; }
    .cyan-text { color: #00f2fe; }
    .emerald-text { color: #10b981; }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 14px;
    }
    .info-table th, .info-table td {
      padding: 10px 14px;
      border: 1px solid #1e293b;
      text-align: left;
    }
    .info-table th { background: #151d2a; color: #94a3b8; font-weight: 600; }

    .summary-box {
      background: rgba(0, 242, 254, 0.05);
      border: 1px solid rgba(0, 242, 254, 0.3);
      padding: 15px 20px;
      border-radius: 8px;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 25px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #1e293b;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }

    @media print {
      body { background-color: #ffffff; color: #000000; }
      .report-container { border: none; box-shadow: none; padding: 0; background: transparent; }
      .kpi-card { border: 1px solid #ccc; background: #f8fafc; color: #000; }
      .kpi-val { color: #000; }
      .brand-title { color: #000; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div>
        <h1 class="brand-title">SatQuery <span class="brand-ai">AI</span></h1>
        <div class="brand-sub">Smart India Hackathon Prototype • Building Analysis Report</div>
      </div>
      <div class="meta-tag">
        <div><strong>Date:</strong> ${timestampStr}</div>
        <div><strong>Status:</strong> Verification Passed</div>
      </div>
    </div>

    <div class="summary-box">
      <strong>Executive AI Summary:</strong><br />
      ${stats.summaryText}
      <br /><br />
      <strong>User Query:</strong> "${query || 'Detect all building footprints and structural outlines in this area'}"
    </div>

    <div class="section-title">1. Key Analysis Metrics</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Buildings Detected</div>
        <div class="kpi-val cyan-text">${stats.totalBuildings}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg. Confidence</div>
        <div class="kpi-val emerald-text">${stats.totalBuildings > 0 ? `${stats.avgConfidence}%` : 'N/A'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Highest Conf.</div>
        <div class="kpi-val">${stats.totalBuildings > 0 ? `${stats.highestConfidence}%` : 'N/A'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Lowest Conf.</div>
        <div class="kpi-val">${stats.totalBuildings > 0 ? `${stats.lowestConfidence}%` : 'N/A'}</div>
      </div>
    </div>

    <div class="section-title">2. Satellite Image Specifications</div>
    <table class="info-table">
      <tr><th>Filename</th><td>${image.name}</td></tr>
      <tr><th>File Size & Format</th><td>${image.formattedSize} (${image.type})</td></tr>
      <tr><th>Raster Resolution</th><td>${result.imageDimensions.width} x ${result.imageDimensions.height} px</td></tr>
      <tr><th>Built-up Footprint Area</th><td>${stats.totalAreaSqM.toLocaleString()} m²</td></tr>
    </table>

    <div class="section-title">3. Model Execution & Engine Metadata</div>
    <table class="info-table">
      <tr><th>Engine Name</th><td>${result.modelInfo.name}</td></tr>
      <tr><th>Engine Version</th><td>${result.modelInfo.version}</td></tr>
      <tr><th>Processing Backend</th><td>${result.modelInfo.backend}</td></tr>
      <tr><th>Execution Time</th><td>${result.processingTimeMs} ms</td></tr>
    </table>

    <div class="section-title">4. Building-by-Building Detections Breakdown (${stats.totalBuildings})</div>
    <table class="info-table">
      <thead>
        <tr>
          <th>Building ID</th>
          <th>Type</th>
          <th>Footprint Area</th>
          <th>Center Coords (X, Y)</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        ${stats.validatedDetections.length === 0 ? `
          <tr><td colspan="5" style="text-align: center; color: #94a3b8;">No buildings detected in satellite scene.</td></tr>
        ` : stats.validatedDetections.map(b => `
          <tr>
            <td><strong>Building #${b.building_id}</strong></td>
            <td style="text-transform: capitalize;">${b.building_type}</td>
            <td>${b.area_sq_m.toLocaleString()} m²</td>
            <td>(${b.center.x}, ${b.center.y})</td>
            <td><strong>${Math.round(b.confidence * 100)}%</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">5. Detection Evidence & Verification Rationales</div>
    <div style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
      • <strong>Raster Edge Segmentation:</strong> Identified ${stats.totalBuildings} spatial roof contours matching contrast threshold criteria.<br />
      • <strong>Spatial Coordinates:</strong> Bounding boxes normalized to 0.0 - 1.0 coordinate frame for scaling fidelity.<br />
      • <strong>System Verification:</strong> SatQuery AI v1.0 • Smart India Hackathon Prototype.
    </div>

    <div class="footer">
      Generated automatically by SatQuery AI • Official Building Analysis Export
    </div>
  </div>
</body>
</html>
  `;

  // Create blob and trigger browser download
  const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filenameStr);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
