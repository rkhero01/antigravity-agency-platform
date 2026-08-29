import React from 'react';
import { CreditCard, Download, Zap, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function BillingSettingsTab({
  data = {},
  onUpgradePlan,
  onUpdatePayment,
  onDownloadInvoice,
}) {
  const usage = data.usage || {
    clientWorkspaces: { current: 6, max: 10, label: '6 / 10 Client Workspaces' },
    aiTokens: { current: 1428500, max: 2000000, label: '1.43M / 2.0M Monthly AI Tokens' },
    teamSeats: { current: 6, max: 15, label: '6 / 15 Staff Seats' },
    socialChannels: { current: 18, max: 50, label: '18 / 50 Connected Channels' },
  };

  const invoices = data.invoices || [];

  return (
    <div className="settings-tab-content-pane">
      {/* Card 1: Subscription Tier Overview */}
      <div className="settings-section-card billing-plan-card">
        <div className="billing-top-banner-row">
          <div className="plan-info-group">
            <span className="plan-badge-tag">Active Subscription</span>
            <h3 className="plan-name-title">{data.currentPlan || 'Enterprise Agency Tier'}</h3>
            <p className="plan-pricing-sub">
              <strong>{data.price || '$499 / month'}</strong> • {data.billingCycle || 'Annual Billing'}
            </p>
          </div>

          <div className="plan-actions-group">
            <button
              type="button"
              className="btn-update-payment"
              onClick={onUpdatePayment}
            >
              <CreditCard size={14} />
              <span>Update Card</span>
            </button>
            <button
              type="button"
              className="btn-upgrade-plan"
              onClick={onUpgradePlan}
            >
              <Zap size={14} />
              <span>Upgrade Plan Tier</span>
            </button>
          </div>
        </div>

        <div className="plan-meta-strip">
          <span>Next Billing Renewal: <strong>{data.nextBillingDate || '2027-01-15'}</strong></span>
          <span>•</span>
          <span>Payment Method: <strong>{data.paymentMethod || 'Visa •••• 4242'}</strong></span>
        </div>
      </div>

      {/* Card 2: Resource Usage Meters */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="section-title">Resource Allocations & Quota Meters</h3>
            <p className="section-desc">Live consumption tracking across client accounts, seats, and AI generation tokens</p>
          </div>
        </div>

        <div className="usage-meters-grid-two">
          {/* Client Workspaces */}
          <div className="usage-meter-card">
            <div className="meter-label-row">
              <span className="meter-name">Client Workspaces</span>
              <strong className="meter-val">{usage.clientWorkspaces?.current} / {usage.clientWorkspaces?.max}</strong>
            </div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill primary"
                style={{ width: `${(usage.clientWorkspaces?.current / usage.clientWorkspaces?.max) * 100}%` }}
              />
            </div>
            <span className="meter-note">4 available slots remaining</span>
          </div>

          {/* Monthly AI Tokens */}
          <div className="usage-meter-card">
            <div className="meter-label-row">
              <span className="meter-name">Monthly AI Generation Tokens</span>
              <strong className="meter-val">
                {(usage.aiTokens?.current / 1000000).toFixed(2)}M / {(usage.aiTokens?.max / 1000000).toFixed(1)}M
              </strong>
            </div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill warning"
                style={{ width: `${(usage.aiTokens?.current / usage.aiTokens?.max) * 100}%` }}
              />
            </div>
            <span className="meter-note">71.4% consumed • Resets in 3 days</span>
          </div>

          {/* Team Seats */}
          <div className="usage-meter-card">
            <div className="meter-label-row">
              <span className="meter-name">Agency Staff Seats</span>
              <strong className="meter-val">{usage.teamSeats?.current} / {usage.teamSeats?.max}</strong>
            </div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill success"
                style={{ width: `${(usage.teamSeats?.current / usage.teamSeats?.max) * 100}%` }}
              />
            </div>
            <span className="meter-note">9 additional seats available</span>
          </div>

          {/* Social Channels */}
          <div className="usage-meter-card">
            <div className="meter-label-row">
              <span className="meter-name">Connected Social Channels</span>
              <strong className="meter-val">{usage.socialChannels?.current} / {usage.socialChannels?.max}</strong>
            </div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill cyan"
                style={{ width: `${(usage.socialChannels?.current / usage.socialChannels?.max) * 100}%` }}
              />
            </div>
            <span className="meter-note">32 channels available</span>
          </div>
        </div>
      </div>

      {/* Card 3: Invoices History */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Download size={18} />
          </div>
          <div>
            <h3 className="section-title">Billing History & Invoices</h3>
            <p className="section-desc">Download past VAT and tax-compliant receipts for accounting</p>
          </div>
        </div>

        <div className="invoices-table-wrapper">
          <table className="saas-table invoices-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Billing Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Download PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{inv.id}</strong></td>
                  <td>{inv.date}</td>
                  <td><strong>{inv.amount}</strong></td>
                  <td><span className="status-pill-paid">Paid</span></td>
                  <td>
                    <button
                      type="button"
                      className="btn-download-inv"
                      onClick={() => onDownloadInvoice(inv.id)}
                    >
                      <Download size={13} />
                      <span>PDF Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BillingSettingsTab;
