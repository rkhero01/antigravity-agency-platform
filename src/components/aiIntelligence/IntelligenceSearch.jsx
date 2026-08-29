import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Sparkles,
  Building,
  Zap,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  UserCheck,
  Megaphone,
  BarChart3,
  Calendar,
  MessageSquare,
  Repeat,
} from 'lucide-react';
import { aiIntelligenceService } from '../../services/aiIntelligenceService.js';

export function IntelligenceSearch({
  onSelectResult,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    clients: [],
    leads: [],
    campaigns: [],
    channels: [],
    insights: [],
    recommendations: [],
    anomalies: [],
    followUps: [],
    templates: [],
    automations: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (!val.trim()) {
      setResults({
        clients: [],
        leads: [],
        campaigns: [],
        channels: [],
        insights: [],
        recommendations: [],
        anomalies: [],
        followUps: [],
        templates: [],
        automations: [],
      });
      setIsOpen(false);
      return;
    }

    const res = await aiIntelligenceService.searchIntelligence(val);
    setResults(res);
    setIsOpen(true);
  };

  const totalResults =
    (results.clients?.length || 0) +
    (results.leads?.length || 0) +
    (results.campaigns?.length || 0) +
    (results.channels?.length || 0) +
    (results.insights?.length || 0) +
    (results.recommendations?.length || 0) +
    (results.anomalies?.length || 0) +
    (results.followUps?.length || 0) +
    (results.templates?.length || 0) +
    (results.automations?.length || 0);

  return (
    <div className="intelligence-global-search-wrap" ref={searchRef}>
      <div className="intelligence-search-input-box">
        <Search size={14} className="text-dim" />
        <input
          type="text"
          placeholder="Universal AI Search (Clients, Leads, Campaigns, Playbooks, Anomalies)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="intelligence-global-search-input"
        />
        {query && (
          <button
            type="button"
            className="text-dim hover:text-white"
            onClick={() => handleSearch('')}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Floating Results Popup */}
      {isOpen && query.trim() && (
        <div className="intelligence-search-results-dropdown">
          <div className="search-dropdown-header">
            <span className="text-[11px] font-bold text-dim uppercase">
              {totalResults} Cross-Module Intelligence Matches
            </span>
          </div>

          {totalResults === 0 ? (
            <div className="p-4 text-center text-xs text-muted">
              No matching intelligence entities found for "{query}".
            </div>
          ) : (
            <div className="search-results-scroll space-y-3 p-2">
              {/* Clients */}
              {results.clients?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-cyan">
                    <Building size={11} /> <span>Clients ({results.clients.length})</span>
                  </div>
                  {results.clients.map((c) => (
                    <div
                      key={c.clientId}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'CLIENT', data: c });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{c.clientName}</strong>
                      <span className="text-[11px] text-dim">{c.industry} • Health: {c.healthScore}% • {c.topChannel}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Leads */}
              {results.leads?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-emerald-400">
                    <UserCheck size={11} /> <span>CRM Leads ({results.leads.length})</span>
                  </div>
                  {results.leads.map((l, i) => (
                    <div
                      key={l.id || i}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'LEAD', data: l });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{l.name} ({l.company || 'Direct'})</strong>
                      <span className="text-[11px] text-dim">Stage: {l.status} • Value: ₹{(l.value || 0).toLocaleString()} • Score: {l.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Campaigns */}
              {results.campaigns?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-pink">
                    <Megaphone size={11} /> <span>Marketing Campaigns ({results.campaigns.length})</span>
                  </div>
                  {results.campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'CAMPAIGN', data: camp });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{camp.name}</strong>
                      <span className="text-[11px] text-dim">{camp.channel} • {camp.clientName} • ROAS: {camp.roas}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights */}
              {results.insights?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-warning">
                    <Sparkles size={11} /> <span>AI Strategic Insights ({results.insights.length})</span>
                  </div>
                  {results.insights.map((ins) => (
                    <div
                      key={ins.id}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'INSIGHT', data: ins });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`ai-priority-badge ${ins.priority.toLowerCase()}`}>{ins.priority}</span>
                        <strong className="text-white text-xs truncate">{ins.title}</strong>
                      </div>
                      <span className="text-[11px] text-dim truncate block">{ins.summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-primary">
                    <Zap size={11} /> <span>Growth Playbooks ({results.recommendations.length})</span>
                  </div>
                  {results.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'RECOMMENDATION', data: rec });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{rec.title}</strong>
                      <span className="text-[11px] text-dim truncate block">{rec.recommendation}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Anomalies */}
              {results.anomalies?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-danger">
                    <AlertTriangle size={11} /> <span>Detected Outliers ({results.anomalies.length})</span>
                  </div>
                  {results.anomalies.map((a) => (
                    <div
                      key={a.id}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'ANOMALY', data: a });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{a.anomalyType} ({a.clientName})</strong>
                      <span className="text-[11px] text-danger">{a.metric}: {a.currentValue} ({a.deviation})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-ups */}
              {results.followUps?.length > 0 && (
                <div className="search-result-group">
                  <div className="search-group-title text-cyan">
                    <Calendar size={11} /> <span>Follow-Up Tasks ({results.followUps.length})</span>
                  </div>
                  {results.followUps.map((f, i) => (
                    <div
                      key={f.id || i}
                      className="search-result-item"
                      onClick={() => {
                        if (onSelectResult) onSelectResult({ type: 'FOLLOWUP', data: f });
                        setIsOpen(false);
                      }}
                    >
                      <strong className="text-white text-xs block">{f.contactName} ({f.statusCategory || 'Pending'})</strong>
                      <span className="text-[11px] text-dim">{f.reason || 'Follow-up call'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IntelligenceSearch;
