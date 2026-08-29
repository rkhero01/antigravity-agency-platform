import React from 'react';
import { Search, Bell, Sparkles, Building2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function Navbar({ activeClient, onClientChange, onQuickAction }) {
  return (
    <header className="agency-navbar">
      <div className="navbar-left">
        <div className="client-selector-wrapper">
          <Building2 size={16} className="client-selector-icon" />
          <select
            className="client-select"
            value={activeClient}
            onChange={(e) => onClientChange?.(e.target.value)}
          >
            <option value="all">🏢 All Client Accounts (Portfolio)</option>
            {mockClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.industry})
              </option>
            ))}
          </select>
        </div>

        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search campaigns, content, clients, or tasks..."
            className="search-input"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="btn-ai-quick"
          onClick={() => onQuickAction?.('ai-assistant')}
        >
          <Sparkles size={16} />
          <span>AI Quick Assistant</span>
        </button>

        <button type="button" className="btn-icon-notify" title="Notifications">
          <Bell size={18} />
          <span className="notify-badge">3</span>
        </button>

        <div className="user-profile-pill">
          <div className="user-avatar-initials">AM</div>
          <div className="user-meta">
            <span className="user-name">Alex Morgan</span>
            <span className="user-role">Agency Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
