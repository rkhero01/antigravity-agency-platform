import React from 'react';
import {
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const PLATFORM_SPECS = [
  {
    id: 'meta',
    platform: 'META',
    name: 'Facebook Pages',
    category: 'Meta Business Suite',
    description: 'Direct publishing and audience reach for Facebook Business Pages and brand communities.',
    icon: 'facebook',
    color: '#1877f2',
  },
  {
    id: 'instagram',
    platform: 'INSTAGRAM',
    name: 'Instagram Business',
    category: 'Instagram Professional',
    description: 'Publish carousels, reels, single images, and track professional account metrics.',
    icon: 'instagram',
    color: '#e1306c',
  },
  {
    id: 'google_business',
    platform: 'GOOGLE_BUSINESS',
    name: 'Google Business Profile',
    category: 'Google Workspace',
    description: 'Local business listings, updates, customer reviews, and location visibility.',
    icon: 'google',
    color: '#4285f4',
  },
  {
    id: 'youtube',
    platform: 'YOUTUBE',
    name: 'YouTube Channels',
    category: 'Video & Shorts',
    description: 'Publish videos, shorts, and analyze audience retention and subscriber dynamics.',
    icon: 'youtube',
    color: '#ff0000',
  },
  {
    id: 'linkedin',
    platform: 'LINKEDIN',
    name: 'LinkedIn Company',
    category: 'Professional Network',
    description: 'B2B executive thought leadership, company pages, and corporate newsletters.',
    icon: 'linkedin',
    color: '#0a66c2',
  },
  {
    id: 'twitter',
    platform: 'TWITTER',
    name: 'X (Twitter)',
    category: 'Microblogging & News',
    description: 'Fast-paced real-time communication, announcement threads, and community engagement.',
    icon: 'twitter',
    color: '#000000',
  },
];

export function PlatformConnectionCards({
  accounts = [],
  oauthStatus = {},
  onInitiateConnect,
  isConnecting = false,
}) {
  return (
    <div className="platform-connection-grid">
      {PLATFORM_SPECS.map((spec) => {
        const platformKey = spec.platform.toUpperCase();
        const isConfigured = Boolean(oauthStatus[platformKey] || (spec.id === 'instagram' && oauthStatus.META) || (spec.id === 'meta' && oauthStatus.META) || (spec.id === 'facebook' && oauthStatus.META));

        // Connected accounts for this specific platform
        const connectedCount = accounts.filter((a) => {
          const p = (a.platform || '').toUpperCase();
          if (spec.id === 'meta' || spec.id === 'facebook') return p === 'FACEBOOK' || p === 'META';
          if (spec.id === 'instagram') return p === 'INSTAGRAM';
          return p === platformKey;
        }).length;

        const hasActiveAccount = connectedCount > 0;

        return (
          <div key={spec.id} className={`platform-card-item ${hasActiveAccount ? 'connected' : ''}`}>
            <div className="platform-card-header">
              <div className="platform-icon-circle" style={{ backgroundColor: `${spec.color}15`, color: spec.color }}>
                <Share2 size={20} />
              </div>
              <div className="platform-badge-group">
                {hasActiveAccount ? (
                  <span className="status-badge-pill active">
                    <CheckCircle2 size={12} />
                    <span>{connectedCount} Connected</span>
                  </span>
                ) : isConfigured ? (
                  <span className="status-badge-pill connectable">
                    <Sparkles size={12} />
                    <span>Ready to Connect</span>
                  </span>
                ) : (
                  <span className="status-badge-pill config-req">
                    <Info size={12} />
                    <span>Config Required</span>
                  </span>
                )}
              </div>
            </div>

            <div className="platform-card-content">
              <h3 className="platform-card-name">{spec.name}</h3>
              <span className="platform-card-cat">{spec.category}</span>
              <p className="platform-card-desc">{spec.description}</p>
            </div>

            <div className="platform-card-footer">
              <button
                type="button"
                className={`btn-connect-platform ${hasActiveAccount ? 'connected-btn' : 'action-btn'}`}
                onClick={() => onInitiateConnect(spec.platform)}
                disabled={isConnecting}
              >
                <span>{hasActiveAccount ? 'Connect Another' : 'Connect Channel'}</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlatformConnectionCards;
