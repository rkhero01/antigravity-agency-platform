import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check } from 'lucide-react';
import { PRESET_TEMPLATES } from '../../data/mockAI.js';

export function AIPresetTemplates({ isOpen, onClose, onSelectTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Social Proof', 'Engagement', 'Short-Form Video', 'Planning', 'Reach', 'Paid Media', 'Refinement'];

  const filteredTemplates = selectedCategory === 'All'
    ? PRESET_TEMPLATES
    : PRESET_TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="modal-dialog-card ai-templates-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Prompt Recipe Library</h3>
              <p className="modal-subtitle">Proven agency prompt frameworks engineered for high-engagement output</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="template-categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="templates-modal-grid">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="template-recipe-card">
              <div className="template-card-top">
                <span className="template-category-badge">{template.category}</span>
                <span className="template-tool-tag">{template.toolId}</span>
              </div>
              <h4 className="template-recipe-title">{template.title}</h4>
              <p className="template-recipe-prompt">{template.prompt}</p>
              <button
                type="button"
                className="btn-use-template"
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
              >
                <Sparkles size={13} />
                <span>Load Recipe</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIPresetTemplates;
