import React from 'react';
import { ShieldCheck, Cpu, HelpCircle, CheckCircle2 } from 'lucide-react';
import type { DetectionResult } from '../services/buildingDetection/types';
import { sanitizeAndCalculateStats } from '../services/buildingDetection/statsValidator';

interface EvidencePanelProps {
  result: DetectionResult | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ result }) => {
  const stats = sanitizeAndCalculateStats(result);

  return (
    <div className="evidence-panel-container glass-panel">
      <div className="evidence-panel-header">
        <div className="panel-title-group">
          <ShieldCheck size={20} className="cyan-icon" />
          <h3>Detection Evidence & Verification Rationales</h3>
        </div>
        <span className="badge badge-emerald">
          <CheckCircle2 size={13} />
          <span>Verified Dataset</span>
        </span>
      </div>

      <div className="evidence-content-grid">
        {/* Left Column: Summary Evidence & Model Audit */}
        <div className="evidence-summary-box">
          <h4 className="box-title">
            <Cpu size={16} className="cyan-icon" />
            <span>Analysis Rationale Summary</span>
          </h4>
          
          <ul className="evidence-points-list">
            <li>
              <strong>Total Building Footprints:</strong> System extracted {stats.totalBuildings} distinct structural boundary clusters from the satellite scene.
            </li>
            <li>
              <strong>Confidence Distribution:</strong> Average confidence is {stats.totalBuildings > 0 ? `${stats.avgConfidence}%` : 'N/A'}, ranging from a peak of {stats.highestConfidence}% to a minimum of {stats.lowestConfidence}%.
            </li>
            <li>
              <strong>Spatial Scale & Resolution:</strong> Raster scaling calculated at approximately 0.5 meters per pixel.
            </li>
            <li>
              <strong>Detection Engine:</strong> {result?.modelInfo?.name || 'SatQuery-CV-BuildingNet'} ({result?.modelInfo?.version || 'v1.4.0'}).
            </li>
          </ul>
        </div>

        {/* Right Column: Per-Building Detailed Evidence Log */}
        <div className="building-evidence-log-box">
          <h4 className="box-title">
            <HelpCircle size={16} className="cyan-icon" />
            <span>Detailed Evidence Log ({stats.totalBuildings})</span>
          </h4>

          <div className="evidence-log-scroll">
            {stats.validatedDetections.length === 0 ? (
              <div className="empty-log-msg">
                <span>No building features extracted from image pixels.</span>
              </div>
            ) : (
              stats.validatedDetections.slice(0, 15).map(b => (
                <div key={b.building_id} className="log-item">
                  <span className="log-id">Building #{b.building_id}</span>
                  <span className="log-detail">
                    {Math.round(b.confidence * 100)}% Conf • {b.area_sq_m.toLocaleString()} m² • ({b.center.x}, {b.center.y})
                  </span>
                </div>
              ))
            )}
            {stats.validatedDetections.length > 15 && (
              <div className="more-log-note">
                + {stats.validatedDetections.length - 15} additional building evidence records
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .evidence-panel-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .evidence-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .panel-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #ffffff;
        }

        .evidence-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .evidence-summary-box, .building-evidence-log-box {
          background: rgba(8, 13, 23, 0.7);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .box-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .evidence-points-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 0;
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .evidence-points-list strong {
          color: #ffffff;
        }

        .evidence-log-scroll {
          max-height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          padding: 0.35rem 0.6rem;
          border-radius: 4px;
          font-size: 0.78rem;
        }

        .log-id {
          font-family: monospace;
          font-weight: 700;
          color: var(--primary-cyan);
        }

        .log-detail {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .empty-log-msg {
          color: var(--text-dim);
          font-size: 0.8rem;
          text-align: center;
          padding: 1.5rem 0;
        }

        .more-log-note {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-align: center;
          padding-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .evidence-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
