import React from 'react';
import { Sparkles, Sliders, Cpu, ShieldAlert, Hash, Zap } from 'lucide-react';

export function AIEngineSettingsTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const models = data.models || [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google DeepMind', status: 'Active (Recommended)' },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', status: 'Active' },
    { id: 'gpt-4o', name: 'GPT-4o Omnichannel', provider: 'OpenAI', status: 'Active' },
  ];

  const quota = data.monthlyTokenQuota || 2000000;
  const used = data.tokensUsedThisMonth || 1428500;
  const usedPercent = Math.min(Math.round((used / quota) * 100), 100);

  return (
    <div className="settings-tab-content-pane">
      {/* Card 1: Token Usage Meter */}
      <div className="settings-section-card ai-quota-card">
        <div className="quota-top-row">
          <div className="quota-title-group">
            <Zap size={18} className="text-warning" />
            <div>
              <h3 className="section-title">Monthly AI Generation Quota</h3>
              <p className="section-desc">Allocated tokens across all copywriting, reel hooks, and ad generators</p>
            </div>
          </div>
          <div className="quota-numbers">
            <strong className="used-tokens">{(used / 1000000).toFixed(2)}M</strong>
            <span className="total-tokens">/ {(quota / 1000000).toFixed(1)}M Tokens ({usedPercent}%)</span>
          </div>
        </div>

        <div className="quota-bar-track">
          <div className="quota-bar-fill" style={{ width: `${usedPercent}%` }} />
        </div>

        <span className="quota-renewal-note">Quota resets automatically on the 1st of every month.</span>
      </div>

      {/* Card 2: Default Model Selection */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="section-title">Primary Foundation AI Model</h3>
            <p className="section-desc">Default intelligence engine powering AI Studio and auto-draft workflows</p>
          </div>
        </div>

        <div className="ai-models-cards-grid">
          {models.map((model) => {
            const isSelected = data.defaultModel === model.id;
            return (
              <div
                key={model.id}
                className={`ai-model-choice-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleChange('defaultModel', model.id)}
              >
                <div className="model-choice-top">
                  <Sparkles size={16} className={isSelected ? 'text-primary' : 'text-muted'} />
                  <strong className="model-choice-name">{model.name}</strong>
                </div>
                <span className="model-provider-text">{model.provider}</span>
                <span className={`model-status-tag ${isSelected ? 'active' : ''}`}>{model.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Creative Hyperparameters & Voice Tone */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="section-title">Creative Parameters & Brand Voice Defaults</h3>
            <p className="section-desc">Fine-tune temperature, max tokens, and standard tone of voice</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          {/* Temperature Slider */}
          <div className="form-field-group">
            <div className="slider-label-row">
              <label className="form-label">Creativity / Temperature</label>
              <strong className="slider-val-badge">{data.temperature || 0.75}</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={data.temperature || 0.75}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="settings-range-slider"
            />
            <span className="helper-text-sub">0.2 = Strict & factual | 0.8 = High creative flair</span>
          </div>

          {/* Max Tokens */}
          <div className="form-field-group">
            <label className="form-label">Max Generation Response Tokens</label>
            <select
              value={data.maxTokens || 2048}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value, 10))}
              className="form-select-input"
            >
              <option value="1024">1,024 Tokens (~750 words)</option>
              <option value="2048">2,048 Tokens (~1,500 words - Standard)</option>
              <option value="4096">4,096 Tokens (~3,000 words - Longform)</option>
            </select>
          </div>

          {/* Default Tone */}
          <div className="form-field-group full-width">
            <label className="form-label">Agency Default Copywriting Tone</label>
            <input
              type="text"
              value={data.defaultTone || ''}
              onChange={(e) => handleChange('defaultTone', e.target.value)}
              className="form-text-input"
            />
          </div>
        </div>
      </div>

      {/* Card 4: AI Guardrails & Auto-Formatting */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="section-title">Guardrails & Auto-Formatting</h3>
            <p className="section-desc">Automated compliance checks and hashtag generation rules</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div
            className={`perm-toggle-row ${data.guardrailsEnabled ? 'enabled' : ''}`}
            onClick={() => handleChange('guardrailsEnabled', !data.guardrailsEnabled)}
          >
            <div>
              <strong className="perm-label">Enable Brand Safety Guardrails</strong>
              <span className="perm-desc">Filters inappropriate language, unsubstantiated claims, and competitor mentions</span>
            </div>
            <div className={`perm-switch-box ${data.guardrailsEnabled ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>

          <div
            className={`perm-toggle-row ${data.autoHashtags ? 'enabled' : ''}`}
            onClick={() => handleChange('autoHashtags', !data.autoHashtags)}
          >
            <div>
              <strong className="perm-label">Automatic Hashtag Clustering</strong>
              <span className="perm-desc">Automatically attaches 5-8 verified niche hashtags to generated captions</span>
            </div>
            <div className={`perm-switch-box ${data.autoHashtags ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIEngineSettingsTab;
