import React from 'react';
import { X, FileCheck, Printer, CheckCircle2, DollarSign, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ContractDetailModal({
  contract,
  isOpen,
  onClose,
}) {
  if (!isOpen || !contract) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card contract-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FileCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">{contract.title}</h3>
                <Badge variant="success" size="sm">{contract.status}</Badge>
              </div>
              <p className="modal-subtitle">Master Service Agreement (MSA) • 🏢 {contract.clientName}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="contract-detail-body">
          {/* Top 3 Financial Targets */}
          <div className="contract-kpis-three-col">
            <div className="c-kpi-card">
              <span className="ck-lbl">Monthly Retainer Fee</span>
              <strong className="ck-val text-success">{contract.monthlyFee}</strong>
            </div>
            <div className="c-kpi-card">
              <span className="ck-lbl">Annual Contract Value</span>
              <strong className="ck-val text-cyan">{contract.annualValue}</strong>
            </div>
            <div className="c-kpi-card">
              <span className="ck-lbl">Term Commitment</span>
              <strong className="ck-val text-primary">{contract.termMonths} Months</strong>
            </div>
          </div>

          {/* Agreement Scope */}
          <div className="contract-section-card">
            <h4 className="c-section-title">Schedule A: In-Scope Agency Deliverables</h4>
            <div className="contract-deliverables-full-list">
              {contract.scopeDeliverables.map((item, idx) => (
                <div key={idx} className="c-deliv-row">
                  <CheckCircle2 size={15} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing & Terms */}
          <div className="contract-section-card">
            <h4 className="c-section-title">Schedule B: Commercial Terms & Invoicing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
              <div>
                <strong className="text-white block mb-0.5">Billing Cadence:</strong>
                <span>{contract.billingCycle}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Contract Term & Renewal:</strong>
                <span>Effective {contract.startDate} to {contract.renewalDate} (Automatic annual renewal unless 30-day notice).</span>
              </div>
            </div>
          </div>

          {/* Digital Signature Execution */}
          <div className="contract-section-card signature-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-success" />
              <h4 className="c-section-title">Digital Signature & Execution Audit</h4>
            </div>
            <div className="signature-box">
              <div className="sig-line">
                <span className="sig-author">{contract.signatory}</span>
                <span className="sig-status text-success">✓ Cryptographically Verified (Antigravity e-Sign)</span>
              </div>
              <span className="sig-timestamp">Timestamp: {contract.startDate} 09:00:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Master Agreement (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContractDetailModal;
