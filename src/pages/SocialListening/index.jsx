import React, { useState, useEffect, useMemo } from 'react';
import {
  ListeningHeader,
  ListeningKpiCards,
  MentionsFeedGrid,
  CrisisAlertsTab,
  TrackKeywordModal,
  AICrisisResponseModal,
} from '../../components/listening/index.js';
import { listeningService } from '../../services/listeningService.js';
import { CheckCircle2 } from 'lucide-react';

export function SocialListeningPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [mentions, setMentions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'alerts'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [activeAlertForAI, setActiveAlertForAI] = useState(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const [mentionsData, alertsData] = await Promise.all([
      listeningService.getMentions(),
      listeningService.getAlerts(),
    ]);
    setMentions(mentionsData);
    setAlerts(alertsData);
    setLoading(false);
  };

  // Filtered Mentions
  const filteredMentions = useMemo(() => {
    return mentions.filter((m) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : m.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : m.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesSentiment =
        selectedSentiment === 'all'
          ? true
          : m.sentiment.toLowerCase() === selectedSentiment.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.clientName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesSentiment && matchesSearch;
    });
  }, [mentions, selectedClientFilter, selectedPlatform, selectedSentiment, searchQuery]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedClientFilter === 'all') return true;
      return a.clientId === selectedClientFilter;
    });
  }, [alerts, selectedClientFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return listeningService.calculateListeningMetrics(filteredMentions);
  }, [filteredMentions]);

  // Handlers
  const handleAddMention = async (formData) => {
    const created = await listeningService.addMention(formData);
    setMentions((prev) => [created, ...prev]);
    showToast(`✨ Mention from "${created.author}" indexed to stream!`);
  };

  const handleResolveAlert = async (alertId) => {
    await listeningService.resolveAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('✓ Alert resolved and moved to PR archive.');
  };

  const handleAiReply = (mention) => {
    setActiveAlertForAI({
      title: `${mention.clientName} - Discussion on ${mention.platform} regarding #${mention.topic}`,
      clientName: mention.clientName,
    });
    setIsAIModalOpen(true);
  };

  return (
    <div className="social-listening-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <ListeningHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedSentiment={selectedSentiment}
        onSentimentChange={setSelectedSentiment}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenAIModal={() => {
          setActiveAlertForAI(null);
          setIsAIModalOpen(true);
        }}
      />

      {/* 5 KPI Metric Cards */}
      <ListeningKpiCards metrics={metrics} />

      {/* Main Content: Feed vs Alerts */}
      {viewMode === 'feed' ? (
        <MentionsFeedGrid
          mentions={filteredMentions}
          onAiReply={handleAiReply}
          onOpenTrackModal={() => setIsTrackModalOpen(true)}
        />
      ) : (
        <CrisisAlertsTab
          alerts={filteredAlerts}
          onResolveAlert={handleResolveAlert}
          onOpenAIDialog={(alert) => {
            setActiveAlertForAI(alert);
            setIsAIModalOpen(true);
          }}
        />
      )}

      {/* Track Keyword Modal */}
      <TrackKeywordModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onAddMention={handleAddMention}
      />

      {/* AI Crisis PR Mitigation Modal */}
      <AICrisisResponseModal
        alert={activeAlertForAI}
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setActiveAlertForAI(null);
        }}
      />
    </div>
  );
}

export default SocialListeningPage;
