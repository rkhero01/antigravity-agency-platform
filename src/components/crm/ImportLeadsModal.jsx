import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { crmService } from '../../services/crmService.js';

export function ImportLeadsModal({
  isOpen,
  onClose,
  onImportComplete,
}) {
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState(null);

  if (!isOpen) return null;

  const handleSimulateImport = async () => {
    setImporting(true);
    const mockBatch = [
      { name: 'Dr. Evelyn Harper', company: 'Harper Dermatology Group', email: 'evelyn@harperderm.com', phone: '+1 (512) 555-4011', source: 'Google Ads' },
      { name: 'Liam Sterling', company: 'Sterling Real Estate HQ', email: 'liam@sterlingrealty.com', phone: '+1 (512) 555-4012', source: 'Meta Ads' },
      { name: 'Maya Lin', company: 'Lin BioWellness Studio', email: 'maya@linbiowellness.com', phone: '+1 (512) 555-4013', source: 'Instagram' },
      { name: 'Patrick O\'Connor', company: 'O\'Connor SaaS Solutions', email: 'poconnor@ocsaas.io', phone: '+1 (415) 555-4014', source: 'Website' },
      { name: 'Sofia Rodriguez', company: 'Rodriguez Luxury Spa', email: 'sofia@rodriguezspa.com', phone: '+1 (212) 555-4015', source: 'WhatsApp' },
    ];

    setTimeout(async () => {
      const res = await crmService.importLeads(mockBatch);
      setSummary(res);
      setImporting(false);
      if (onImportComplete) onImportComplete();
    }, 1000);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card import-leads-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="modal-title">Bulk CSV Lead Ingestion</h3>
              <p className="modal-subtitle">Import external contact lists with automated column mapping & duplicate deduplication</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="import-leads-body">
          {summary ? (
            <div className="import-summary-card">
              <CheckCircle2 size={36} className="text-success" />
              <h4 className="text-white text-base font-bold">Successfully Ingested {summary.importedCount} New Leads!</h4>
              <p className="text-xs text-muted">All contacts have been automatically assigned to account executives and added to the "New Lead" pipeline stage.</p>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div className="csv-dropzone-box" onClick={handleSimulateImport}>
                <FileSpreadsheet size={36} className="text-primary" />
                <strong className="text-white text-sm">Upload CSV / Excel Contact File</strong>
                <span className="text-xs text-muted">Click to ingest sample B2B prospect batch (5 qualified records)</span>
              </div>

              {/* Column Mapping Preview */}
              <div className="column-mapping-box">
                <span className="text-xs text-primary font-bold block mb-1">Automated Column Detection:</span>
                <div className="mapping-grid">
                  <div className="map-col">CSV: "Full Name" → <strong>Lead Name</strong></div>
                  <div className="map-col">CSV: "Work Email" → <strong>Email Address</strong></div>
                  <div className="map-col">CSV: "Company Name" → <strong>Company</strong></div>
                  <div className="map-col">CSV: "Phone" → <strong>Direct Phone</strong></div>
                </div>
              </div>

              {/* Deduplication Safeguard */}
              <div className="dedup-safeguard-strip">
                <ShieldCheck size={16} className="text-success" />
                <span className="text-xs text-white">Smart Deduplication Active: Existing emails will be updated rather than duplicated.</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            {summary ? 'Done' : 'Cancel'}
          </button>
          {!summary && (
            <button
              type="button"
              disabled={importing}
              onClick={handleSimulateImport}
              className="btn-saas-primary"
            >
              <UploadCloud size={15} />
              <span>{importing ? 'Processing Batch...' : 'Simulate CSV Batch Import'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportLeadsModal;
