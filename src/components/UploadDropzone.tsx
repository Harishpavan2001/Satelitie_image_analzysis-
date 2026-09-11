import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, RefreshCw, CheckCircle2, AlertTriangle, Crosshair, Sparkles } from 'lucide-react';
import type { SatelliteImageFile } from '../types/analysis';

interface UploadDropzoneProps {
  image: SatelliteImageFile | null;
  onImageSelected: (image: SatelliteImageFile | null) => void;
}

const MAX_SIZE_MB = 500;
const ALLOWED_EXTENSIONS = ['.tif', '.tiff', '.png', '.jpg', '.jpeg'];

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  image,
  onImageSelected
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReticle, setShowReticle] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    const fileName = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      setErrorMessage(`Invalid file format. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      setErrorMessage(`File size exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsLoading(true);

    // If file is tiff/tif, browser cannot render standard img src directly, so handle gracefully
    const isTiff = fileName.endsWith('.tif') || fileName.endsWith('.tiff');
    let previewUrl = '';

    if (isTiff) {
      // Use placeholder satellite render preview for TIFF display while maintaining TIFF metadata
      previewUrl = '/sample-satellite.jpg';
    } else {
      previewUrl = URL.createObjectURL(file);
    }

    // Simulate realistic satellite tile upload indexing
    setTimeout(() => {
      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        sizeBytes: file.size,
        formattedSize: formatBytes(file.size),
        type: file.type || (isTiff ? 'image/tiff' : 'image/jpeg'),
        uploadedAt: new Date(),
        status: 'ready'
      });
      setIsLoading(false);
    }, 600);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleLoadSampleImage = () => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      onImageSelected({
        previewUrl: '/sample-satellite.jpg',
        name: 'urban_sector_4b_satellite.jpg',
        sizeBytes: 14857600,
        formattedSize: '14.17 MB',
        type: 'image/jpeg',
        uploadedAt: new Date(),
        status: 'ready',
        isSample: true
      });
      setIsLoading(false);
    }, 400);
  };

  const handleRemove = () => {
    if (image?.previewUrl && !image.isSample) {
      URL.revokeObjectURL(image.previewUrl);
    }
    onImageSelected(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".tif,.tiff,.png,.jpg,.jpeg"
        style={{ display: 'none' }}
      />

      {errorMessage && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
          <button className="error-dismiss" onClick={() => setErrorMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {!image ? (
        <div
          className={`dropzone-card glass-panel ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading ? (
            <div className="upload-loading-state">
              <RefreshCw className="spin-icon" size={36} />
              <p className="loading-title">Indexing Satellite Imagery...</p>
              <p className="loading-sub">Parsing metadata and resolution grid</p>
            </div>
          ) : (
            <div className="dropzone-content">
              <div className="icon-pulse-wrapper">
                <UploadCloud size={44} className="upload-icon" />
              </div>
              
              <div className="text-group">
                <h3 className="upload-title">Upload satellite image</h3>
                <p className="upload-sub">Drag & drop or browse</p>
              </div>

              <div className="format-pills">
                <span className="pill">Formats: .tif, .tiff, .png, .jpg, .jpeg</span>
                <span className="pill pill-size">Max size: 500 MB</span>
              </div>

              <div className="sample-trigger-row" onClick={(e) => e.stopPropagation()}>
                <span className="or-divider">OR</span>
                <button className="btn-secondary sample-btn" onClick={handleLoadSampleImage}>
                  <Sparkles size={16} className="sparkle-icon" />
                  <span>Try Sample Satellite Image</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Loaded Preview State */
        <div className="preview-card glass-panel">
          <div className="preview-header">
            <div className="file-info-group">
              <FileImage size={20} className="file-icon" />
              <div className="file-meta">
                <span className="file-name">{image.name}</span>
                <span className="file-details">
                  {image.formattedSize} • {image.type} {image.isSample ? '(Sample Dataset)' : ''}
                </span>
              </div>
            </div>

            <div className="status-and-actions">
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} />
                <span>Uploaded</span>
              </span>

              <button
                className="action-icon-btn"
                onClick={() => setShowReticle(!showReticle)}
                title={showReticle ? 'Hide Grid Crosshair' : 'Show Grid Crosshair'}
              >
                <Crosshair size={18} className={showReticle ? 'active-cyan' : ''} />
              </button>

              <button
                className="btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                title="Change Image"
              >
                <RefreshCw size={14} />
                <span>Replace</span>
              </button>

              <button
                className="btn-secondary btn-sm btn-danger"
                onClick={handleRemove}
                title="Remove Image"
              >
                <X size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="preview-image-container">
            <img
              src={image.previewUrl}
              alt="Satellite Preview"
              className="preview-img"
            />

            {showReticle && (
              <div className="satellite-reticle-overlay">
                <div className="reticle-corner top-left" />
                <div className="reticle-corner top-right" />
                <div className="reticle-corner bottom-left" />
                <div className="reticle-corner bottom-right" />
                <div className="center-crosshair">
                  <div className="line-v" />
                  <div className="line-h" />
                </div>
                <div className="reticle-meta">
                  <span>RES: 0.3m/px</span>
                  <span>BUILDING DETECTION READY</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .upload-container {
          width: 100%;
          margin-bottom: 1.5rem;
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
          margin-bottom: 1rem;
          font-size: 0.88rem;
        }

        .error-dismiss {
          margin-left: auto;
          background: transparent;
          border: none;
          color: #fda4af;
          cursor: pointer;
        }

        .dropzone-card {
          padding: 3rem 1.5rem;
          text-align: center;
          cursor: pointer;
          border: 2px dashed rgba(56, 189, 248, 0.25);
          transition: all 0.25s ease;
        }

        .dropzone-card:hover, .dropzone-card.drag-active {
          border-color: var(--primary-cyan);
          background: rgba(0, 242, 254, 0.04);
          box-shadow: var(--glow-cyan);
        }

        .upload-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
          color: var(--primary-cyan);
        }

        .spin-icon {
          animation: spin 1.2s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .loading-title {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 1.1rem;
          color: #ffffff;
        }

        .loading-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .icon-pulse-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-cyan);
          transition: transform 0.3s ease;
        }

        .dropzone-card:hover .icon-pulse-wrapper {
          transform: scale(1.08);
          background: rgba(0, 242, 254, 0.15);
        }

        .upload-title {
          font-size: 1.35rem;
          font-weight: 600;
          color: #ffffff;
        }

        .upload-sub {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .format-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .pill {
          font-size: 0.78rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .pill-size {
          color: var(--primary-blue);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .sample-trigger-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .or-divider {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .sample-btn {
          background: rgba(0, 242, 254, 0.1);
          border-color: rgba(0, 242, 254, 0.3);
          color: var(--primary-cyan);
        }

        .sample-btn:hover {
          background: rgba(0, 242, 254, 0.2);
          border-color: var(--primary-cyan);
          box-shadow: var(--glow-cyan);
        }

        .sparkle-icon {
          color: var(--primary-cyan);
        }

        /* Preview Card Styles */
        .preview-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .file-info-group {
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
          font-weight: 600;
          color: #ffffff;
          font-size: 0.95rem;
          word-break: break-all;
        }

        .file-details {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .status-and-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .btn-sm {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }

        .btn-danger:hover {
          background: rgba(244, 63, 94, 0.2);
          border-color: rgba(244, 63, 94, 0.5);
          color: #fda4af;
        }

        .action-icon-btn {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .active-cyan {
          color: var(--primary-cyan);
        }

        .preview-image-container {
          position: relative;
          width: 100%;
          max-height: 420px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #04070d;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-subtle);
        }

        .preview-img {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: cover;
          display: block;
        }

        /* Reticle Satellite Overlay */
        .satellite-reticle-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          padding: 1.5rem;
        }

        .reticle-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: var(--primary-cyan);
          border-style: solid;
        }

        .top-left { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .top-right { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
        .bottom-left { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
        .bottom-right { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

        .center-crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
        }

        .line-v, .line-h {
          position: absolute;
          background: rgba(0, 242, 254, 0.4);
        }

        .line-v { top: 0; bottom: 0; left: 50%; width: 1px; }
        .line-h { left: 0; right: 0; top: 50%; height: 1px; }

        .reticle-meta {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 0.7rem;
          color: var(--primary-cyan);
          background: rgba(4, 7, 13, 0.65);
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};
