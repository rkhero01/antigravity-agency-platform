import React from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { ContractCard } from './ContractCard.jsx';

export function ContractsGrid({
  contracts = [],
  onInspect,
  onDeleteContract,
  onOpenCreateModal,
}) {
  if (contracts.length === 0) {
    return (
      <div className="contracts-empty-state-card">
        <FileCheck size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No client agreements found</h4>
        <p className="empty-state-subtitle">Adjust your filter parameters or draft a new client retainer agreement.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenCreateModal}
        >
          <Plus size={15} />
          <span>Draft Client Agreement</span>
        </button>
      </div>
    );
  }

  return (
    <div className="contracts-cards-grid">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onInspect={onInspect}
          onDeleteContract={onDeleteContract}
        />
      ))}
    </div>
  );
}

export default ContractsGrid;
