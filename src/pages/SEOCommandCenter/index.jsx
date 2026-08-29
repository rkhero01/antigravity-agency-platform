import React, { useState, useEffect, useMemo } from 'react';
import {
  SEOHeader,
  SEOKpiCards,
  KeywordRankingsTab,
  SEOAuditTab,
  ContentGapTab,
  BacklinksTab,
  LocalSEOTab,
  OnPageOptimizerModal,
  AIContentBriefModal,
  AIStrategyModal,
  SEOReportModal,
  AddKeywordModal,
} from '../../components/seo/index.js';
import { seoService } from '../../services/seoService.js';
import { CheckCircle2 } from 'lucide-react';

export function SEOCommandCenterPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'keywords' | 'audit' | 'content-gap' | 'backlinks' | 'local-seo'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [searchQuery, setSearchQuery] = useState('');

  // Table Filters
  const [intentFilter, setIntentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [posRangeFilter, setPosRangeFilter] = useState('all');

  // Datasets
  const [overview, setOverview] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [auditIssues, setAuditIssues] = useState([]);
  const [contentGaps, setContentGaps] = useState([]);
  const [backlinks, setBacklinks] = useState([]);
  const [localSEO, setLocalSEO] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  // Modals & Feedback
  const [isAddKeywordModalOpen, setIsAddKeywordModalOpen] = useState(false);
  const [isOnPageOptimizerOpen, setIsOnPageOptimizerOpen] = useState(false);
  const [isAIBriefModalOpen, setIsAIBriefModalOpen] = useState(false);
  const [isAIStrategyModalOpen, setIsAIStrategyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [briefInitialKeyword, setBriefInitialKeyword] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadAllData();
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

  const loadAllData = async () => {
    setLoading(true);
    const [ov, kw, aud, gaps, bl, loc] = await Promise.all([
      seoService.getSEOOverview(selectedClientFilter),
      seoService.getKeywords({ clientId: selectedClientFilter }),
      seoService.getAudit(selectedClientFilter),
      seoService.getContentGaps(selectedClientFilter),
      seoService.getBacklinks(selectedClientFilter),
      seoService.getLocalSEO(selectedClientFilter),
    ]);
    setOverview(ov);
    setKeywords(kw);
    setAuditIssues(aud);
    setContentGaps(gaps);
    setBacklinks(bl);
    setLocalSEO(loc);
    setLoading(false);
  };

  // Filtered Keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter((k) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : k.clientId === selectedClientFilter;
      const matchesIntent =
        intentFilter === 'all' ? true : k.intent.toLowerCase() === intentFilter.toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ? true : k.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPos =
        posRangeFilter === 'all'
          ? true
          : posRangeFilter === 'top3'
          ? k.position >= 1 && k.position <= 3
          : posRangeFilter === 'top10'
          ? k.position >= 1 && k.position <= 10
          : k.position >= 11 && k.position <= 20;
      const matchesSearch =
        !searchQuery.trim() ||
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.url.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesIntent && matchesStatus && matchesPos && matchesSearch;
    });
  }, [keywords, selectedClientFilter, intentFilter, statusFilter, posRangeFilter, searchQuery]);

  // Handlers
  const handleAddKeyword = async (formData) => {
    const created = await seoService.addKeyword(formData);
    setKeywords((prev) => [created, ...prev]);
    showToast(`✨ Now tracking "${created.keyword}" in SERP radar!`);
  };

  const handleDeleteKeyword = async (id) => {
    await seoService.deleteKeyword(id);
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    showToast('Keyword removed from tracking radar.');
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    showToast('🚀 Crawling sitemaps and evaluating Core Web Vitals...');
    const result = await seoService.runAudit(selectedClientFilter);
    setTimeout(() => {
      setIsAuditing(false);
      showToast(`✓ Crawl finished! Health score updated to ${result.healthScore}/100.`);
    }, 1200);
  };

  const handleResolveIssue = (id) => {
    setAuditIssues((prev) => prev.filter((i) => i.id !== id));
    showToast('✓ Technical issue verified & resolved.');
  };

  const handleSyncLocation = (id) => {
    showToast('✓ Synced with Google Business Profile & Apple Maps.');
  };

  const handleOpenBriefWithKeyword = (gap) => {
    setBriefInitialKeyword(gap.keyword);
    setIsAIBriefModalOpen(true);
  };

  return (
    <div className="seo-command-center-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <SEOHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddKeywordModal={() => setIsAddKeywordModalOpen(true)}
        onRunAudit={handleRunAudit}
        onOpenAIStrategyModal={() => setIsAIStrategyModalOpen(true)}
        onOpenOnPageOptimizer={() => setIsOnPageOptimizerOpen(true)}
        onOpenAIBriefModal={() => {
          setBriefInitialKeyword('Contrast Therapy Protocols');
          setIsAIBriefModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isAuditing={isAuditing}
      />

      {/* 8 KPI Cards (Always visible on overview or as summary) */}
      <SEOKpiCards overview={overview} />

      {/* Main Views Container */}
      <div className="seo-main-view-area">
        {activeTab === 'overview' && (
          <div className="seo-overview-layout">
            <div className="overview-section-header">
              <h3 className="section-title-clean">Top Moving Target Keywords</h3>
              <button
                type="button"
                className="btn-view-all-sub"
                onClick={() => setActiveTab('keywords')}
              >
                View Full Keyword Radar →
              </button>
            </div>
            <KeywordRankingsTab
              keywords={filteredKeywords.slice(0, 10)}
              intentFilter={intentFilter}
              onIntentFilterChange={setIntentFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              posRangeFilter={posRangeFilter}
              onPosRangeFilterChange={setPosRangeFilter}
              onDeleteKeyword={handleDeleteKeyword}
              onOpenAddKeywordModal={() => setIsAddKeywordModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'keywords' && (
          <KeywordRankingsTab
            keywords={filteredKeywords}
            intentFilter={intentFilter}
            onIntentFilterChange={setIntentFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            posRangeFilter={posRangeFilter}
            onPosRangeFilterChange={setPosRangeFilter}
            onDeleteKeyword={handleDeleteKeyword}
            onOpenAddKeywordModal={() => setIsAddKeywordModalOpen(true)}
          />
        )}

        {activeTab === 'audit' && (
          <SEOAuditTab
            issues={auditIssues}
            onRunAudit={handleRunAudit}
            isAuditing={isAuditing}
            onResolveIssue={handleResolveIssue}
          />
        )}

        {activeTab === 'content-gap' && (
          <ContentGapTab
            gaps={contentGaps}
            onOpenBriefWithKeyword={handleOpenBriefWithKeyword}
          />
        )}

        {activeTab === 'backlinks' && (
          <BacklinksTab
            backlinks={backlinks}
          />
        )}

        {activeTab === 'local-seo' && (
          <LocalSEOTab
            locations={localSEO}
            onSyncLocation={handleSyncLocation}
          />
        )}
      </div>

      {/* On-Page Optimizer Modal */}
      <OnPageOptimizerModal
        isOpen={isOnPageOptimizerOpen}
        onClose={() => setIsOnPageOptimizerOpen(false)}
      />

      {/* AI Content Brief Modal */}
      <AIContentBriefModal
        isOpen={isAIBriefModalOpen}
        onClose={() => setIsAIBriefModalOpen(false)}
        initialKeyword={briefInitialKeyword}
      />

      {/* AI Strategy Modal */}
      <AIStrategyModal
        isOpen={isAIStrategyModalOpen}
        onClose={() => setIsAIStrategyModalOpen(false)}
        selectedClient={selectedClientFilter}
      />

      {/* SEO Report Modal */}
      <SEOReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedClient={selectedClientFilter}
      />

      {/* Add Keyword Modal */}
      <AddKeywordModal
        isOpen={isAddKeywordModalOpen}
        onClose={() => setIsAddKeywordModalOpen(false)}
        onAddKeyword={handleAddKeyword}
      />
    </div>
  );
}

export default SEOCommandCenterPage;
