import React, { useState } from 'react';
import type { BuildingDetection } from '../services/buildingDetection/types';
import { Crosshair, Eye, EyeOff, Layers, Image as ImageIcon } from 'lucide-react';

interface BuildingOverlayProps {
  previewUrl: string;
  detections: BuildingDetection[];
  selectedBuildingId?: number | null;
  onSelectBuilding?: (building: BuildingDetection | null) => void;
}

export const BuildingOverlay: React.FC<BuildingOverlayProps> = ({
  previewUrl,
  detections,
  selectedBuildingId,
  onSelectBuilding
}) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingDetection | null>(null);
  const [viewMode, setViewMode] = useState<'detected' | 'original'>('detected');
  const [showBoxes, setShowBoxes] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [highConfOnly, setHighConfOnly] = useState(false);

  const filteredDetections = highConfOnly 
    ? detections.filter(d => d.confidence >= 0.85) 
    : detections;

  const activeBuilding = hoveredBuilding || detections.find(d => d.building_id === selectedBuildingId);

  return (
    <div className="overlay-widget-container">
      {/* Visual Overlay Top Controls */}
      <div className="overlay-controls-bar">
        {/* Original vs Detected View Selector */}
        <div className="view-mode-selector">
          <button 
            className={`mode-btn ${viewMode === 'detected' ? 'active' : ''}`}
            onClick={() => setViewMode('detected')}
          >
            <Layers size={14} />
            <span>AI Detected View</span>
          </button>
          <button 
            className={`mode-btn ${viewMode === 'original' ? 'active' : ''}`}
            onClick={() => setViewMode('original')}
          >
            <ImageIcon size={14} />
            <span>Original Satellite View</span>
          </button>
        </div>

        {viewMode === 'detected' && (
          <div className="overlay-toggles">
            <button 
              className={`toggle-chip ${showBoxes ? 'active' : ''}`}
              onClick={() => setShowBoxes(!showBoxes)}
              title="Toggle Bounding Boxes"
            >
              {showBoxes ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Boxes</span>
            </button>

            <button 
              className={`toggle-chip ${showBadges ? 'active' : ''}`}
              onClick={() => setShowBadges(!showBadges)}
              title="Toggle Building ID Badges"
            >
              <span>IDs</span>
            </button>

            <button 
              className={`toggle-chip ${highConfOnly ? 'active' : ''}`}
              onClick={() => setHighConfOnly(!highConfOnly)}
              title="Show High Confidence Only (>85%)"
            >
              <span>High Conf (&gt;85%)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Image Container with Responsive Bounding Boxes */}
      <div className="image-overlay-viewport">
        <img 
          src={previewUrl} 
          alt="Analyzed Satellite Scene" 
          className="base-satellite-img" 
        />

        {viewMode === 'detected' && showBoxes && (
          <div className="boxes-layer">
            {filteredDetections.map((d) => {
              const isSelected = selectedBuildingId === d.building_id;
              const isHovered = hoveredBuilding?.building_id === d.building_id;
              const isHighlighted = isSelected || isHovered;

              const style: React.CSSProperties = {
                left: `${d.bounding_box.x * 100}%`,
                top: `${d.bounding_box.y * 100}%`,
                width: `${d.bounding_box.width * 100}%`,
                height: `${d.bounding_box.height * 100}%`
              };

              return (
                <div
                  key={d.building_id}
                  className={`bounding-box-item ${isHighlighted ? 'highlighted' : ''}`}
                  style={style}
                  onMouseEnter={() => setHoveredBuilding(d)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  onClick={() => onSelectBuilding && onSelectBuilding(d)}
                >
                  {showBadges && (
                    <span className="building-badge">
                      #{d.building_id}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hover / Selection Detail Tooltip Overlay */}
        {viewMode === 'detected' && activeBuilding && (
          <div className="building-tooltip-card glass-panel">
            <div className="tooltip-header">
              <span className="tooltip-title">Building #{activeBuilding.building_id}</span>
              <span className="tooltip-conf">
                {Math.round(activeBuilding.confidence * 100)}% Conf
              </span>
            </div>
            <div className="tooltip-grid">
              <div className="tooltip-item">
                <span className="t-label">Dimensions:</span>
                <span className="t-val">{activeBuilding.width}m × {activeBuilding.height}m</span>
              </div>
              <div className="tooltip-item">
                <span className="t-label">Footprint Area:</span>
                <span className="t-val">{activeBuilding.area_sq_m.toLocaleString()} m²</span>
              </div>
              <div className="tooltip-item">
                <span className="t-label">Class:</span>
                <span className="t-val type-tag">{activeBuilding.building_type}</span>
              </div>
              <div className="tooltip-item">
                <span className="t-label">Center Coords:</span>
                <span className="t-val">({activeBuilding.center.x}, {activeBuilding.center.y})</span>
              </div>
            </div>
          </div>
        )}

        <div className="reticle-footer-bar">
          <Crosshair size={14} className="cyan-icon" />
          <span>
            {viewMode === 'detected' 
              ? `AI OVERLAY ACTIVE • ${filteredDetections.length} BUILDINGS MARKED` 
              : 'ORIGINAL SATELLITE IMAGE • UNTOUCHED RASTER'}
          </span>
        </div>
      </div>

      <style>{`
        .overlay-widget-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .overlay-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          background: rgba(14, 20, 33, 0.6);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .view-mode-selector {
          display: flex;
          gap: 0.35rem;
          background: rgba(8, 13, 23, 0.7);
          padding: 0.2rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .mode-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.2s ease;
        }

        .mode-btn:hover {
          color: #ffffff;
        }

        .mode-btn.active {
          background: rgba(0, 242, 254, 0.15);
          color: var(--primary-cyan);
          font-weight: 700;
        }

        .overlay-toggles {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .toggle-chip {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s ease;
        }

        .toggle-chip:hover {
          color: #ffffff;
          border-color: var(--primary-blue);
        }

        .toggle-chip.active {
          background: rgba(0, 242, 254, 0.12);
          color: var(--primary-cyan);
          border-color: rgba(0, 242, 254, 0.35);
        }

        .image-overlay-viewport {
          position: relative;
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #04070d;
          border: 1px solid var(--border-subtle);
        }

        .base-satellite-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .boxes-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bounding-box-item {
          position: absolute;
          border: 2px solid rgba(0, 242, 254, 0.75);
          background: rgba(0, 242, 254, 0.08);
          box-shadow: 0 0 8px rgba(0, 242, 254, 0.3);
          pointer-events: auto;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 2px;
        }

        .bounding-box-item:hover, .bounding-box-item.highlighted {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.25);
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.7);
          z-index: 20;
        }

        .building-badge {
          position: absolute;
          top: -18px;
          left: -2px;
          background: #00f2fe;
          color: #040914;
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          pointer-events: none;
          white-space: nowrap;
        }

        .bounding-box-item.highlighted .building-badge {
          background: #10b981;
          color: #ffffff;
        }

        .building-tooltip-card {
          position: absolute;
          bottom: 40px;
          right: 16px;
          z-index: 30;
          padding: 0.85rem 1rem;
          max-width: 280px;
          border-color: rgba(0, 242, 254, 0.4);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
          animation: fadeIn 0.2s ease-out;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.5rem;
        }

        .tooltip-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #ffffff;
        }

        .tooltip-conf {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-emerald);
          background: rgba(16, 185, 129, 0.12);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .tooltip-grid {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.78rem;
        }

        .tooltip-item {
          display: flex;
          justify-content: space-between;
        }

        .t-label {
          color: var(--text-muted);
        }

        .t-val {
          color: #ffffff;
          font-weight: 600;
        }

        .type-tag {
          color: var(--primary-cyan);
          text-transform: capitalize;
        }

        .reticle-footer-bar {
          position: absolute;
          bottom: 8px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
          background: rgba(4, 7, 13, 0.7);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
