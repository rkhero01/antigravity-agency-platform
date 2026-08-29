import React, { useState, useEffect, useMemo } from 'react';
import {
  EmailHeader,
  EmailKpiCards,
  EmailCampaignsGrid,
  AutomatedFlowsTab,
  EmailPreviewModal,
  CreateBroadcastModal,
  AIEmailCopyModal,
} from '../../components/email/index.js';
import { emailMarketingService } from '../../services/emailMarketingService.js';
import { CheckCircle2 } from 'lucide-react';

export function EmailMarketingPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('campaigns'); // 'campaigns' | 'flows'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [inspectedCampaign, setInspectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    const [camps, autos] = await Promise.all([
      emailMarketingService.getCampaigns(),
      emailMarketingService.getAutomations(),
    ]);
    setCampaigns(camps);
    setAutomations(autos);
    setLoading(false);
  };

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesType =
        selectedType === 'all'
          ? true
          : selectedType === 'Email'
          ? c.type.includes('Email')
          : c.type.includes('SMS');
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.segment.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesType && matchesStatus && matchesSearch;
    });
  }, [campaigns, selectedClientFilter, selectedType, selectedStatus, searchQuery]);

  // Filtered Automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((a) => {
      if (selectedClientFilter === 'all') return true;
      return a.clientId === selectedClientFilter;
    });
  }, [automations, selectedClientFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return emailMarketingService.calculateEmailMetrics(filteredCampaigns);
  }, [filteredCampaigns]);

  // Handlers
  const handleCreateCampaign = async (formData) => {
    const created = await emailMarketingService.createCampaign(formData);
    setCampaigns((prev) => [created, ...prev]);
    showToast(`✨ Created and scheduled broadcast "${created.title}"!`);
  };

  const handleDeleteCampaign = async (id) => {
    await emailMarketingService.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Broadcast removed from campaign queue.');
  };

  const handleToggleFlowStatus = async (id) => {
    await emailMarketingService.toggleAutomationStatus(id);
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' } : a))
    );
    showToast('Updated automated flow lifecycle status.');
  };

  return (
    <div className="email-marketing-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <EmailHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <EmailKpiCards metrics={metrics} />

      {/* Main Content: Broadcasts vs Automated Flows */}
      {viewMode === 'campaigns' ? (
        <EmailCampaignsGrid
          campaigns={filteredCampaigns}
          onInspect={setInspectedCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <AutomatedFlowsTab
          automations={filteredAutomations}
          onToggleStatus={handleToggleFlowStatus}
        />
      )}

      {/* Email / SMS Multi-Device Preview Modal */}
      <EmailPreviewModal
        campaign={inspectedCampaign}
        isOpen={Boolean(inspectedCampaign)}
        onClose={() => setInspectedCampaign(null)}
      />

      {/* Create Broadcast Modal */}
      <CreateBroadcastModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* AI Copy Studio Modal */}
      <AIEmailCopyModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}

export default EmailMarketingPage;
