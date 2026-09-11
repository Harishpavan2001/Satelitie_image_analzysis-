import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  RefreshCw, 
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import type { SatelliteImageFile } from '../types/analysis';
import type { DetectionResult } from '../services/buildingDetection/types';
import { sanitizeAndCalculateStats } from '../services/buildingDetection/statsValidator';
import { processUserQuery, type AIQueryResponse } from '../services/aiQueryEngine';
import { downloadAnalysisReport } from '../services/reportGenerator';
import { BuildingOverlay } from './BuildingOverlay';
import { AIResponsePanel } from './AIResponsePanel';
import { EvidencePanel } from './EvidencePanel';

interface ResultsScreenProps {
  image: SatelliteImageFile | null;
  result: DetectionResult | null;
  query?: string;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  image,
  result,
  query
}) => {
  const navigate = useNavigate();
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(result);
  const [queryHistory, setQueryHistory] = useState<AIQueryResponse[]>([]);

  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});
  const visualizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveResult(result);
  }, [result]);

  // Generate initial AI response on load using initial query
  useEffect(() => {
    if (activeResult) {
      const initialResp = processUserQuery(query || 'How many buildings are present?', activeResult);
      setQueryHistory([initialResp]);
    }
  }, [activeResult, query]);

  // Handle bidirectional scroll into view when building is selected on overlay or list
  useEffect(() => {
    if (selectedBuildingId !== null && rowRefs.current[selectedBuildingId]) {
      rowRefs.current[selectedBuildingId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedBuildingId]);

  if (!image) {
    return (
      <div className="results-fallback glass-panel">
        <Info size={48} className="cyan-icon" />
        <h2>No Satellite Image Available</h2>
        <p>Please upload or select a satellite image before viewing detection results.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Go to Upload & Ask</span>
        </button>
        <style>{`
          .results-fallback {
            padding: 4rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            max-width: 540px;
            margin: 3rem auto;
          }
          .results-fallback h2 { color: #ffffff; font-size: 1.5rem; }
          .results-fallback p { color: var(--text-muted); font-size: 0.95rem; }
        `}</style>
      </div>
    );
  }

  // Calculate dynamic stats using data sanitizer
  const stats = sanitizeAndCalculateStats(activeResult);

  // Filter building list based on user search
  const filteredBuildings = stats.validatedDetections.filter(d => 
    searchFilter === '' || 
    d.building_id.toString().includes(searchFilter) ||
    d.building_type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Handle User Query submission from AI Panel
  const handleUserQuerySubmit = (newQuery: string) => {
    const response = processUserQuery(newQuery, activeResult);
    setQueryHistory(prev => [response, ...prev]);
    if (response.focusBuildingId) {
      setSelectedBuildingId(response.focusBuildingId);
    }
  };

  // Handle View Evidence Action
  const handleViewEvidence = (resp: AIQueryResponse) => {
    if (resp.focusBuildingId) {
      setSelectedBuildingId(resp.focusBuildingId);
    }
    if (visualizerRef.current) {
      visualizerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Trigger Report Download
  const handleDownloadReport = () => {
    downloadAnalysisReport(image, activeResult, query);
  };

  return (
    <div className="results-screen-container screen-fade-in">
      {/* Navigation & Action Bar */}
      <div className="results-nav-bar">
        <div className="nav-left">
          <button className="btn-secondary back-btn" onClick={() => navigate('/processing')}>
            <ArrowLeft size={18} />
            <span>Back to Processing</span>
          </button>
          <button className="btn-secondary back-btn" onClick={() => navigate('/')}>
            <RefreshCw size={14} />
            <span>New Analysis</span>
          </button>
        </div>

        <div className="nav-right">
          <button className="btn-primary download-report-btn" onClick={handleDownloadReport}>
            <Download size={16} />
            <span>Download Analysis Report</span>
          </button>

          <div className="badge badge-emerald">
            <CheckCircle2 size={14} />
            <span>Analysis Verified</span>
          </div>
        </div>
      </div>

      {/* Main Page Title */}
      <div className="results-page-header">
        <h1 className="page-title gradient-text">Building Detection Results</h1>
        <p className="page-subtitle">
          AI-detected building footprints, dynamic statistics, and query evidence
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-cards-grid">
        {/* Card 1: Buildings Detected */}
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box cyan-bg">
            <Building size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Buildings Detected</span>
            <span className="kpi-value cyan-val">{stats.totalBuildings}</span>
          </div>
        </div>

        {/* Card 2: Average Confidence */}
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box emerald-bg">
            <Percent size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Avg. Confidence</span>
            <span className="kpi-value emerald-val">
              {stats.totalBuildings > 0 ? `${stats.avgConfidence}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 3: Highest Confidence */}
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box blue-bg">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Highest Confidence</span>
            <span className="kpi-value">
              {stats.totalBuildings > 0 ? `${stats.highestConfidence}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 4: Lowest Confidence */}
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-box amber-bg">
            <TrendingDown size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Lowest Confidence</span>
            <span className="kpi-value amber-val">
              {stats.totalBuildings > 0 ? `${stats.lowestConfidence}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="results-workspace-grid">
        {/* Left Column: Satellite Image Overlay Visualizer */}
        <div className="visualizer-column" ref={visualizerRef}>
          <BuildingOverlay
            previewUrl={image.previewUrl}
            detections={stats.validatedDetections}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={(b) => setSelectedBuildingId(b ? b.building_id : null)}
          />

          {/* Visual Legend */}
          <div className="legend-bar glass-panel">
            <span className="legend-title">Legend:</span>
            <div className="legend-item">
              <span className="legend-box-sample" />
              <span>Detected Footprint</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge-sample">#ID</span>
              <span>Building Number</span>
            </div>
            <div className="legend-item">
              <span className="legend-conf-sample">●</span>
              <span>High Conf (&gt;85%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Response Panel & Building Details List */}
        <div className="analytics-column">
          {/* Phase 6 AI Query & Response Panel */}
          <AIResponsePanel
            history={queryHistory}
            onSubmitQuery={handleUserQuerySubmit}
            onViewEvidence={handleViewEvidence}
          />

          {/* Building Details List Panel */}
          <div className="building-list-panel glass-panel">
            <div className="list-panel-header">
              <div className="list-title-group">
                <FileText size={18} className="cyan-icon" />
                <h3>Building Details ({filteredBuildings.length})</h3>
              </div>

              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by ID or type..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="list-search-input"
                />
              </div>
            </div>

            {/* Zero Detections View */}
            {stats.totalBuildings === 0 ? (
              <div className="zero-detections-box">
                <AlertCircle size={36} className="amber-icon" />
                <h4>No Buildings Detected</h4>
                <p>The AI model found zero structural footprints in this satellite scene region.</p>
              </div>
            ) : (
              /* Building List Table */
              <div className="building-table-wrapper">
                <table className="building-table">
                  <thead>
                    <tr>
                      <th>Building ID</th>
                      <th>Type</th>
                      <th>Area (m²)</th>
                      <th>Confidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuildings.map((b) => {
                      const isSelected = selectedBuildingId === b.building_id;
                      return (
                        <tr 
                          key={b.building_id} 
                          ref={(el) => { rowRefs.current[b.building_id] = el; }}
                          className={`table-row ${isSelected ? 'row-selected' : ''}`}
                          onClick={() => setSelectedBuildingId(isSelected ? null : b.building_id)}
                        >
                          <td className="id-cell">
                            <span className="id-tag">Building #{b.building_id}</span>
                          </td>
                          <td className="type-cell">{b.building_type}</td>
                          <td className="area-cell">{b.area_sq_m.toLocaleString()} m²</td>
                          <td className="conf-cell">
                            <span className={`conf-badge ${b.confidence >= 0.85 ? 'high' : 'med'}`}>
                              {Math.round(b.confidence * 100)}%
                            </span>
                          </td>
                          <td className="action-cell">
                            <button className="focus-btn">
                              {isSelected ? 'Focused' : 'Locate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <EvidencePanel result={activeResult} />

      <style>{`
        .screen-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .results-screen-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }

        .results-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .download-report-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .results-page-header {
          text-align: center;
          margin-bottom: 0.2rem;
        }

        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.2rem;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        /* KPI Cards */
        .kpi-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.85rem;
        }

        .kpi-card {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .kpi-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cyan-bg { background: rgba(0, 242, 254, 0.12); color: var(--primary-cyan); }
        .emerald-bg { background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); }
        .blue-bg { background: rgba(56, 189, 248, 0.12); color: var(--primary-blue); }
        .amber-bg { background: rgba(245, 158, 11, 0.12); color: var(--accent-amber); }

        .kpi-info {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .kpi-value {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .cyan-val { color: var(--primary-cyan); }
        .emerald-val { color: var(--accent-emerald); }
        .amber-val { color: var(--accent-amber); }

        /* Workspace Grid */
        .results-workspace-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.5rem;
          align-items: start;
        }

        .visualizer-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: sticky;
          top: 80px;
        }

        .legend-bar {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 0.6rem 1rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .legend-title {
          font-weight: 600;
          color: #ffffff;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .legend-box-sample {
          width: 12px;
          height: 12px;
          border: 2px solid var(--primary-cyan);
          background: rgba(0, 242, 254, 0.15);
          border-radius: 2px;
        }

        .legend-badge-sample {
          background: var(--primary-cyan);
          color: #040914;
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 3px;
          border-radius: 2px;
        }

        .legend-conf-sample {
          color: var(--accent-emerald);
          font-size: 0.75rem;
        }

        .analytics-column {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .building-list-panel {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .list-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .list-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.6rem;
          color: var(--text-dim);
        }

        .list-search-input {
          background: rgba(8, 13, 23, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.6rem 0.35rem 1.8rem;
          color: #ffffff;
          font-size: 0.78rem;
          width: 170px;
        }

        .list-search-input:focus {
          outline: none;
          border-color: var(--primary-cyan);
        }

        .zero-detections-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          gap: 0.6rem;
        }

        .amber-icon { color: var(--accent-amber); }

        .zero-detections-box h4 {
          font-size: 1.1rem;
          color: #ffffff;
        }

        .zero-detections-box p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .building-table-wrapper {
          max-height: 340px;
          overflow-y: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .building-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.82rem;
        }

        .building-table th {
          background: rgba(8, 13, 23, 0.9);
          color: var(--text-muted);
          font-weight: 600;
          padding: 0.6rem 0.85rem;
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 1px solid var(--border-subtle);
        }

        .table-row {
          border-bottom: 1px solid rgba(56, 189, 248, 0.08);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .table-row:hover {
          background: rgba(0, 242, 254, 0.06);
        }

        .table-row.row-selected {
          background: rgba(16, 185, 129, 0.15);
        }

        .building-table td {
          padding: 0.55rem 0.85rem;
          color: #ffffff;
        }

        .id-tag {
          font-family: monospace;
          font-weight: 700;
          color: var(--primary-cyan);
        }

        .type-cell {
          text-transform: capitalize;
          color: var(--text-muted);
        }

        .conf-badge {
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .conf-badge.high {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-emerald);
        }

        .conf-badge.med {
          background: rgba(0, 242, 254, 0.15);
          color: var(--primary-cyan);
        }

        .focus-btn {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--primary-cyan);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          cursor: pointer;
        }

        .table-row:hover .focus-btn, .table-row.row-selected .focus-btn {
          background: var(--primary-cyan);
          color: #040914;
        }

        @media (max-width: 900px) {
          .results-workspace-grid {
            grid-template-columns: 1fr;
          }
          .visualizer-column {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};
