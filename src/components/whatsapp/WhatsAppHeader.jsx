import React from 'react';
import {
  MessageSquare,
  LayoutGrid,
  Send,
  FileText,
  Zap,
  Users,
  CalendarCheck,
  BarChart3,
  Plus,
  Sparkles,
  Megaphone,
  Search,
  Building,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function WhatsAppHeader({
  activeTab = 'overview',
  onTabChange,
  selectedClient = 'all',
  onClientChange,
  searchQuery = '',
  onSearchChange,
  onNewConversation,
  onCreateCampaign,
  onOpenAIModal,
  clients = whatsappClients,
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: 'Live' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'follow-ups', label: 'Follow-ups', icon: CalendarCheck, badge: 'Due' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="wa-header-container">
      {/* Top Banner */}
      <div className="wa-top-banner">
        <div className="wa-title-block">
          <div className="wa-badge-tag">
            <Radio size={13} className="text-success animate-pulse" />
            <span>WhatsApp Business Cloud API (Demo Sandbox / API Ready)</span>
          </div>
          <h1 className="wa-main-title">WhatsApp Marketing & Automation</h1>
          <p className="wa-subtitle-text">
            Multi-client WhatsApp conversations, high-converting broadcast campaigns, Meta-approved message templates, automated trigger workflows, and collaborative team operations.
          </p>
        </div>

        <div className="wa-banner-actions">
          <button
            type="button"
            className="btn-wa-action ai-highlight"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Assistant</span>
          </button>

          <button
            type="button"
            className="btn-wa-action secondary"
            onClick={onCreateCampaign}
          >
            <Megaphone size={15} />
            <span>Create Campaign</span>
          </button>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={onNewConversation}
          >
            <Plus size={16} />
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {/* Toolbar, Navigation Tabs & Workspace Search */}
      <div className="wa-toolbar-card">
        <div className="wa-tabs-row">
          <div className="wa-nav-tabs" role="tablist">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`wa-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && <span className="wa-tab-badge">{tab.badge}</span>}
                </button>
              );
            })}
          </div>

          <div className="wa-controls-group">
            {/* Client Workspace Selector */}
            <div className="wa-select-wrapper">
              <Building size={14} className="icon-muted" />
              <select
                value={selectedClient}
                onChange={(e) => onClientChange && onClientChange(e.target.value)}
                className="wa-select-field"
                aria-label="Filter by Client Workspace"
              >
                <option value="all">🏢 All Client Workspaces</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Universal Search Field */}
            <div className="wa-search-field-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations, phone, templates..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="wa-search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppHeader;
