import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendHeader,
  TrendKpiCards,
  TrendingAudioGrid,
  HashtagExplorerTab,
  TopicForecastsTab,
  SaveHashtagSetModal,
  AIHashtagGeneratorModal,
} from '../../components/trends/index.js';
import { trendService } from '../../services/trendService.js';
import { CheckCircle2 } from 'lucide-react';

export function TrendDiscoveryPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [audios, setAudios] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [savedSets, setSavedSets] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState('audio'); // 'audio' | 'hashtags' | 'forecasts'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedClientFilter]);

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
    const [audioData, hashData, setsData, forecastData] = await Promise.all([
      trendService.getAudios(),
      trendService.getHashtags(),
      trendService.getSavedSets(selectedClientFilter),
      trendService.getTopicForecasts(selectedClientFilter),
    ]);
    setAudios(audioData);
    setHashtags(hashData);
    setSavedSets(setsData);
    setForecasts(forecastData);
    setLoading(false);
  };

  // Filtered Audios
  const filteredAudios = useMemo(() => {
    return audios.filter((a) => {
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : a.platform.toLowerCase().includes(selectedPlatform.toLowerCase());
      const matchesSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.genre.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPlatform && matchesSearch;
    });
  }, [audios, selectedPlatform, searchQuery]);

  // Filtered Hashtags
  const filteredHashtags = useMemo(() => {
    return hashtags.filter((h) => {
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : h.platform.toLowerCase().includes(selectedPlatform.toLowerCase());
      const matchesSearch =
        !searchQuery.trim() || h.tag.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPlatform && matchesSearch;
    });
  }, [hashtags, selectedPlatform, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return trendService.calculateTrendMetrics(
      filteredAudios,
      filteredHashtags,
      savedSets,
      forecasts
    );
  }, [filteredAudios, filteredHashtags, savedSets, forecasts]);

  // Handlers
  const handleSaveSet = async (formData) => {
    const created = await trendService.saveHashtagSet(formData);
    setSavedSets((prev) => [created, ...prev]);
    showToast(`✨ Saved hashtag set "${created.name}" (${created.tagsCount} tags)!`);
  };

  const handleDeleteSet = async (id) => {
    await trendService.deleteHashtagSet(id);
    setSavedSets((prev) => prev.filter((s) => s.id !== id));
    showToast('Hashtag bundle deleted.');
  };

  return (
    <div className="trend-discovery-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <TrendHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSaveSetModal={() => setIsSaveModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <TrendKpiCards metrics={metrics} />

      {/* 3 Interactive Tab Views */}
      {activeTab === 'audio' && (
        <TrendingAudioGrid audios={filteredAudios} />
      )}

      {activeTab === 'hashtags' && (
        <HashtagExplorerTab
          hashtags={filteredHashtags}
          savedSets={savedSets}
          onDeleteSet={handleDeleteSet}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
        />
      )}

      {activeTab === 'forecasts' && (
        <TopicForecastsTab forecasts={forecasts} />
      )}

      {/* Save Hashtag Set Modal */}
      <SaveHashtagSetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveSet={handleSaveSet}
      />

      {/* AI Hashtag Generator Modal */}
      <AIHashtagGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSaveGeneratedSet={handleSaveSet}
      />
    </div>
  );
}

export default TrendDiscoveryPage;
