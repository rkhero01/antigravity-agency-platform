import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, CheckCircle2, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { competitorService } from '../../services/competitorService.js';

export function AIGapAnalysisModal({
  selectedClient = 'c1',
  isOpen,
  onClose,
}) {
  const [gapData, setGapData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      competitorService.getGapAnalysis(selectedClient).then((data) => {
        setGapData(data);
      });
    }
  }, [isOpen, selectedClient]);

  if (!isOpen || !gapData) return null;

  const handleCopyStrategy = () => {
    const summary = `AI COMPETITOR GAP & COUNTER-STRATEGY REPORT\nClient: ${gapData.clientName}\nMarket Share of Voice: ${gapData.marketShareOfVoice}\nClient Engagement Rate: ${gapData.clientEngagementRate} (vs Competitor Avg: ${gapData.competitorAvgEngagement})\n\nVulnerabilities & Counter-Campaigns:\n` +
      gapData.vulnerabilitiesIdentified.map((v, i) => `${i + 1}. ${v.title}\n- Weakness: ${v.weakness}\n- Recommended Action: ${v.recommendedCounter}\n`).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-gap-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Competitor Gap & Vulnerability Radar</h3>
              <p className="modal-subtitle">Strategic counter-positioning opportunities for {gapData.clientName}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-gap-body">
          {/* Top Metrics Row */}
          <div className="gap-kpis-two-col">
            <div className="gap-kpi-box">
              <span className="gk-lbl">Client Share of Voice</span>
              <strong className="gk-val text-primary">{gapData.marketShareOfVoice}</strong>
              <span className="gk-sub">Category social impressions</span>
            </div>

            <div className="gap-kpi-box">
              <span className="gk-lbl">Engagement Advantage</span>
              <div className="gk-delta-row">
                <strong className="gk-val text-success">{gapData.clientEngagementRate}</strong>
                <span className="gk-vs-text">vs Rival Avg: {gapData.competitorAvgEngagement}</span>
              </div>
              <span className="gk-sub text-success">+2.4% Higher Community Engagement</span>
            </div>
          </div>

          {/* Vulnerabilities & Counter Briefs */}
          <div className="vulnerabilities-list">
            <h4 className="vulnerabilities-heading">
              <Lightbulb size={15} className="text-warning" />
              <span>Detected Competitor Weaknesses & Counter-Campaign Briefs</span>
            </h4>

            {gapData.vulnerabilitiesIdentified.map((v, idx) => (
              <div key={idx} className="vulnerability-card">
                <h5 className="vuln-title">{idx + 1}. {v.title}</h5>

                <div className="vuln-weakness-box">
                  <span className="v-tag negative">Observed Weakness:</span>
                  <p className="v-desc">{v.weakness}</p>
                </div>

                <div className="vuln-counter-box">
                  <span className="v-tag positive">Recommended Counter-Campaign:</span>
                  <p className="v-desc">{v.recommendedCounter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-primary" onClick={handleCopyStrategy}>
            {copied ? (
              <>
                <CheckCircle2 size={15} />
                <span>Strategy Brief Copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy Counter-Strategy Brief</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIGapAnalysisModal;
