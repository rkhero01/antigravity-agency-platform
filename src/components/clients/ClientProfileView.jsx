import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Share2,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Sparkles,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ClientProfileView({ client, onBack, onNavigateToModule }) {
  const [activeTab, setActiveTab] = useState('overview');

  const statusVariant =
    client.status === 'Active'
      ? 'success'
    : client.status === 'Onboarding'
    ? 'info'
    : 'warning';

  return (
    <div className="client-profile-view-container">
      {/* Back Navigation Bar */}
      <div className="profile-top-nav-bar">
        <button type="button" className="btn-back-to-directory" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to All Clients</span>
        </button>

        <div className="profile-action-buttons">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => onNavigateToModule?.('ai-assistant')}
          >
            <Sparkles size={15} />
            <span>AI Copy for {client.name.split(' ')[0]}</span>
          </button>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => onNavigateToModule?.('content')}
          >
            <Plus size={15} />
            <span>New Post for Client</span>
          </button>
        </div>
      </div>

      {/* Main Client Banner */}
      <div className="client-profile-hero-card">
        <div className="profile-hero-top">
          <div className="profile-hero-avatar">
            {client.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>

          <div className="profile-hero-info">
            <div className="profile-title-row">
              <h2 className="profile-brand-name">{client.name}</h2>
              <Badge variant={statusVariant}>{client.status}</Badge>
            </div>
            <p className="profile-industry-subtitle">{client.industry}</p>

            <div className="profile-contact-links-grid">
              <div className="profile-link-item">
                <Globe size={14} className="text-cyan" />
                <a href={client.website} target="_blank" rel="noreferrer">
                  {client.website?.replace('https://', '')}
                </a>
              </div>
              <div className="profile-link-item">
                <MapPin size={14} className="text-violet" />
                <span>{client.location}</span>
              </div>
              <div className="profile-link-item">
                <Mail size={14} className="text-muted" />
                <span>{client.email}</span>
              </div>
              <div className="profile-link-item">
                <Phone size={14} className="text-muted" />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-strip">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Metrics
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            Connected Channels ({client.connectedPlatforms?.length})
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
            onClick={() => setActiveTab('strategy')}
          >
            Strategy & Notes
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="profile-tab-content-stack">
          {/* 4 KPI Cards */}
          <div className="client-kpis-grid">
            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-violet">
                <DollarSign size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Monthly Retainer</span>
                <span className="profile-kpi-value">${client.monthlyBudget?.toLocaleString()}</span>
                <span className="profile-kpi-sub">Active billing cycle</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-gold">
                <TrendingUp size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Average ROAS</span>
                <span className="profile-kpi-value text-gold">{client.roas}</span>
                <span className="profile-kpi-sub">+0.6x higher than target</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-emerald">
                <Target size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Total Leads</span>
                <span className="profile-kpi-value text-emerald">{client.totalLeads?.toLocaleString()}</span>
                <span className="profile-kpi-sub">Paid & organic funnels</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-cyan">
                <Users size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Audience Reach</span>
                <span className="profile-kpi-value text-cyan">{client.audienceSize}</span>
                <span className="profile-kpi-sub">Cross-platform followers</span>
              </div>
            </div>
          </div>

          {/* Two Columns: Recent Scheduled Content & Client Strategy */}
          <div className="profile-content-columns">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h3>Recent Scheduled Content</h3>
                  <p>Upcoming campaigns for {client.name}</p>
                </div>
              </div>
              <div className="profile-posts-list">
                {client.recentPosts?.map((post, idx) => (
                  <div key={idx} className="profile-post-row">
                    <div className="post-row-left">
                      <span className="post-platform-tag">{post.platform}</span>
                      <strong className="post-title-text">{post.title}</strong>
                    </div>
                    <Badge
                      variant={
                        post.status === 'Scheduled'
                          ? 'success'
                          : post.status === 'Approved'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {post.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h3>Assigned Team & Strategy Note</h3>
                  <p>Account governance & creative direction</p>
                </div>
              </div>
              <div className="profile-strategy-box">
                <div className="assigned-lead-callout">
                  <span className="lead-label">Account Lead:</span>
                  <strong className="lead-name">👤 {client.assignedMember}</strong>
                </div>
                <p className="strategy-text-para">
                  {client.strategyNote ||
                    'Standard agency social media marketing and automated lead capture strategy.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Connected Channels */}
      {activeTab === 'channels' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <h3>Integrated Social Channels</h3>
              <p>Active API connections and publishing sync</p>
            </div>
          </div>
          <div className="channels-detailed-grid">
            {client.connectedPlatforms?.map((plat) => (
              <div key={plat} className="channel-detail-box">
                <div className="channel-box-top">
                  <Share2 size={20} className="text-cyan" />
                  <Badge variant="success" size="sm">
                    Synced
                  </Badge>
                </div>
                <h4 className="channel-platform-title">{plat.toUpperCase()}</h4>
                <p className="channel-sync-sub">Auto-publishing enabled • Token valid</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Strategy & Notes */}
      {activeTab === 'strategy' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <h3>Agency Creative Blueprint & Tone of Voice</h3>
              <p>Guidelines for copywriters and AI Studio generation</p>
            </div>
          </div>
          <div className="strategy-detailed-card">
            <div className="strategy-item-block">
              <strong>Core Marketing Objective:</strong>
              <p>Scale high-intent conversions while building sustainable organic brand authority.</p>
            </div>
            <div className="strategy-item-block">
              <strong>Brand Voice Guidelines:</strong>
              <p>{client.strategyNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProfileView;
