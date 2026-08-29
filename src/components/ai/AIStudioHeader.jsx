import React from 'react';
import {
  Sparkles,
  History,
  BookOpen,
  Cpu,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { AI_MODELS } from '../../data/mockAI.js';

export function AIStudioHeader({
  selectedModel,
  onModelChange,
  activeClientObj,
  onOpenHistory,
  onOpenTemplates,
  onResetWorkspace,
  historyCount = 0,
}) {
  return (
    <div className="ai-studio-header-card">
      <div className="ai-header-top-row">
        {/* Left Title & Status */}
        <div className="ai-title-block">
          <div className="ai-title-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI Copywriting Engine</span>
          </div>
          <h1 className="ai-main-heading">AI Marketing Studio</h1>
          <p className="ai-subheading-text">
            Generate brand-tailored captions, viral video scripts, multi-week content calendars, and high-ROAS ad creatives in seconds.
          </p>
        </div>

        {/* Right Stats & Controls */}
        <div className="ai-header-controls-group">
          {/* Active Model Selector */}
          <div className="ai-model-selector-wrapper">
            <div className="model-icon-tag">
              <Cpu size={14} />
            </div>
            <div className="model-select-details">
              <span className="model-label-tiny">AI Engine</span>
              <select
                className="ai-model-dropdown"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                aria-label="Select AI Model"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="ai-header-action-buttons">
            <button
              type="button"
              className="btn-ai-header-action"
              onClick={onOpenTemplates}
              title="Prompt Recipe Library"
            >
              <BookOpen size={15} />
              <span>Prompt Recipes</span>
            </button>

            <button
              type="button"
              className="btn-ai-header-action"
              onClick={onOpenHistory}
              title="View Generation History"
            >
              <History size={15} />
              <span>History</span>
              {historyCount > 0 && <span className="ai-history-pill">{historyCount}</span>}
            </button>

            <button
              type="button"
              className="btn-ai-header-action icon-only"
              onClick={onResetWorkspace}
              title="Reset Workspace"
              aria-label="Reset Workspace"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Client Voice Context Bar */}
      <div className="ai-context-indicator-bar">
        <div className="client-voice-pill">
          <span className="voice-dot" />
          <span>Active Client Voice:</span>
          <strong>🏢 {activeClientObj?.name || 'All Clients (Default Voice)'}</strong>
          <span className="industry-sub-tag">({activeClientObj?.industry || 'General Marketing'})</span>
        </div>

        <div className="token-usage-indicator">
          <Zap size={13} className="token-bolt" />
          <span>Today’s Token Usage: <strong>14,820 / 100,000</strong> (Unlimited Agency Plan)</span>
        </div>
      </div>
    </div>
  );
}

export default AIStudioHeader;
