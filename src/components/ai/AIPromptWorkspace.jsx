import React from 'react';
import {
  Sparkles,
  Building,
  Target,
  Share2,
  Sliders,
  X,
  Lightbulb,
  Layers,
  Flame,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { VOICE_TONES, CAMPAIGN_OBJECTIVES, AI_TOOLS } from '../../data/mockAI.js';

export function AIPromptWorkspace({
  activeToolId,
  selectedClientId,
  onClientChange,
  selectedTone,
  onToneChange,
  selectedObjective,
  onObjectiveChange,
  selectedPlatform,
  onPlatformChange,
  creativityLevel,
  onCreativityChange,
  promptText,
  onPromptChange,
  onClearPrompt,
  onApplyPromptStarter,
  onGenerate,
  isGenerating,
  variationsCount,
  onVariationsCountChange,
}) {
  const currentTool = AI_TOOLS.find((t) => t.id === activeToolId) || AI_TOOLS[0];

  const platforms = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'tiktok', label: 'TikTok / Reels' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google_ads', label: 'Google Ads' },
  ];

  const quickStarters = [
    'Seasonal Promotion & Exclusive Offer',
    'Customer Transformation & Case Study',
    'Debunking 3 Common Industry Myths',
    'Behind-the-Scenes Team Process',
    'Actionable Step-by-Step Tutorial',
  ];

  return (
    <div className="ai-workspace-card">
      <div className="workspace-header-row">
        <div className="workspace-title-group">
          <div className="tool-icon-mini">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="workspace-title">{currentTool.name}</h3>
            <p className="workspace-subtitle">Configure tone, platform rules, and your creative brief</p>
          </div>
        </div>

        <div className="workspace-header-actions">
          <label className="variations-selector-label">
            <Layers size={13} />
            <span>Variations:</span>
            <select
              className="variations-dropdown"
              value={variationsCount}
              onChange={(e) => onVariationsCountChange(Number(e.target.value))}
            >
              <option value={1}>1 Output</option>
              <option value={2}>2 Outputs</option>
              <option value={3}>3 Outputs (Multi-Angle)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="workspace-form-grid">
        {/* Row 1: Client & Tone */}
        <div className="form-grid-two-col">
          {/* Target Client */}
          <div className="ai-field-group">
            <label className="ai-field-label">
              <Building size={13} className="label-icon" />
              <span>Target Client Brand</span>
            </label>
            <select
              className="ai-select-input"
              value={selectedClientId}
              onChange={(e) => onClientChange(e.target.value)}
            >
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.industry}
                </option>
              ))}
            </select>
          </div>

          {/* Tone of Voice */}
          <div className="ai-field-group">
            <label className="ai-field-label">
              <Flame size={13} className="label-icon" />
              <span>Brand Voice & Tone</span>
            </label>
            <select
              className="ai-select-input"
              value={selectedTone}
              onChange={(e) => onToneChange(e.target.value)}
            >
              {VOICE_TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Campaign Objective & Target Platform */}
        <div className="form-grid-two-col">
          {/* Campaign Objective */}
          <div className="ai-field-group">
            <label className="ai-field-label">
              <Target size={13} className="label-icon" />
              <span>Campaign Objective</span>
            </label>
            <select
              className="ai-select-input"
              value={selectedObjective}
              onChange={(e) => onObjectiveChange(e.target.value)}
            >
              {CAMPAIGN_OBJECTIVES.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Platform Channel */}
          <div className="ai-field-group">
            <label className="ai-field-label">
              <Share2 size={13} className="label-icon" />
              <span>Target Channel</span>
            </label>
            <div className="platform-pills-row">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`platform-toggle-pill ${selectedPlatform === p.id ? 'active' : ''}`}
                  onClick={() => onPlatformChange(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Creativity Slider */}
        <div className="ai-field-group slider-group">
          <div className="slider-header-row">
            <label className="ai-field-label">
              <Sliders size={13} className="label-icon" />
              <span>Creativity & Temperature:</span>
              <strong className="slider-value-text">
                {creativityLevel <= 0.3
                  ? 'Precise & Structured (0.3)'
                  : creativityLevel <= 0.7
                  ? 'Balanced & Optimal (0.7)'
                  : 'High Creativity & Viral (1.0)'}
              </strong>
            </label>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.1"
            value={creativityLevel}
            onChange={(e) => onCreativityChange(parseFloat(e.target.value))}
            className="ai-slider-input"
          />
        </div>

        {/* Prompt Input Textarea */}
        <div className="ai-field-group prompt-field-group">
          <div className="prompt-label-row">
            <label className="ai-field-label">
              <span>Creative Brief / Prompt Instructions</span>
              <span className="text-danger">*</span>
            </label>
            {promptText && (
              <button
                type="button"
                className="btn-clear-prompt"
                onClick={onClearPrompt}
                title="Clear input"
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <textarea
            rows={4}
            className="ai-prompt-textarea"
            placeholder={currentTool.defaultPrompt || 'Describe your campaign topic, target hook, key benefits, or paste raw notes...'}
            value={promptText}
            onChange={(e) => onPromptChange(e.target.value)}
          />

          {/* Quick Prompt Starters */}
          <div className="prompt-starters-tray">
            <div className="starters-label">
              <Lightbulb size={12} />
              <span>Quick Starters:</span>
            </div>
            <div className="starters-pills-list">
              {quickStarters.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="starter-chip"
                  onClick={() => onApplyPromptStarter(starter)}
                >
                  + {starter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button: Generate */}
        <div className="workspace-submit-row">
          <button
            type="button"
            className={`btn-generate-ai-primary ${isGenerating ? 'generating' : ''}`}
            onClick={onGenerate}
            disabled={isGenerating}
          >
            <Sparkles size={18} className={isGenerating ? 'spin-animation' : ''} />
            <span>{isGenerating ? 'Generating On-Brand Copy...' : `Generate ${variationsCount} AI Variation${variationsCount > 1 ? 's' : ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIPromptWorkspace;
