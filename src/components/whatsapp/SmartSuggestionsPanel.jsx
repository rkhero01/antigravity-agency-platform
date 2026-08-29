import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Phone,
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function SmartSuggestionsPanel({
  onQuickAction,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    const data = await whatsappService.getFollowUpSuggestions();
    setSuggestions(data);
    setLoading(false);
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="wa-smart-suggestions-card">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="smart-ai-badge-icon">
            <Sparkles size={14} className="text-warning" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Smart Follow-up Recommendations
            </h4>
            <p className="text-[11px] text-muted">
              High-impact touchpoints prioritized by lead score, deal velocity, and response probability
            </p>
          </div>
        </div>
        <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          3 High-Impact Opportunities
        </span>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((sug) => (
          <div key={sug.id} className="suggestion-item-box">
            <div className="flex justify-between items-start mb-1.5">
              <strong className="text-xs text-white font-bold truncate" title={sug.customerName}>
                {sug.customerName}
              </strong>
              <span className="text-xs text-success font-bold">
                ₹{(sug.dealValue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-[11px]">
              <span className="text-warning font-semibold flex items-center gap-1">
                <Clock size={11} /> {sug.recommendedTime}
              </span>
              <span className="text-dim">•</span>
              <span className="text-cyan font-medium">{sug.recommendedChannel}</span>
            </div>

            <p className="suggestion-reason-text">{sug.reason}</p>

            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
              <span className="text-[10px] text-pink font-bold bg-pink-500/10 px-1.5 py-0.5 rounded">
                ⚡ {sug.priority} Priority
              </span>
              <button
                type="button"
                className="btn-trigger-suggestion"
                onClick={() => onQuickAction && onQuickAction(sug)}
              >
                <span>Take Action</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartSuggestionsPanel;
