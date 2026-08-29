import React from 'react';
import { X, Sparkles, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RecipeTemplatesModal({
  recipes = [],
  isOpen,
  onClose,
  onInstallRecipe,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card recipe-templates-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">Pre-Built Automation Recipe Library</h3>
              <p className="modal-subtitle">Install 1-click battle-tested marketing workflows for client accounts</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="recipe-templates-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-template-card">
              <div className="recipe-card-header">
                <span className="recipe-category-pill">{recipe.category}</span>
                <button
                  type="button"
                  className="btn-install-recipe-action"
                  onClick={() => {
                    onInstallRecipe(recipe.id);
                    onClose();
                  }}
                >
                  <Plus size={13} />
                  <span>Install Recipe</span>
                </button>
              </div>

              <h4 className="recipe-title">{recipe.title}</h4>
              <p className="recipe-desc">{recipe.description}</p>

              <div className="recipe-flow-strip">
                <span className="r-pill">⚡ {recipe.trigger}</span>
                <ArrowRight size={12} className="text-muted" />
                <span className="r-pill text-cyan">🎯 {recipe.action}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeTemplatesModal;
