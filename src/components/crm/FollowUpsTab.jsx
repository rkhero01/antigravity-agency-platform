import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Video,
  UserCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function FollowUpsTab({
  followUps = [],
  onComplete,
  onReschedule,
  onOpenLead,
}) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'Due Today', 'Overdue', 'Tomorrow', 'Upcoming'];

  const filteredFollowUps = followUps.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.statusCategory.toLowerCase() === categoryFilter.toLowerCase();
  });

  const getMethodIcon = (method) => {
    if (method.includes('Phone')) return <Phone size={13} className="text-cyan" />;
    if (method.includes('WhatsApp')) return <MessageSquare size={13} className="text-success" />;
    if (method.includes('Email')) return <Mail size={13} className="text-primary" />;
    return <Video size={13} className="text-pink" />;
  };

  const getCategoryBadge = (cat) => {
    if (cat === 'Overdue') return <Badge variant="danger" size="sm">🚨 Overdue</Badge>;
    if (cat === 'Due Today') return <Badge variant="warning" size="sm">⚡ Due Today</Badge>;
    return <Badge variant="primary" size="sm">📅 {cat}</Badge>;
  };

  return (
    <div className="crm-followups-pane">
      {/* Top Banner */}
      <div className="followups-top-banner">
        <Clock size={20} className="text-warning flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Sales Follow-Up Cadence & High-Velocity Touchpoints</strong>
          <span className="text-xs text-muted">Never let a high-intent inbound lead slip through the cracks. Execute timely multichannel outreach across phone, WhatsApp, and email.</span>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="followups-filter-bar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-pill-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All Follow-ups' : cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">Showing {filteredFollowUps.length} scheduled follow-ups</span>
      </div>

      {/* Follow-up Cards List */}
      <div className="followups-cards-list">
        {filteredFollowUps.map((fu) => (
          <div key={fu.id} className="followup-card-item">
            <div className="fu-header-row">
              <div className="flex items-center gap-2">
                {getCategoryBadge(fu.statusCategory)}
                <span className="fu-client-tag">🏢 {fu.clientName}</span>
                <span className="fu-method-chip">
                  {getMethodIcon(fu.method)}
                  <span>{fu.method}</span>
                </span>
              </div>
              <strong className="fu-time-text">{fu.dateTime}</strong>
            </div>

            <div className="fu-main-body">
              <div>
                <h4
                  className="fu-lead-name cursor-pointer"
                  onClick={() => onOpenLead(fu.leadId)}
                >
                  {fu.leadName}
                </h4>
                <span className="fu-company-text">{fu.company}</span>
              </div>

              <p className="fu-notes-text">"{fu.notes}"</p>
            </div>

            <div className="fu-footer-row">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <UserCheck size={13} className="text-primary" />
                <span>Assigned: <strong>{fu.assignedStaff}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-complete-fu"
                  onClick={() => onComplete(fu.id)}
                >
                  <CheckCircle2 size={13} />
                  <span>Mark Done</span>
                </button>

                <button
                  type="button"
                  className="btn-reschedule-fu"
                  onClick={() => onReschedule(fu.id, 'Tomorrow at 10:00 AM')}
                >
                  <Calendar size={13} />
                  <span>Reschedule</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FollowUpsTab;
