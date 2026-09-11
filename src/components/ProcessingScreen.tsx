import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Circle, 
  FileImage, 
  Cpu, 
  Clock,
  Sparkles,
  UploadCloud,
  AlertTriangle
} from 'lucide-react';
import type { SatelliteImageFile, ProcessingStepItem } from '../types/analysis';
import type { DetectionResult } from '../services/buildingDetection/types';
import { analyzeSatelliteImage } from '../services/buildingDetection/detectionService';

interface ProcessingScreenProps {
  image: SatelliteImageFile | null;
  query: string;
  onDetectionComplete?: (result: DetectionResult) => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  image,
  query,
  onDetectionComplete
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  const [steps, setSteps] = useState<ProcessingStepItem[]>([
    {
      id: 'step-1',
      label: 'Understanding Query',
      description: 'Parsing prompt parameters & spatial extent',
      status: 'current'
    },
    {
      id: 'step-2',
      label: 'Selecting Building Detection Model',
      description: 'Loading high-resolution CNN segmentation weights',
      status: 'pending'
    },
    {
      id: 'step-3',
      label: 'Analyzing Image',
      description: 'Raster tiling & feature map extraction',
      status: 'pending'
    },
    {
      id: 'step-4',
      label: 'Generating Results',
      description: 'Aggregating footprint counts & vector geometries',
      status: 'pending'
    }
  ]);

