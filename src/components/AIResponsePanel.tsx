import React, { useState } from 'react';
import { Send, Layers, Eye, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';
import type { AIQueryResponse } from '../services/aiQueryEngine';

interface AIResponsePanelProps {
  history: AIQueryResponse[];
  onSubmitQuery: (query: string) => void;
  onViewEvidence: (response: AIQueryResponse) => void;
}

const PRESET_QUESTIONS = [
  'How many buildings are present?',
  'What is the average confidence?',
  'Which building has the highest confidence?',
  'Give me a summary.',
  'Detect flood.'
];

export const AIResponsePanel: React.FC<AIResponsePanelProps> = ({
  history,
  onSubmitQuery,
  onViewEvidence
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitQuery(inputText.trim());
    setInputText('');
  };

  const handlePresetClick = (q: string) => {
    onSubmitQuery(q);
  };

  return (
    <div className="ai-panel-container glass-panel">
      {/* Panel Header */}
      <div className="ai-panel-header">
        <div className="ai-brand-badge">
          <Layers size={18} className="logo-icon cyan-glow" />
          <span className="ai-title">SatQuery <span className="cyan-text">AI</span> Assistant</span>
        </div>
        <span className="domain-pill">Domain: Building Analysis</span>
      </div>

      {/* Query/Response Conversation Thread */}
      <div className="ai-thread-viewport">
        {history.length === 0 ? (
          <div className="empty-thread-card">
            <MessageSquare size={32} className="cyan-icon" />
            <p className="empty-title">Ask SatQuery AI about this satellite image</p>
            <p className="empty-sub">Get answers for building counts, confidence scores, and structural summaries.</p>
          </div>
        ) : (
          history.map((resp) => (
            <div key={resp.id} className="chat-pair">
              {/* User Query Bubble */}
              <div className="user-query-bubble">
                <span className="user-text">"{resp.query}"</span>
                <span className="time-tag">{resp.timestamp}</span>
              </div>

              {/* SatQuery AI Response Card */}
              <div className="ai-response-card">
                <div className="ai-avatar-row">
                  <div className="ai-avatar-icon">
                    <Sparkles size={16} />
                  </div>
                  <span className="ai-name">SatQuery AI</span>
                </div>

                <p className="ai-answer-text">{resp.answer}</p>

                {/* Evidence Box */}
                <div className="evidence-box">
                  <div className="evidence-header">
                    <HelpCircle size={14} className="cyan-icon" />
                    <span className="evidence-label">Evidence:</span>
                  </div>
                  <p className="evidence-desc">{resp.evidenceText}</p>
                </div>

                {/* View Evidence Action Button */}
                <div className="action-row">
                  <button 
                    className="btn-secondary view-evidence-btn"
                    onClick={() => onViewEvidence(resp)}
                  >
                    <Eye size={14} />
                    <span>View Evidence</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preset Action Pills */}
      <div className="presets-row">
        <span className="presets-label">Suggested Questions:</span>
        <div className="preset-pills-list">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button 
              key={idx} 
              className="preset-question-pill"
              onClick={() => handlePresetClick(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Query Input Bar */}
      <form onSubmit={handleSubmit} className="query-input-form">
        <input
          type="text"
          className="ai-chat-input"
          placeholder="Ask something about this satellite image..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn-primary ask-ai-btn">
          <Send size={16} />
          <span>Ask AI</span>
        </button>
      </form>

      <style>{`
        .ai-panel-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .ai-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ai-brand-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .cyan-glow { color: var(--primary-cyan); }
        .cyan-text { color: var(--primary-cyan); }

        .ai-title {
          font-weight: 700;
          font-size: 1rem;
          color: #ffffff;
        }

        .domain-pill {
          font-size: 0.72rem;
          color: var(--primary-cyan);
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.25);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        /* Thread Viewport */
        .ai-thread-viewport {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .empty-thread-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.6rem;
          background: rgba(8, 13, 23, 0.6);
          border: 1px dashed var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .empty-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: #ffffff;
        }

        .empty-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .chat-pair {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-query-bubble {
          align-self: flex-end;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 14px 14px 2px 14px;
          padding: 0.65rem 1rem;
          max-width: 85%;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .user-text {
          font-size: 0.88rem;
          color: #ffffff;
          font-weight: 500;
        }

        .time-tag {
          font-size: 0.68rem;
          color: var(--text-dim);
          align-self: flex-end;
        }

        .ai-response-card {
          align-self: flex-start;
          background: rgba(8, 13, 23, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: 14px 14px 14px 2px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .ai-avatar-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ai-avatar-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-cyan), var(--primary-blue));
          color: #040914;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary-cyan);
        }

        .ai-answer-text {
          font-size: 0.92rem;
          color: #ffffff;
          line-height: 1.45;
        }

        .evidence-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .evidence-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .evidence-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-cyan);
        }

        .evidence-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        .action-row {
          display: flex;
          justify-content: flex-end;
        }

        .view-evidence-btn {
          font-size: 0.78rem;
          padding: 0.35rem 0.75rem;
        }

        /* Preset Pills */
        .presets-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .presets-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .preset-pills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .preset-question-pill {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-question-pill:hover {
          color: var(--primary-cyan);
          border-color: rgba(0, 242, 254, 0.35);
          background: rgba(0, 242, 254, 0.08);
        }

        /* Input Form */
        .query-input-form {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          margin-top: 0.25rem;
        }

        .ai-chat-input {
          flex: 1;
          background: rgba(8, 13, 23, 0.9);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.88rem;
          font-family: var(--font-body);
        }

        .ai-chat-input:focus {
          outline: none;
          border-color: var(--primary-cyan);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.2);
        }

        .ask-ai-btn {
          padding: 0.75rem 1.25rem;
          font-size: 0.88rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
