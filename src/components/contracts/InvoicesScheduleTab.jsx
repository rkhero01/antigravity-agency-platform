import React from 'react';
import { Receipt, CheckCircle2, Clock, Download, DollarSign } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function InvoicesScheduleTab({
  invoices = [],
  onMarkPaid,
}) {
  const getStatusBadge = (status) => {
    if (status === 'Paid') return <Badge variant="success" size="sm">✓ Paid</Badge>;
    if (status === 'Pending') return <Badge variant="warning" size="sm">⏳ Due</Badge>;
    return <Badge variant="primary" size="sm">📅 Scheduled</Badge>;
  };

  return (
    <div className="invoices-schedule-card">
      <div className="table-card-header">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-cyan" />
          <span className="table-title">Automated Invoice Schedules & Client Billing Audit</span>
        </div>
        <span className="table-count-chip">{invoices.length} Invoices</span>
      </div>

      <div className="logs-table-responsive">
        <table className="saas-table invoices-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Client Workspace</th>
              <th>Billing Date</th>
              <th>Retainer Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No invoices recorded for selected workspace.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="invoice-table-row">
                  <td>
                    <strong className="invoice-id-text text-cyan">{inv.id}</strong>
                  </td>
                  <td>
                    <span className="invoice-client-text">🏢 {inv.clientName}</span>
                  </td>
                  <td>
                    <span className="invoice-date-text">{inv.date}</span>
                  </td>
                  <td>
                    <strong className="invoice-amount-text text-white">{inv.amount}</strong>
                  </td>
                  <td>
                    <span className="invoice-method-chip">{inv.method || 'Stripe ACH'}</span>
                  </td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>
                    <div className="table-actions-cell">
                      {inv.status !== 'Paid' && (
                        <button
                          type="button"
                          className="btn-mark-paid"
                          onClick={() => onMarkPaid(inv.id)}
                          title="Record payment received"
                        >
                          <CheckCircle2 size={12} />
                          <span>Mark Paid</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => window.print()}
                        title="Print Invoice Receipt"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoicesScheduleTab;
