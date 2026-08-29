import React from 'react';
import { User, Shield, CheckCircle2, Heart, Award, Building } from 'lucide-react';

export function InboxCustomerSidebar({ conversation }) {
  if (!conversation) return null;

  const { customer } = conversation;

  return (
    <div className="inbox-customer-sidebar-pane">
      {/* Profile Card */}
      <div className="customer-profile-card">
        <img
          src={customer.avatar}
          alt={customer.name}
          className="customer-sidebar-avatar"
        />
        <h4 className="customer-sidebar-name">{customer.name}</h4>
        <span className="customer-sidebar-handle">{customer.handle}</span>
        <span className="customer-status-badge">{customer.status}</span>
      </div>

      {/* Attributes & Metrics */}
      <div className="customer-attributes-box">
        <h5 className="attr-heading">Community & Sentiment Profile</h5>

        <div className="attr-row">
          <span className="attr-lbl">Follower Reach</span>
          <strong className="attr-v">{customer.followers || '3.4K'}</strong>
        </div>

        <div className="attr-row">
          <span className="attr-lbl">Sentiment Rating</span>
          <strong className="attr-v text-success">{customer.sentimentScore || 'Positive'}</strong>
        </div>

        <div className="attr-row">
          <span className="attr-lbl">Client Workspace</span>
          <strong className="attr-v text-primary">{conversation.clientName}</strong>
        </div>

        <div className="attr-row">
          <span className="attr-lbl">Assigned Lead</span>
          <strong className="attr-v">{conversation.assignedTo}</strong>
        </div>

        <div className="attr-row">
          <span className="attr-lbl">Ticket Priority</span>
          <strong className={`attr-v ${conversation.priority === 'Urgent' ? 'text-danger' : 'text-warning'}`}>
            {conversation.priority}
          </strong>
        </div>
      </div>

      {/* Escalation SLA Note */}
      <div className="sla-guarantee-card">
        <Award size={16} className="text-cyan" />
        <div>
          <strong>PulseAI SLA Router</strong>
          <p>Direct message inquiry prioritized under 15-minute agency SLA.</p>
        </div>
      </div>
    </div>
  );
}

export default InboxCustomerSidebar;
