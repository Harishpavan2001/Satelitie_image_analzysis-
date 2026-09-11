import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { UploadAndAskScreen } from './components/UploadAndAskScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { FooterNav } from './components/FooterNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import type { SatelliteImageFile, QueryOption, AppNotification } from './types/analysis';
import type { DetectionResult } from './services/buildingDetection/types';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState<SatelliteImageFile | null>(null);
  const [queryText, setQueryText] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [activeNav, setActiveNav] = useState<'home' | 'new-analysis' | 'my-analyses' | 'profile'>('new-analysis');
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      title: 'Domain Initialized',
      message: 'SatQuery AI set to Building Analysis & Detection Mode.',
      timestamp: 'Just now',
      read: false,
      type: 'info'
    },
    {
      id: 'n2',
      title: 'High-Res GeoTIFF Engine',
      message: 'Supported formats: .tif, .tiff, .png, .jpg up to 500 MB.',
      timestamp: '5m ago',
      read: false,
      type: 'success'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSelectPreset = (preset: QueryOption) => {
    setSelectedPresetId(preset.id);
    setQueryText(preset.prompt);
  };

  const handleDetectionComplete = (result: DetectionResult) => {
    setDetectionResult(result);
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: 'Detection Complete',
        message: `Detected ${result.totalBuildings} buildings in satellite scene.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const isProcessingRoute = location.pathname === '/processing';
  const isResultsRoute = location.pathname === '/results';

  return (
    <div className="app-container">
      {/* Background Grid & Radar effect */}
      <div className="satellite-grid-overlay" />

      {/* Header */}
      <Header
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotifications(true)}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
      />

      {/* Main Content Viewport */}
      <main className="main-viewport">
        <div className="content-max-width">
          
          {/* Breadcrumb / Step Indicator */}
          <div className="workflow-steps-bar glass-panel">
            <div className={`step-item ${location.pathname === '/' ? 'step-active' : 'step-completed'}`}>
              <span className="step-num">
                {location.pathname !== '/' ? <CheckCircle2 size={14} /> : '1'}
              </span>
              <span className="step-text">1. Upload & Ask</span>
            </div>

            <ChevronRight size={14} className="step-arrow" />

            <div className={`step-item ${isProcessingRoute ? 'step-active' : isResultsRoute ? 'step-completed' : 'step-upcoming'}`}>
              <span className="step-num">
                {isResultsRoute ? <CheckCircle2 size={14} /> : '2'}
              </span>
              <span className="step-text">2. Processing</span>
            </div>

            <ChevronRight size={14} className="step-arrow" />

            <div className={`step-item ${isResultsRoute ? 'step-active' : 'step-upcoming'}`}>
              <span className="step-num">3</span>
              <span className="step-text">3. Results & Analytics</span>
            </div>
          </div>

          {/* React Router Viewport Routes */}
          <Routes>
            <Route 
              path="/" 
              element={
                <UploadAndAskScreen
                  selectedImage={selectedImage}
                  onImageSelected={setSelectedImage}
                  queryText={queryText}
                  onQueryChange={setQueryText}
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                />
              } 
            />

            <Route 
              path="/processing" 
              element={
                <ProcessingScreen
                  image={selectedImage}
                  query={queryText}
                  onDetectionComplete={handleDetectionComplete}
                />
              } 
            />

            <Route 
              path="/results" 
              element={
                <ResultsScreen
                  image={selectedImage}
                  result={detectionResult}
                  query={queryText}
                />
              } 
            />
          </Routes>

        </div>
      </main>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Bottom Responsive Navigation Footer */}
      <FooterNav
        activeNav={activeNav}
        onSelectNav={setActiveNav}
      />

      <style>{`
        .main-viewport {
          flex: 1;
          position: relative;
          z-index: 10;
          padding: 2rem 1.5rem 4rem 1.5rem;
        }

        .content-max-width {
          max-width: 1040px;
          margin: 0 auto;
        }

        /* Step workflow header */
        .workflow-steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          padding: 0.75rem 1.5rem;
          margin-bottom: 2rem;
          border-radius: var(--radius-full);
          background: rgba(14, 20, 33, 0.6);
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .step-active .step-num {
          background: var(--primary-cyan);
          color: #040914;
          box-shadow: var(--glow-cyan);
        }

        .step-active .step-text {
          color: #ffffff;
          font-weight: 600;
          font-size: 0.88rem;
        }

        .step-completed .step-num {
          background: var(--accent-emerald);
          color: #040914;
        }

        .step-completed .step-text {
          color: var(--accent-emerald);
          font-weight: 500;
          font-size: 0.88rem;
        }

        .step-upcoming {
          opacity: 0.45;
        }

        .step-upcoming .step-num {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
        }

        .step-upcoming .step-text {
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        .step-arrow {
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .main-viewport {
            padding: 1.25rem 1rem 5rem 1rem;
          }

          .workflow-steps-bar {
            gap: 0.5rem;
            padding: 0.6rem 1rem;
          }

          .step-text {
            display: none;
          }

          .step-active .step-text, .step-completed .step-text {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
