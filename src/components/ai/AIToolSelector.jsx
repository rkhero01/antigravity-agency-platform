import React from 'react';
import {
  Sparkles,
  Video,
  CalendarRange,
  Hash,
  Wand2,
  Megaphone,
} from 'lucide-react';
import { AI_TOOLS } from '../../data/mockAI.js';

const ICON_MAP = {
  Sparkles,
  Video,
  CalendarRange,
  Hash,
  Wand2,
  Megaphone,
};

export function AIToolSelector({ activeToolId, onSelectTool }) {
  return (
    <div className="ai-tools-tab-bar" role="tablist" aria-label="AI Generator Modes">
      {AI_TOOLS.map((tool) => {
        const IconComponent = ICON_MAP[tool.iconName] || Sparkles;
        const isActive = activeToolId === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`ai-tool-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTool(tool.id)}
          >
            <div className="tool-tab-icon-box">
              <IconComponent size={18} />
            </div>

            <div className="tool-tab-info">
              <div className="tool-tab-title-row">
                <span className="tool-tab-title">{tool.name}</span>
                {tool.badge && (
                  <span className={`tool-badge-pill badge-${tool.badge.toLowerCase()}`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="tool-tab-desc">{tool.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AIToolSelector;
