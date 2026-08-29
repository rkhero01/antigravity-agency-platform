import React from 'react';
import { Radio, Plus } from 'lucide-react';
import { MentionCard } from './MentionCard.jsx';

export function MentionsFeedGrid({
  mentions = [],
  onAiReply,
  onOpenTrackModal,
}) {
  if (mentions.length === 0) {
    return (
      <div className="listening-empty-state-card">
        <Radio size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No brand mentions found</h4>
        <p className="empty-state-subtitle">Adjust your filter parameters or track new brand keywords and competitor handles.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenTrackModal}
        >
          <Plus size={15} />
          <span>Track New Keyword</span>
        </button>
      </div>
    );
  }

  // Calculate Sentiment Distribution Bar
  const total = mentions.length;
  const positive = mentions.filter((m) => m.sentiment === 'Positive').length;
  const neutral = mentions.filter((m) => m.sentiment === 'Neutral').length;
  const negative = mentions.filter((m) => m.sentiment === 'Negative').length;

  const posPct = Math.round((positive / total) * 100);
  const neuPct = Math.round((neutral / total) * 100);
  const negPct = 100 - posPct - neuPct;

  return (
    <div className="mentions-feed-container">
      {/* Sentiment Overview Bar */}
      <div className="sentiment-overview-card">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white font-semibold">Live Brand Sentiment Index</span>
          <span className="text-xs text-muted">{total} Live Mentions Streamed</span>
        </div>

        <div className="sentiment-distribution-bar">
          <div className="sentiment-segment positive" style={{ width: `${posPct}%` }} title={`Positive: ${posPct}%`} />
          <div className="sentiment-segment neutral" style={{ width: `${neuPct}%` }} title={`Neutral: ${neuPct}%`} />
          <div className="sentiment-segment negative" style={{ width: `${negPct}%` }} title={`Negative: ${negPct}%`} />
        </div>

        <div className="sentiment-legend-row mt-2">
          <span className="text-xs text-success">🟢 Positive ({posPct}%)</span>
          <span className="text-xs text-muted">⚪ Neutral ({neuPct}%)</span>
          <span className="text-xs text-danger">🔴 Negative ({negPct}%)</span>
        </div>
      </div>

      {/* Mentions Stream */}
      <div className="mentions-cards-list">
        {mentions.map((mention) => (
          <MentionCard
            key={mention.id}
            mention={mention}
            onAiReply={onAiReply}
          />
        ))}
      </div>
    </div>
  );
}

export default MentionsFeedGrid;
