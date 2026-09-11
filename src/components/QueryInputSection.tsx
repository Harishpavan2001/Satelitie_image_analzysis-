import React from 'react';
import { Search, Building, Hash, PieChart, ShieldAlert, X } from 'lucide-react';
import type { QueryOption } from '../types/analysis';

interface QueryInputSectionProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedPresetId?: string;
  onSelectPreset: (preset: QueryOption) => void;
}

const PRESET_QUERIES: QueryOption[] = [
  {
    id: 'detect-buildings',
    title: 'Detect Buildings',
    description: 'Locate and outline all building footprints',
    prompt: 'Detect all building footprints and structural outlines in this satellite image.',
    iconName: 'building',
    badge: 'Popular'
  },
  {
    id: 'count-buildings',
    title: 'Count Buildings',
    description: 'Dynamic tally of individual structures',
    prompt: 'How many buildings are present in this area?',
    iconName: 'count',
    badge: 'Fast'
  },
  {
    id: 'builtup-area',
    title: 'Analyze Built-up Area',
    description: 'Calculate spatial footprint coverage',
    prompt: 'Analyze the total built-up area and structural density across this scene.',
    iconName: 'area'
  }
];

export const QueryInputSection: React.FC<QueryInputSectionProps> = ({
  query,
  onQueryChange,
  selectedPresetId,
  onSelectPreset
}) => {

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'building': return <Building size={18} />;
      case 'count': return <Hash size={18} />;
      case 'area': return <PieChart size={18} />;
      default: return <Building size={18} />;
    }
  };

  return (
    <div className="query-section glass-panel">
      <div className="query-header">
        <div className="label-group">
          <h3 className="query-label">Ask about this image</h3>
          <span className="query-sub">Formulate a query or choose a building detection preset action below</span>
        </div>
        <div className="domain-restriction-chip">
          <ShieldAlert size={14} />
          <span>Building Analysis Mode Only</span>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="input-wrapper">
        <Search className="input-search-icon" size={20} />
        <input
          type="text"
          className="query-text-input"
          placeholder="e.g., How many buildings are present in this area?"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button 
            className="clear-input-btn"
            onClick={() => onQueryChange('')}
            title="Clear query"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Example Query Action Cards */}
      <div className="presets-container">
        <span className="presets-title">Quick Action Presets:</span>
        <div className="presets-grid">
          {PRESET_QUERIES.map((preset) => {
            const isSelected = selectedPresetId === preset.id || query === preset.prompt;
            return (
              <div
                key={preset.id}
                className={`preset-card ${isSelected ? 'preset-active' : ''}`}
                onClick={() => onSelectPreset(preset)}
              >
                <div className="preset-card-top">
                  <div className="preset-icon-box">
                    {renderIcon(preset.iconName)}
                  </div>
                  {preset.badge && (
                    <span className="preset-badge">{preset.badge}</span>
                  )}
                </div>
                <div className="preset-card-body">
                  <h4 className="preset-title">{preset.title}</h4>
                  <p className="preset-desc">{preset.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .query-section {
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .query-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .label-group {
          display: flex;
          flex-direction: column;
        }

        .query-label {
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
        }

        .query-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .domain-restriction-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          color: var(--primary-blue);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .input-search-icon {
          position: absolute;
          left: 1rem;
          color: var(--primary-cyan);
          pointer-events: none;
        }

        .query-text-input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.95rem 2.8rem 0.95rem 2.8rem;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.95rem;
          transition: all 0.25s ease;
        }

        .query-text-input:focus {
          outline: none;
          border-color: var(--primary-cyan);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
          background: rgba(8, 13, 23, 0.95);
        }

        .query-text-input::placeholder {
          color: var(--text-dim);
        }

        .clear-input-btn {
          position: absolute;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-input-btn:hover {
          color: #ffffff;
        }

        .presets-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .presets-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }

        .preset-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .preset-card:hover {
          background: rgba(30, 41, 59, 0.7);
          border-color: var(--primary-blue);
          transform: translateY(-2px);
        }

        .preset-card.preset-active {
          background: rgba(0, 242, 254, 0.08);
          border-color: var(--primary-cyan);
          box-shadow: var(--glow-cyan);
        }

        .preset-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preset-icon-box {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background: rgba(56, 189, 248, 0.1);
          color: var(--primary-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preset-active .preset-icon-box {
          background: var(--primary-cyan);
          color: #040914;
        }

        .preset-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(0, 242, 254, 0.15);
          color: var(--primary-cyan);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .preset-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: #ffffff;
        }

        .preset-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
};
