import React from 'react';
import { Home, PlusCircle, FolderKanban, User } from 'lucide-react';

interface FooterNavProps {
  activeNav: 'home' | 'new-analysis' | 'my-analyses' | 'profile';
  onSelectNav: (nav: 'home' | 'new-analysis' | 'my-analyses' | 'profile') => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({
  activeNav,
  onSelectNav
}) => {
  return (
    <footer className="footer-container glass-panel">
      <div className="footer-inner">
        {/* Desktop Footer Meta */}
        <div className="footer-meta-desktop">
          <span className="copyright">© 2026 SatQuery AI • Smart India Hackathon Prototype</span>
          <span className="domain-indicator">Target Domain: Building Detection Only</span>
        </div>

        {/* Mobile & Bottom App Navigation */}
        <div className="bottom-nav-bar">
          <button
            className={`nav-tab ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => onSelectNav('home')}
          >
            <Home size={20} />
            <span className="tab-label">Home</span>
          </button>

          <button
            className={`nav-tab ${activeNav === 'new-analysis' ? 'active' : ''}`}
            onClick={() => onSelectNav('new-analysis')}
          >
            <PlusCircle size={20} />
            <span className="tab-label">New Analysis</span>
          </button>

          <button
            className={`nav-tab ${activeNav === 'my-analyses' ? 'active' : ''}`}
            onClick={() => onSelectNav('my-analyses')}
          >
            <FolderKanban size={20} />
            <span className="tab-label">My Analyses</span>
          </button>

          <button
            className={`nav-tab ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => onSelectNav('profile')}
          >
            <User size={20} />
            <span className="tab-label">Profile</span>
          </button>
        </div>
      </div>

      <style>{`
        .footer-container {
          margin-top: auto;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-bottom: none;
          background: rgba(7, 10, 17, 0.95);
          backdrop-filter: blur(16px);
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-meta-desktop {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .domain-indicator {
          color: var(--primary-cyan);
          background: rgba(0, 242, 254, 0.08);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(0, 242, 254, 0.2);
        }

        .bottom-nav-bar {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-tab {
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-tab:hover {
          color: #ffffff;
        }

        .nav-tab.active {
          color: var(--primary-cyan);
          background: rgba(0, 242, 254, 0.1);
        }

        .tab-label {
          font-size: 0.85rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .footer-meta-desktop {
            display: none;
          }

          .footer-inner {
            padding: 0.6rem 0.5rem;
            justify-content: center;
          }

          .bottom-nav-bar {
            width: 100%;
            justify-content: space-around;
            gap: 0;
          }

          .nav-tab {
            flex-direction: column;
            gap: 0.2rem;
            padding: 0.4rem 0.6rem;
          }

          .tab-label {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  );
};
