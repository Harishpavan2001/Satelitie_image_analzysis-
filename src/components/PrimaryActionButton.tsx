import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import type { SatelliteImageFile } from '../types/analysis';

interface PrimaryActionButtonProps {
  image: SatelliteImageFile | null;
  query: string;
  onStartAnalysis?: () => void;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  image,
  onStartAnalysis
}) => {
  const isReady = !!image;

  const handleClick = () => {
    if (!isReady) return;
    if (onStartAnalysis) {
      onStartAnalysis();
    }
  };

  return (
    <div className="primary-action-container">
      <button
        className="btn-primary start-analysis-btn"
        disabled={!isReady}
        onClick={handleClick}
      >
        <Target size={22} className="target-pulse-icon" />
        <span>Start Building Analysis</span>
        <ArrowRight size={20} />
      </button>

      {!isReady && (
        <p className="action-hint">
          * Please upload or select a satellite image above to begin building analysis
        </p>
      )}

      <style>{`
        .primary-action-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          width: 100%;
        }

        .start-analysis-btn {
          width: 100%;
          max-width: 480px;
          padding: 1.1rem 2rem;
          font-size: 1.1rem;
          border-radius: var(--radius-md);
        }

        .target-pulse-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }

        .action-hint {
          font-size: 0.82rem;
          color: var(--text-dim);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