  // Execute Building Detection Engine
  useEffect(() => {
    if (!image) return;

    let isMounted = true;
    setErrorMessage(null);

    async function runDetectionPipeline() {
      try {
        // Step 1: Query analysis
        setProgress(25);
        await new Promise(r => setTimeout(r, 400));

        if (!isMounted) return;
        // Step 2: Model selection
        setProgress(55);
        await new Promise(r => setTimeout(r, 500));

        if (!isMounted) return;
        // Step 3: Run Computer Vision Engine
        setProgress(75);
        const result = await analyzeSatelliteImage(image);

        if (!isMounted) return;
        // Step 4: Complete
        setProgress(100);
        setDetectionResult(result);
        if (onDetectionComplete) {
          onDetectionComplete(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Detection failed. Please check image input.');
        }
      }
    }

    runDetectionPipeline();

    return () => {
      isMounted = false;
    };
  }, [image]);

  // Update step statuses based on progress percentage
  useEffect(() => {
    if (!image) return;
    setSteps((prevSteps) => {
      return prevSteps.map((step, index) => {
        if (index === 0) {
          if (progress >= 25) return { ...step, status: 'completed' };
          return { ...step, status: 'current' };
        } else if (index === 1) {
          if (progress >= 55) return { ...step, status: 'completed' };
          if (progress >= 25) return { ...step, status: 'current' };
          return { ...step, status: 'pending' };
        } else if (index === 2) {
          if (progress >= 100) return { ...step, status: 'completed' };
          if (progress >= 55) return { ...step, status: 'current' };
          return { ...step, status: 'pending' };
        } else {
          if (progress >= 100) return { ...step, status: 'completed' };
          if (progress >= 85) return { ...step, status: 'current' };
          return { ...step, status: 'pending' };
        }
      });
    });
  }, [progress, image]);

  if (!image) {
    return (
      <div className="processing-fallback-card glass-panel">
        <UploadCloud size={48} className="cyan-icon" />
        <h2>No Satellite Image Selected</h2>
        <p>Please upload or select a satellite image before initiating building analysis.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Go to Upload & Ask</span>
        </button>

        <style>{`
          .processing-fallback-card {
            padding: 4rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            max-width: 540px;
            margin: 2rem auto;
          }
          .processing-fallback-card h2 {
            color: #ffffff;
            font-size: 1.5rem;
          }
          .processing-fallback-card p {
            color: var(--text-muted);
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  }

  // SVG Circular progress math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="processing-screen-container screen-fade-in">
      {/* Header Back & Action Bar */}
      <div className="processing-nav-bar">
        <button className="btn-secondary back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back to Upload & Ask</span>
        </button>

        <div className="domain-pill">
          <Cpu size={14} className="cyan-icon" />
          <span>Building Analysis Pipeline</span>
        </div>
      </div>

      {/* Main Title Header */}
      <div className="processing-page-header">
        <h1 className="page-title gradient-text">Analysis in Progress</h1>
        <p className="page-subtitle">
          AI Model is processing your satellite scene for building structures
        </p>
      </div>

      {errorMessage && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Uploaded Image Card (Left) & Processing Card (Right) */}
      <div className="processing-grid">
        {/* 1. Uploaded Image Card */}
        <div className="uploaded-image-card glass-panel">
          <div className="card-header">
            <div className="file-title-group">
              <FileImage size={20} className="file-icon" />
              <div className="file-meta">
                <h3 className="file-name">{image.name}</h3>
                <span className="file-specs">
                  {image.formattedSize} • {image.type} {image.isSample ? '(Sample Dataset)' : ''}
                </span>
              </div>
            </div>

            <div className="badge badge-emerald upload-status-badge">
              <CheckCircle2 size={13} />
              <span>Uploaded Successfully</span>
            </div>
          </div>

          <div className="image-preview-wrapper">
            <img 
              src={image.previewUrl} 
              alt="Uploaded Satellite Preview" 
              className="preview-img" 
            />
            {/* Animated Laser Scanning Line */}
            {progress < 100 && <div className="scanning-line" />}

            <div className="image-scan-overlay">
              <div className="corner-target top-l" />
              <div className="corner-target top-r" />
              <div className="corner-target bot-l" />
              <div className="corner-target bot-r" />
              <div className="scan-status-tag">
                <span className="pulse-dot" />
                <span>
                  {progress === 100 ? 'ENGINE COMPLETE' : 'AI SEGMENTATION ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="query-recap-box">
            <span className="recap-label">Active Query:</span>
            <p className="recap-text">
              "{query || 'Detect all building footprints and structural outlines in this area'}"
            </p>
          </div>
        </div>

        {/* 2. Processing Status Card */}
        <div className="processing-card glass-panel">
          <div className="card-title-group">
            <div className="title-icon-box">
              <Sparkles size={22} className="cyan-glow" />
            </div>
            <div>
              <h2 className="processing-card-title">
                {progress === 100 ? 'Analysis Ready' : 'Processing your request...'}
              </h2>
              <p className="processing-card-subtitle">
                {progress === 100 
                  ? `Detected ${detectionResult?.totalBuildings || 0} distinct building structures` 
                  : 'AI is analyzing the satellite image for buildings'}
              </p>
            </div>
          </div>

          {/* Circular Progress Indicator */}
          <div className="circular-progress-wrapper">
            <svg className="progress-ring" width="180" height="180">
              <circle
                className="progress-ring-track"
                stroke="rgba(56, 189, 248, 0.12)"
                strokeWidth="12"
                fill="transparent"
                r={radius}
                cx="90"
                cy="90"
              />
              <circle
                className="progress-ring-indicator"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="90"
                cy="90"
                style={{
                  strokeDasharray: `${circumference} ${circumference}`,
                  strokeDashoffset
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            <div className="progress-center-text">
              <span className="percent-val">{progress}%</span>
              <span className="status-val">
                {progress === 100 ? 'Completed' : 'Processing...'}
              </span>
            </div>
          </div>

          {/* 4 Processing Steps Tracker */}
          <div className="steps-tracker">
            {steps.map((step, idx) => {
              return (
                <div key={step.id} className={`step-row step-${step.status}`}>
                  <div className="step-icon-container">
                    {step.status === 'completed' && (
                      <CheckCircle2 size={20} className="icon-completed" />
                    )}
                    {step.status === 'current' && (
                      <Loader2 size={20} className="icon-current spin-icon" />
                    )}
                    {step.status === 'pending' && (
                      <Circle size={20} className="icon-pending" />
                    )}
                    {idx < steps.length - 1 && <div className="step-line" />}
                  </div>

                  <div className="step-content">
                    <span className="step-title-text">
                      Step {idx + 1}: {step.label}
                    </span>
                    {step.description && (
                      <span className="step-desc-text">{step.description}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Information Banner or Results CTA */}
          {progress === 100 ? (
            <button 
              className="btn-primary view-results-cta"
              onClick={() => navigate('/results')}
            >
              <Sparkles size={18} />
              <span>View Building Detection Results</span>
              <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
          ) : (
            <div className="info-alert-banner">
              <Clock size={20} className="info-icon" />
              <div className="info-text">
                <p className="info-main">This may take a few moments.</p>
                <p className="info-sub">Please don't close the app while the AI engine runs.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .screen-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.35);
          color: #fda4af;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
        }

        .processing-screen-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .processing-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-btn {
          font-size: 0.88rem;
        }

        .domain-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.25);
          color: var(--primary-cyan);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .processing-page-header {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .processing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .uploaded-image-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .file-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-icon {
          color: var(--primary-cyan);
        }

        .file-meta {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          word-break: break-all;
        }

        .file-specs {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .upload-status-badge {
          margin-left: auto;
        }

        .image-preview-wrapper {
          position: relative;
          width: 100%;
          height: 320px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #04070d;
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .scanning-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--primary-cyan) 50%, transparent 100%);
          box-shadow: 0 0 15px var(--primary-cyan);
          animation: scan-move 2.5s ease-in-out infinite;
        }

        @keyframes scan-move {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }

        .image-scan-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          padding: 1rem;
        }

        .corner-target {
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: var(--primary-cyan);
          border-style: solid;
        }

        .top-l { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
        .top-r { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
        .bot-l { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }
        .bot-r { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

        .scan-status-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(4, 7, 13, 0.75);
          backdrop-filter: blur(4px);
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.68rem;
          color: var(--accent-emerald);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .query-recap-box {
          background: rgba(8, 13, 23, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .recap-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .recap-text {
          font-size: 0.88rem;
          color: var(--primary-cyan);
          font-style: italic;
        }

        .processing-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .title-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-cyan);
        }

        .processing-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .processing-card-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .circular-progress-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.5rem 0;
        }

        .progress-ring-indicator {
          transition: stroke-dashoffset 0.35s ease;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        .progress-center-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .percent-val {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
        }

        .status-val {
          font-size: 0.78rem;
          color: var(--primary-cyan);
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .steps-tracker {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }

        .step-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .step-icon-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .icon-completed {
          color: var(--accent-emerald);
          filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
        }

        .icon-current {
          color: var(--primary-cyan);
          filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.6));
        }

        .icon-pending {
          color: var(--text-dim);
        }

        .step-line {
          width: 2px;
          height: 28px;
          background: rgba(56, 189, 248, 0.15);
          margin-top: 4px;
        }

        .step-completed .step-line {
          background: rgba(16, 185, 129, 0.4);
        }

        .step-content {
          display: flex;
          flex-direction: column;
        }

        .step-title-text {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .step-completed .step-title-text {
          color: #ffffff;
        }

        .step-current .step-title-text {
          color: var(--primary-cyan);
        }

        .step-desc-text {
          font-size: 0.78rem;
          color: var(--text-dim);
        }

        .info-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: rgba(56, 189, 248, 0.06);
          border: 1px solid rgba(56, 189, 248, 0.22);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }

        .info-icon {
          color: var(--primary-blue);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .info-text {
          display: flex;
          flex-direction: column;
        }

        .info-main {
          font-size: 0.88rem;
          font-weight: 600;
          color: #ffffff;
        }

        .info-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .view-results-cta {
          width: 100%;
          padding: 0.95rem;
          font-size: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @media (max-width: 900px) {
          .processing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
