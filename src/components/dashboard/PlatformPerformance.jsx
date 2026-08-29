import React from 'react';
import { mockPlatformPerformance } from '../../data/mockDashboard.js';
import {
  Share2,
  Search,
  MapPin,
  ArrowUpRight,
  Globe,
  Radio,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

// Clean SVG Icons for Social Networks
function MetaIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const PLATFORM_ICONS = {
  Facebook: MetaIcon,
  Instagram: InstagramIcon,
  Search: Search,
  Share2: Share2,
  MapPin: MapPin,
};

export function PlatformPerformance({ onNavigateToPlatforms }) {
  return (
    <div className="dashboard-widget-card platform-performance-card">
      <div className="widget-header-row">
        <div className="widget-header-text">
          <h3 className="widget-title">Platform Performance</h3>
          <p className="widget-subtitle">
            Cross-network breakdown across paid campaigns & organic channels
          </p>
        </div>
        <button
          type="button"
          className="widget-action-link"
          onClick={onNavigateToPlatforms}
        >
          <span>Manage Accounts</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="table-responsive-container">
        <table className="saas-table platform-table">
          <thead>
            <tr>
              <th>Platform & Channel</th>
              <th>Active Accounts</th>
              <th>Spend</th>
              <th>Leads Generated</th>
              <th>Audience Engagement</th>
              <th>ROAS / Status</th>
            </tr>
          </thead>
          <tbody>
            {mockPlatformPerformance.map((item) => {
              const IconComp = PLATFORM_ICONS[item.icon] || Share2;
              return (
                <tr key={item.id} className="platform-table-row">
                  <td>
                    <div className="platform-identity-cell">
                      <div className="platform-icon-circle">
                        <IconComp size={16} />
                      </div>
                      <div className="platform-name-group">
                        <span className="platform-name-title">{item.platform}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="account-count-tag">{item.accountCount}</span>
                  </td>
                  <td>
                    <strong className="spend-number">{item.spend}</strong>
                  </td>
                  <td>
                    <span className="leads-badge">{item.leads}</span>
                  </td>
                  <td>
                    <span className="engagement-pill">{item.engagement}</span>
                  </td>
                  <td>
                    <div className="roas-status-cell">
                      <span className="roas-highlight">{item.roas}</span>
                      <Badge variant={item.statusVariant} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlatformPerformance;
