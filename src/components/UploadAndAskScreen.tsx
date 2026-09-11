import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadDropzone } from './UploadDropzone';
import { QueryInputSection } from './QueryInputSection';
import { PrimaryActionButton } from './PrimaryActionButton';
import type { SatelliteImageFile, QueryOption } from '../types/analysis';
import { Sparkles, Scan } from 'lucide-react';

interface UploadAndAskScreenProps {
  selectedImage: SatelliteImageFile | null;
  onImageSelected: (image: SatelliteImageFile | null) => void;
  queryText: string;
  onQueryChange: (query: string) => void;
  selectedPresetId?: string;
  onSelectPreset: (preset: QueryOption) => void;
}

export const UploadAndAskScreen: React.FC<UploadAndAskScreenProps> = ({
  selectedImage,
  onImageSelected,
  queryText,
  onQueryChange,
  selectedPresetId,
  onSelectPreset
}) => {
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (!selectedImage) return;
    navigate('/processing');
  };

  return (
    <div className="screen-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="cyan-sparkle" />
          <span>Smart India Hackathon 2026 Engine</span>
        </div>
        
        <h1 className="hero-title gradient-text">
          Analyze satellite imagery
        </h1>
        
        <p className="hero-subtitle">
          AI-powered building detection and structural analysis
        </p>
      </section>

      {/* Core Upload & Query Card Stack */}
      <div className="analysis-workspace">
        {/* Step 1: Upload Satellite Image Area */}
        <section className="section-block">
          <div className="section-label-row">
            <Scan size={18} className="section-icon" />
            <h2>1. Satellite Image Source</h2>
          </div>

          <UploadDropzone
            image={selectedImage}
            onImageSelected={onImageSelected}
          />
        </section>

        {/* Step 2: Query Prompt Input & Quick Preset Buttons */}
        <section className="section-block">
          <div className="section-label-row">
            <Scan size={18} className="section-icon" />
            <h2>2. Building Analysis Query</h2>
          </div>

          <QueryInputSection
            query={queryText}
            onQueryChange={onQueryChange}
            selectedPresetId={selectedPresetId}
            onSelectPreset={onSelectPreset}
          />
        </section>

        {/* Step 3: Primary Action Button */}
        <PrimaryActionButton
          image={selectedImage}
          query={queryText}
          onStartAnalysis={handleStartAnalysis}
        />
      </div>

      <style>{`
        .screen-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.25);
          color: var(--primary-cyan);
          padding: 0.35rem 0.9rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.6rem;
          line-height: 1.15;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .analysis-workspace {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-label-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--primary-blue);
        }

        .section-label-row h2 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .section-icon {
          color: var(--primary-cyan);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 0.98rem;
          }
        }
      `}</style>
    </div>
  );
};
