import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, Bell, ShieldCheck, Cpu, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  unreadCount: number;
  onOpenNotifications: () => void;
  activeNav: string;
  onSelectNav: (nav: 'home' | 'new-analysis' | 'my-analyses' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadCount,
  onOpenNotifications,
  activeNav,
  onSelectNav
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProcessingRoute = location.pathname === '/processing';

  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Brand & Logo */}
        <div className="brand-group" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-wrapper">
            <Layers className="logo-icon" size={22} />
            <div className="logo-pulse" />
          </div>
          <div className="brand-text">
            <span className="brand-name">SatQuery <span className="brand-ai">AI</span></span>
            <span className="brand-tag">SIH Prototype</span>
          </div>
        </div>

        {/* Header Center: Back button on /processing route or Live Status */}
        {isProcessingRoute ? (
          <button className="header-back-chip" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>Back to Upload & Ask</span>
          </button>
        ) : (
          <div className="header-status-group">
            <div className="badge badge-cyan">
              <Cpu size={14} />
              <span>Domain: Building Detection</span>
            </div>
            <div className="system-live-pill">
              <span className="pulse-dot"></span>
              <span className="live-text">System Ready</span>
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="header-actions">
          {/* Top Menu Links for Desktop */}
          <nav className="desktop-nav">
            <button 
              className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => {
                onSelectNav('home');
                navigate('/');
              }}
            >
              Home
            </button>
            <button 
              className={`nav-link ${activeNav === 'new-analysis' ? 'active' : ''}`}
              onClick={() => {
                onSelectNav('new-analysis');
                navigate('/');
              }}
            >
              New Analysis
            </button>
            <button 
              className={`nav-link ${activeNav === 'my-analyses' ? 'active' : ''}`}
              onClick={() => onSelectNav('my-analyses')}
            >
              My Analyses
            </button>
          </nav>

          {/* Notification Icon */}
          <button 
            className="icon-btn notification-btn"
            onClick={onOpenNotifications}
            title="Notifications"
            aria-label="Open Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* User Profile */}
          <div 
            className="user-profile-badge" 
            onClick={() => onSelectNav('profile')}
            title="Smart India Hackathon Team Profile"
          >
            <div className="user-avatar">
              <ShieldCheck size={16} />
            </div>
            <span className="user-name">SIH Team</span>
          </div>
        </div>
      </div>

      <style>{`
        .header-container {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(7, 10, 17, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
        }

        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.9rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .logo-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(56, 189, 248, 0.05));
          border: 1px solid var(--border-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-cyan);
          box-shadow: var(--glow-cyan);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .brand-ai {
          color: var(--primary-cyan);
        }

        .brand-tag {
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .header-back-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--primary-cyan);
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .header-back-chip:hover {
          background: rgba(0, 242, 254, 0.12);
          border-color: var(--primary-cyan);
        }

        .header-status-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .system-live-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .live-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-emerald);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.88rem;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: var(--primary-cyan);
          background: rgba(0, 242, 254, 0.1);
        }

        .icon-btn {
          position: relative;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: rgba(47, 63, 94, 0.7);
          border-color: var(--primary-blue);
          color: var(--primary-cyan);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--accent-rose);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-dark);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.3rem 0.7rem 0.3rem 0.3rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-profile-badge:hover {
          border-color: var(--primary-blue);
          background: rgba(30, 41, 59, 0.7);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #040914;
        }

        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }

        @media (max-width: 900px) {
          .desktop-nav, .header-status-group {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
