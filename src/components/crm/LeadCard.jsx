import React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function LeadCard({
  lead,
  onOpenDetails,
  onOpenScoreModal,
  onMoveStatus,
  stages = [],
}) {
  const currentIndex = stages.indexOf(lead.status);

  const getScoreBadge = (score, category) => {
    if (category === 'VIP') {
      return (
        <span
          className="lead-score-pill vip cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onOpenScoreModal(lead);
          }}
          title="AI VIP Lead - Click to view scoring breakdown"
        >
          <Star size={11} className="fill-warning text-warning" /> VIP {score}
        </span>
      );
    }
    if (category === 'Hot') {
      return (
        <span
          className="lead-score-pill hot cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onOpenScoreModal(lead);
          }}
          title="Hot Lead - Click for scoring breakdown"
        >
          <Flame size={11} /> Hot {score}
        </span>
      );
    }
    return (
      <span
        className="lead-score-pill neutral cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenScoreModal(lead);
        }}
      >
        {category} {score}
      </span>
    );
  };

  const getPriorityBadge = (p) => {
    if (p === 'High') return <Badge variant="danger" size="sm">High</Badge>;
    if (p === 'Medium') return <Badge variant="warning" size="sm">Med</Badge>;
    return <Badge variant="neutral" size="sm">Low</Badge>;
  };

  return (
    <div className="crm-lead-card" onClick={() => onOpenDetails(lead)}>
      {/* Header */}
      <div className="lead-card-header">
        <div>
          <h4 className="lead-name-text">{lead.name}</h4>
          <span className="lead-company-text">{lead.company}</span>
        </div>
        {getScoreBadge(lead.leadScore, lead.scoreCategory)}
      </div>

      {/* Tags Row */}
      <div className="lead-tags-row">
        <span className="lead-source-chip">{lead.source}</span>
        <span className="lead-client-chip">🏢 {lead.clientName}</span>
      </div>

      {/* Deal Value & Priority */}
      <div className="lead-financials-row">
        <div className="flex items-center gap-1">
          <DollarSign size={13} className="text-success" />
          <strong className="lead-deal-val">${(lead.value || 0).toLocaleString()}</strong>
        </div>
        {getPriorityBadge(lead.priority)}
      </div>

      {/* Follow-up & Assigned Staff */}
      <div className="lead-footer-row">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} className="inline-icon text-dim" />
          <span className="truncate max-w-[130px]" title={lead.nextFollowUp}>{lead.nextFollowUp}</span>
        </div>

        <div className="lead-staff-avatar" title={`Assigned to ${lead.assignedStaff}`}>
          {lead.assignedStaff.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stage Movers Controls */}
      <div className="lead-stage-movers" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          disabled={currentIndex <= 0}
          className="btn-move-stage"
          onClick={() => onMoveStatus(lead.id, stages[currentIndex - 1])}
          title={currentIndex > 0 ? `Move back to ${stages[currentIndex - 1]}` : ''}
        >
          <ChevronLeft size={13} />
        </button>

        <span className="stage-step-indicator">{lead.status}</span>

        <button
          type="button"
          disabled={currentIndex >= stages.length - 1}
          className="btn-move-stage"
          onClick={() => onMoveStatus(lead.id, stages[currentIndex + 1])}
          title={currentIndex < stages.length - 1 ? `Advance to ${stages[currentIndex + 1]}` : ''}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default LeadCard;
