import React from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  RotateCcw,
  Eye,
  Flame,
} from 'lucide-react';

export function FollowUpTable({
  followUps = [],
  onComplete,
  onReschedule,
  onOpenDetails,
  onOpenConversation,
}) {
  return (
    <div className="wa-followup-table-container">
      <table className="wa-followup-table">
        <thead>
          <tr>
            <th>Customer &amp; Client</th>
            <th>Type &amp; Priority</th>
            <th>Agenda Reason</th>
            <th>Deal Value</th>
            <th>Assigned Operator</th>
            <th>Due Timeline</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {followUps.map((item) => {
            const isOverdue = item.status === 'Overdue';
            const isDueToday = item.status === 'Due Today';
            const isCompleted = item.status === 'Completed';

            return (
              <tr
                key={item.id}
                className={`table-row-item ${isOverdue ? 'row-overdue' : isDueToday ? 'row-today' : ''}`}
                onClick={() => onOpenDetails && onOpenDetails(item)}
              >
                {/* Customer */}
                <td>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={item.customerName}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <strong className="text-white text-xs block">{item.customerName}</strong>
                      <span className="text-[11px] text-dim">{item.phone} • {item.clientName}</span>
                    </div>
                  </div>
                </td>

                {/* Type & Priority */}
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'VIP'
                          ? 'text-pink bg-pink-500/15'
                          : item.priority === 'High'
                          ? 'text-warning bg-warning/15'
                          : 'text-dim bg-white/5'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </td>

                {/* Agenda */}
                <td>
                  <p className="text-xs text-muted max-w-[240px] truncate" title={item.reason}>
                    {item.reason}
                  </p>
                </td>

                {/* Deal Value */}
                <td>
                  <strong className="text-success text-xs">
                    ₹{(item.dealValue || 0).toLocaleString()}
                  </strong>
                </td>

                {/* Staff */}
                <td>
                  <span className="text-xs text-dim font-medium">{item.assignedStaff}</span>
                </td>

                {/* Timeline */}
                <td>
                  {isOverdue ? (
                    <span className="text-[11px] text-danger font-bold flex items-center gap-1">
                      <AlertTriangle size={11} /> {item.overdueDuration || 'Overdue'}
                    </span>
                  ) : isDueToday ? (
                    <span className="text-[11px] text-warning font-semibold flex items-center gap-1">
                      <Clock size={11} /> {item.dueDate}
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  ) : (
                    <span className="text-[11px] text-dim">{item.dueDate}</span>
                  )}
                </td>

                {/* Actions */}
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-table-action"
                      title="WhatsApp Direct"
                    >
                      <MessageSquare size={12} className="text-success" />
                    </a>

                    <a
                      href={`tel:${item.phone}`}
                      className="btn-table-action"
                      title="Phone Call"
                    >
                      <Phone size={12} className="text-cyan" />
                    </a>

                    {!isCompleted && (
                      <>
                        <button
                          type="button"
                          className="btn-table-action complete"
                          onClick={() => onComplete && onComplete(item.id)}
                          title="Mark Complete"
                        >
                          <CheckCircle2 size={12} className="text-success" />
                        </button>

                        <button
                          type="button"
                          className="btn-table-action reschedule"
                          onClick={() => onReschedule && onReschedule(item)}
                          title="Reschedule"
                        >
                          <RotateCcw size={12} className="text-warning" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn-table-action view"
                      onClick={() => onOpenDetails && onOpenDetails(item)}
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FollowUpTable;
