import React from 'react';
import { Bell, X, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import type { AppNotification } from '../types/analysis';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald" />;
      case 'warning': return <AlertCircle size={18} className="text-amber" />;
      default: return <Info size={18} className="text-cyan" />;
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Bell size={20} className="cyan-icon" />
            <h3>System Notifications</h3>
          </div>
          <div className="header-btns">
            <button className="mark-read-btn" onClick={onMarkAllRead}>Mark all read</button>
            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <Bell size={32} />
              <p>No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                <div className="item-icon-box">
                  {getIcon(n.type)}
                </div>
                <div className="item-content">
                  <div className="item-top">
                    <span className="item-title">{n.title}</span>
                    <span className="item-time">{n.timestamp}</span>
                  </div>
                  <p className="item-message">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(4, 7, 13, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }

        .drawer-panel {
          width: 100%;
          max-width: 400px;
          height: 100%;
          border-radius: 0;
          border-right: none;
          border-top: none;
          border-bottom: none;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          animation: drawer-slide 0.25s ease-out;
        }

        @keyframes drawer-slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
        }

        .drawer-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #ffffff;
        }

        .cyan-icon { color: var(--primary-cyan); }
        .text-emerald { color: var(--accent-emerald); }
        .text-amber { color: var(--accent-amber); }
        .text-cyan { color: var(--primary-cyan); }

        .header-btns {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .mark-read-btn {
          background: transparent;
          border: none;
          color: var(--primary-cyan);
          font-size: 0.78rem;
          cursor: pointer;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .empty-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem 0;
          color: var(--text-dim);
        }

        .notification-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.85rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .notification-item.unread {
          border-color: rgba(0, 242, 254, 0.3);
          background: rgba(0, 242, 254, 0.05);
        }

        .item-icon-box {
          margin-top: 0.15rem;
        }

        .item-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          width: 100%;
        }

        .item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-title {
          font-weight: 600;
          font-size: 0.85rem;
          color: #ffffff;
        }

        .item-time {
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .item-message {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
};
