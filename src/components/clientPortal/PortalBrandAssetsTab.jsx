import React from 'react';
import { Palette, Download, FileText, Image, CheckCircle2 } from 'lucide-react';

export function PortalBrandAssetsTab({
  brandAssets = [],
  client = {},
  onDownloadAsset,
}) {
  return (
    <div className="portal-brand-assets-pane">
      {/* Brand Identity Card */}
      <div className="brand-kit-summary-card">
        <div className="brand-kit-header">
          <div className="brand-kit-icon-badge">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="section-title">Brand Identity & Digital Assets Hub</h3>
            <p className="section-desc">Approved corporate logos, font tokens, and media guidelines</p>
          </div>
        </div>

        <div className="brand-tokens-grid">
          <div className="token-item">
            <span className="token-label">Primary Brand Accent</span>
            <div className="token-color-preview">
              <div
                className="color-swatch-box"
                style={{ background: client.primaryColor || '#6366f1' }}
              />
              <strong className="token-hex">{client.primaryColor || '#6366f1'}</strong>
            </div>
          </div>

          <div className="token-item">
            <span className="token-label">Client Portal Subdomain</span>
            <strong className="token-subdomain">{client.subdomain || 'portal.brand.app'}</strong>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="brand-assets-grid">
        {brandAssets.map((asset) => (
          <div key={asset.id} className="brand-asset-card">
            <div className="asset-left">
              <div className="asset-icon-box">
                <FileText size={18} />
              </div>
              <div>
                <strong className="asset-name">{asset.name}</strong>
                <span className="asset-meta">{asset.type} • {asset.size}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-download-asset"
              onClick={() => onDownloadAsset(asset)}
            >
              <Download size={13} />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortalBrandAssetsTab;
