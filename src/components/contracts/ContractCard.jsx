import React from 'react';
import { DollarSign, Calendar, FileCheck, Eye, Trash2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ContractCard({
  contract,
  onInspect,
  onDeleteContract,
}) {
  const getStatusBadge = (status) => {
    if (status === 'Active Retainer') return <Badge variant="success" size="sm">🟢 {status}</Badge>;
    if (status === 'Expiring Soon') return <Badge variant="warning" size="sm">⏳ {status}</Badge>;
    return <Badge variant="primary" size="sm">📝 {status}</Badge>;
  };

  return (
    <div className="contract-card-item">
      {/* Header */}
      <div className="contract-card-header">
        <span className="contract-client-tag">🏢 {contract.clientName}</span>
        {getStatusBadge(contract.status)}
      </div>

      {/* Title & Signatory */}
      <div className="contract-title-block">
        <h3 className="contract-title" title={contract.title}>
          {contract.title}
        </h3>
        <span className="contract-signatory-text">Signatory: {contract.signatory}</span>
      </div>

      {/* Financials Grid */}
      <div className="contract-financials-grid">
        <div className="cnf-block">
          <span className="cnf-lbl">Monthly Retainer</span>
          <strong className="cnf-val text-success">{contract.monthlyFee}</strong>
        </div>
        <div className="cnf-block">
          <span className="cnf-lbl">Annual Value (ACV)</span>
          <strong className="cnf-val text-cyan">{contract.annualValue}</strong>
        </div>
        <div className="cnf-block">
          <span className="cnf-lbl">Term Length</span>
          <strong className="cnf-val text-primary">{contract.termMonths} Months</strong>
        </div>
      </div>

      {/* Billing Schedule Info */}
      <div className="contract-billing-meta-row">
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} className="inline-icon" />
          <span>{contract.billingCycle}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Calendar size={12} className="inline-icon" />
          <span>Renews: <strong>{contract.renewalDate}</strong></span>
        </div>
      </div>

      {/* Scope Deliverables Preview */}
      <div className="contract-scope-box">
        <span className="scope-lbl">Scope Deliverables ({contract.scopeDeliverables.length} Items):</span>
        <ul className="scope-list">
          {contract.scopeDeliverables.slice(0, 3).map((item, idx) => (
            <li key={idx} className="scope-item">
              <CheckCircle2 size={12} className="text-success flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
          {contract.scopeDeliverables.length > 3 && (
            <li className="scope-more-text">+{contract.scopeDeliverables.length - 3} more scope deliverables...</li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="contract-card-footer">
        <button
          type="button"
          className="btn-inspect-contract"
          onClick={() => onInspect(contract)}
        >
          <Eye size={13} />
          <span>Inspect Agreement & Terms</span>
        </button>

        <button
          type="button"
          className="btn-delete-contract"
          onClick={() => onDeleteContract(contract.id)}
          title="Delete contract"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default ContractCard;
