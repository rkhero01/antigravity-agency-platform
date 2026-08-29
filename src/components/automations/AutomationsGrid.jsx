import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { AutomationRuleCard } from './AutomationRuleCard.jsx';

export function AutomationsGrid({
  automations = [],
  onToggleStatus,
  onTriggerTest,
  onDeleteAutomation,
  onOpenCreateModal,
}) {
  if (automations.length === 0) {
    return (
      <div className="automations-empty-state-card">
        <Zap size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No automation rules found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or build a custom workflow trigger.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenCreateModal}
        >
          <Plus size={15} />
          <span>Create Automation Rule</span>
        </button>
      </div>
    );
  }

  return (
    <div className="automations-cards-grid">
      {automations.map((rule) => (
        <AutomationRuleCard
          key={rule.id}
          automation={rule}
          onToggleStatus={onToggleStatus}
          onTriggerTest={onTriggerTest}
          onDeleteAutomation={onDeleteAutomation}
        />
      ))}
    </div>
  );
}

export default AutomationsGrid;
