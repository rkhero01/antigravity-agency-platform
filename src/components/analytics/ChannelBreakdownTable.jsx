import React from 'react';
import { Share2, TrendingUp, Users, MousePointerClick, Zap } from 'lucide-react';

export function ChannelBreakdownTable({ channels = [] }) {
  return (
    <div className="analytics-table-card">
      <div className="table-header-bar">
        <div className="table-title-group">
          <Share2 size={16} className="text-primary" />
          <h3 className="table-main-heading">Channel & Network Performance Breakdown</h3>
        </div>
        <span className="table-records-count">{channels.length} Networks Tracked</span>
      </div>

      <div className="analytics-table-responsive">
        <table className="saas-table channel-analytics-table">
          <thead>
            <tr>
              <th>Channel Network</th>
              <th>Community Size</th>
              <th>Follower Delta</th>
              <th>Reach & Impressions</th>
              <th>Engagement Rate</th>
              <th>Link Clicks</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((row, idx) => (
              <tr key={row.channel || idx} className="channel-data-row">
                <td>
                  <div className="channel-name-cell">
                    <span
                      className="channel-color-dot"
                      style={{ background: row.color || '#6366f1' }}
                    />
                    <strong className="channel-title">{row.channel}</strong>
                  </div>
                </td>
                <td>
                  <span className="followers-count-text">{row.followers}</span>
                </td>
                <td>
                  <span className="followers-delta-text positive">{row.followersDelta || '+12.4%'}</span>
                </td>
                <td>
                  <strong className="reach-text">{row.reach}</strong>
                </td>
                <td>
                  <span className="engagement-pill-badge">{row.engagement}</span>
                </td>
                <td>
                  <span className="clicks-text">{row.clicks || '—'}</span>
                </td>
                <td>
                  <span className="conversion-text">{row.conversion}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChannelBreakdownTable;
