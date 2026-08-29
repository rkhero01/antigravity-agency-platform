import React, { useState, useEffect, useMemo } from 'react';
import {
  CRMHeader,
  CRMKpiCards,
  LeadPipeline,
  LeadTable,
  LeadDetailModal,
  LeadScoreModal,
  FollowUpsTab,
  ActivityTimeline,
  SourceAnalytics,
  AIAssistantModal,
  AddLeadModal,
  ImportLeadsModal,
  CRMReportModal,
} from '../../components/crm/index.js';
import { crmService } from '../../services/crmService.js';
import { CheckCircle2 } from 'lucide-react';

export function LeadCRMPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pipeline' | 'leads' | 'follow-ups' | 'sources' | 'activity'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [searchQuery, setSearchQuery] = useState('');

  // Table Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Datasets
  const [overview, setOverview] = useState({});
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Active Selections
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [selectedLeadForScore, setSelectedLeadForScore] = useState(null);
  const [selectedLeadForAI, setSelectedLeadForAI] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
    const [ov, ld, fu, act, src] = await Promise.all([
      crmService.getCRMOverview(selectedClientFilter),
      crmService.getLeads({ clientId: selectedClientFilter }),
      crmService.getFollowUps(selectedClientFilter),
      crmService.getActivities(selectedClientFilter),
      crmService.getSourceAnalytics(selectedClientFilter),
    ]);
    setOverview(ov);
    setLeads(ld);
    setFollowUps(fu);
    setActivities(act);
    setSources(src);
    setLoading(false);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : l.clientId === selectedClientFilter;
      const matchesSource =
        sourceFilter === 'all' ? true : l.source.toLowerCase() === sourceFilter.toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ? true : l.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesStaff =
        staffFilter === 'all' ? true : l.assignedStaff.toLowerCase() === staffFilter.toLowerCase();
      const matchesPriority =
        priorityFilter === 'all' ? true : l.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.campaign.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesSource && matchesStatus && matchesStaff && matchesPriority && matchesSearch;
    });
  }, [leads, selectedClientFilter, sourceFilter, statusFilter, staffFilter, priorityFilter, searchQuery]);

  // Handlers
  const handleAddLead = async (formData) => {
    const created = await crmService.addLead(formData);
    setLeads((prev) => [created, ...prev]);
    showToast(`✨ Inbound lead "${created.name}" registered & scored!`);
  };

  const handleDeleteLead = async (id) => {
    await crmService.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showToast('Lead removed from CRM pipeline.');
  };

  const handleMoveStatus = async (id, newStatus) => {
    await crmService.updateLeadStatus(id, newStatus);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, lastActivity: `Moved to ${newStatus} (Just now)` } : l))
    );
    showToast(`✓ Lead stage updated to "${newStatus}".`);
  };

  const handleAssignStaff = async (id, staffName) => {
    await crmService.assignLead(id, staffName);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, assignedStaff: staffName } : l))
    );
    showToast(`✓ Reassigned lead to ${staffName}.`);
  };

  const handleCompleteFollowUp = async (id) => {
    await crmService.completeFollowUp(id);
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
    showToast('✓ Sales follow-up marked as completed!');
  };

  const handleRescheduleFollowUp = async (id, newDate) => {
    await crmService.rescheduleFollowUp(id, newDate);
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, dateTime: newDate, statusCategory: 'Upcoming' } : f))
    );
    showToast(`✓ Rescheduled follow-up to ${newDate}.`);
  };

  const handleOpenLeadById = (leadId) => {
    const target = leads.find((l) => l.id === leadId);
    if (target) setSelectedLeadForDetail(target);
  };

  return (
    <div className="crm-command-center-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <CRMHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAIModal={() => {
          setSelectedLeadForAI(null);
          setIsAIModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 8 KPI Cards */}
      <CRMKpiCards overview={overview} />

      {/* Main View Area */}
      <div className="crm-main-view-area">
        {activeTab === 'overview' && (
          <div className="crm-overview-layout">
            <div className="overview-section-header">
              <h3 className="section-title-clean">Active Deal Pipeline Overview</h3>
              <button
                type="button"
                className="btn-view-all-sub"
                onClick={() => setActiveTab('pipeline')}
              >
                Open Full Kanban Board →
              </button>
            </div>
            <LeadPipeline
              leads={filteredLeads}
              onOpenDetails={setSelectedLeadForDetail}
              onOpenScoreModal={setSelectedLeadForScore}
              onMoveStatus={handleMoveStatus}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <LeadPipeline
            leads={filteredLeads}
            onOpenDetails={setSelectedLeadForDetail}
            onOpenScoreModal={setSelectedLeadForScore}
            onMoveStatus={handleMoveStatus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'leads' && (
          <LeadTable
            leads={filteredLeads}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            staffFilter={staffFilter}
            onStaffFilterChange={setStaffFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            onOpenDetails={setSelectedLeadForDetail}
            onOpenScoreModal={setSelectedLeadForScore}
            onMoveStatus={handleMoveStatus}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {activeTab === 'follow-ups' && (
          <FollowUpsTab
            followUps={followUps}
            onComplete={handleCompleteFollowUp}
            onReschedule={handleRescheduleFollowUp}
            onOpenLead={handleOpenLeadById}
          />
        )}

        {activeTab === 'sources' && (
          <SourceAnalytics
            sources={sources}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTimeline
            activities={activities}
            onOpenLead={handleOpenLeadById}
          />
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        isOpen={Boolean(selectedLeadForDetail)}
        onClose={() => setSelectedLeadForDetail(null)}
        onUpdateStatus={handleMoveStatus}
        onAssignStaff={handleAssignStaff}
      />

      {/* AI Lead Scoring Diagnostics Modal */}
      <LeadScoreModal
        lead={selectedLeadForScore}
        isOpen={Boolean(selectedLeadForScore)}
        onClose={() => setSelectedLeadForScore(null)}
        onUpdateScore={(id, updated) => {
          setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
        }}
      />

      {/* AI Sales Co-Pilot Modal */}
      <AIAssistantModal
        lead={selectedLeadForAI}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        allLeads={leads}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />

      {/* Import Leads Modal */}
      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={loadAllData}
      />

      {/* CRM Executive Report Modal */}
      <CRMReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedClient={selectedClientFilter}
      />
    </div>
  );
}

export default LeadCRMPage;
