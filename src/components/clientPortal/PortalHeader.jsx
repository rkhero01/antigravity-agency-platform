import React from 'react';
import {
  Globe,
  Share2,
  Building,
  CheckCircle2,
  Lock,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function PortalHeader({
  clientData = {},
  selectedClient,
  onClientChange,
  isPublicPreview,
  onTogglePublicPreview,
  onCopyLink,
  copiedLink,
}) {
  const client = clientData.client || {};

  return (
    <div className="portal-header-container">
      {/* Top Banner */}
      <div className="portal-top-banner">
        <div className="portal-brand-identity">
          <img
            src={client.logo}
            alt={client.name}
            className="portal-client-avatar"
          />
          <div className="portal-client-info">
            <div className="portal-badge-strip">
              <span className="portal-badge-tag">
                <Globe size={13} />
                <span>Client Stakeholder Portal</span>
              </span>
              <span className="portal-security-badge">
                <Lock size={12} />
                <span>256-Bit Encrypted Link</span>
              </span>
            </div>
            <h1 className="portal-client-title">{client.name}</h1>
            <p className="portal-tagline-text">{client.tagline}</p>
          </div>
        </div>

        <div className="portal-banner-actions">
          {/* Client Switcher (for internal agency OS view) */}
          <div className="portal-client-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="portal-client-select"
              aria-label="Switch Client Portal"
            >
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Copy Shareable Link */}
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onCopyLink}
            title="Copy passwordless review link for client stakeholders"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 size={15} className="text-success" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={15} />
                <span>Share Client Link</span>
              </>
            )}
          </button>

          {/* Public Link Simulator Mode */}
          <button
            type="button"
            className={`btn-public-preview-toggle ${isPublicPreview ? 'active' : ''}`}
            onClick={onTogglePublicPreview}
            title="Toggle between Agency Editor and Client Public Portal View"
          >
            <ExternalLink size={15} />
            <span>{isPublicPreview ? 'Exit Client View' : 'Preview as Client'}</span>
          </button>
        </div>
      </div>

      {/* Public Mode Sub-banner */}
      {isPublicPreview && (
        <div className="public-simulator-banner">
          <div className="sim-badge">CLIENT LIVE VIEW</div>
          <p>
            You are previewing this portal exactly as your client stakeholders see it. All actions (approving, requesting revisions) update the live agency database.
          </p>
        </div>
      )}
    </div>
  );
}

export default PortalHeader;
