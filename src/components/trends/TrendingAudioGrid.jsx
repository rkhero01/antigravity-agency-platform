import React, { useState } from 'react';
import { Music, Play, CheckCircle2, Copy, TrendingUp, Flame, Volume2 } from 'lucide-react';

export function TrendingAudioGrid({ audios = [] }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (audio) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(audio.audioUrl).catch(() => {});
    }
    setCopiedId(audio.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  if (audios.length === 0) {
    return (
      <div className="trends-empty-state-card">
        <Music size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No trending audio tracks found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or search for a different genre.</p>
      </div>
    );
  }

  return (
    <div className="trending-audio-pane">
      <div className="audio-pane-header">
        <div>
          <h3 className="section-title">Breakout Audio & Sound Wave Radar</h3>
          <p className="section-desc">Rising audio tracks with surging viral velocity on TikTok & Instagram Reels</p>
        </div>
        <span className="audio-live-chip">● Live Audio Scraper Active</span>
      </div>

      <div className="audio-cards-grid">
        {audios.map((audio) => (
          <div key={audio.id} className="audio-card-item">
            {/* Top Row */}
            <div className="audio-card-top">
              <div className="audio-icon-avatar">
                <Music size={20} />
              </div>
              <div className="audio-title-group">
                <strong className="audio-track-title">{audio.title}</strong>
                <span className="audio-artist-name">By {audio.artist} • {audio.duration}</span>
              </div>
              <span className="audio-stage-badge">
                <Flame size={12} className="inline-icon text-warning" />
                {audio.trendStage}
              </span>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="audio-waveform-container">
              <div className="waveform-bars">
                {[40, 65, 85, 30, 90, 75, 45, 100, 60, 80, 50, 95, 70, 85, 40, 90, 65, 55, 75, 100, 60, 45, 80, 30].map((h, i) => (
                  <span
                    key={i}
                    className="wave-bar"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Meta Stats Row */}
            <div className="audio-metrics-row">
              <div className="am-stat">
                <span className="am-lbl">Reels & Videos:</span>
                <strong className="am-val">{audio.videoCount}</strong>
              </div>
              <div className="am-stat">
                <span className="am-lbl">Velocity Spike:</span>
                <strong className="am-val text-success">{audio.velocity}</strong>
              </div>
              <div className="am-stat">
                <span className="am-lbl">Genre:</span>
                <span className="am-genre-pill">{audio.genre}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="audio-card-footer">
              <span className="audio-client-recom">🎯 Best for: {audio.recommendedFor}</span>

              <button
                type="button"
                className="btn-copy-audio-link"
                onClick={() => handleCopyLink(audio)}
              >
                {copiedId === audio.id ? (
                  <>
                    <CheckCircle2 size={13} className="text-success" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Sound Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingAudioGrid;
