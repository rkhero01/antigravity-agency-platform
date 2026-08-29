import React from 'react';
import { Building, ChevronDown } from 'lucide-react';

export function ClientIntelligenceSelector({
  selectedClient = 'all',
  onClientChange,
  clients = [],
}) {
  return (
    <div className="client-intelligence-selector-wrap">
      <Building size={14} className="text-dim" />
      <select
        value={selectedClient}
        onChange={(e) => onClientChange && onClientChange(e.target.value)}
        className="client-intelligence-select"
        aria-label="Select Client Workspace"
      >
        <option value="all">🏢 All Agency Client Workspaces (7 Accounts)</option>
        {clients.map((c) => (
          <option key={c.clientId || c.id} value={c.clientId || c.id}>
            {c.clientName || c.name} ({c.industry || 'Client'})
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="text-dim pointer-events-none" />
    </div>
  );
}

export default ClientIntelligenceSelector;
