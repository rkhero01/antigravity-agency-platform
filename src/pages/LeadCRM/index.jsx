import React, { useState, useEffect, useMemo } from 'react';
import {
  CRMHeader,
  CRMKpiCards,
  LeadPipeline,
  LeadTable,
  LeadDetailModal,
  AddLeadModal,
} from '../../components/crm/index.js';
import { crmService } from '../../services/crmService.js';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function LeadCRMPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pipeline' | 'leads'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Datasets
  const [overview, setOverview] = useState({});
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Active Selections
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [ov, ld] = await Promise.all([
        crmService.getCRMOverview(selectedClientFilter),
        crmService.getLeads({ clientId: selectedClientFilter }),
      ]);
      setOverview(ov);
      setLeads(ld);
    } catch (err) {
      console.error('Failed to load CRM data from PostgreSQL:', err);
      setError(
        err.message || 'Unable to retrieve leads from database. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : l.clientId === selectedClientFilter;
      const matchesStage =
        selectedStageFilter === 'all'
          ? true
          : (l.stage || '').toUpperCase() === selectedStageFilter.toUpperCase();
      const matchesSource =
        selectedSourceFilter === 'all'
          ? true
          : (l.source || '').toUpperCase() === selectedSourceFilter.toUpperCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.name || '').toLowerCase().includes(q) ||
        (l.company || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q) ||
        (l.clientName || '').toLowerCase().includes(q) ||
        (l.campaignName || '').toLowerCase().includes(q);

      return matchesClient && matchesStage && matchesSource && matchesSearch;
    });
  }, [leads, selectedClientFilter, selectedStageFilter, selectedSourceFilter, searchQuery]);

  // Handlers
  const handleAddLead = async (formData) => {
    const created = await crmService.createLead(formData);
    await loadAllData(true);
    showToast(`✨ Inbound lead "${created.name}" registered in CRM pipeline!`);
  };

  const handleDeleteLead = async (id) => {
    const target = leads.find((l) => l.id === id);
    const confirm = window.confirm(
      `Are you sure you want to archive lead "${target?.name || 'this lead'}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    try {
      await crmService.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadForDetail && selectedLeadForDetail.id === id) {
        setSelectedLeadForDetail(null);
      }
      showToast('Lead archived successfully.');
    } catch (err) {
      console.error('Failed to archive lead:', err);
      alert(err.message || 'Failed to archive lead.');
    }
  };

  const handleStatusChange = async (id, newStage) => {
    try {
      const updated = await crmService.updateLeadStatus(id, newStage);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (selectedLeadForDetail && selectedLeadForDetail.id === id) {
        setSelectedLeadForDetail(updated);
      }
      showToast(`✓ Lead stage moved to "${newStage}".`);
    } catch (err) {
      console.error('Failed to update lead stage:', err);
      alert(err.message || 'Failed to update lead stage.');
    }
  };

  return (
    <div className="crm-command-center-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
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
        onRefresh={() => loadAllData(true)}
        isRefreshing={isRefreshing}
      />

      {/* 7 KPI Metric Cards */}
      <CRMKpiCards overview={overview} />

      {/* Main Content Area */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">
            Loading CRM pipeline & inbound leads from PostgreSQL database...
          </p>
          <span className="clients-state-sub">
            Attributing ad channels, deal values & sales qualification stages
          </span>
        </div>
      ) : error ? (
        <div className="clients-state-box error" role="alert">
          <div className="state-icon-badge error">
            <AlertCircle size={28} />
          </div>
          <h3 className="clients-state-title">Database Connection Error</h3>
          <p className="clients-state-desc">{error}</p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => loadAllData(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : activeTab === 'overview' || activeTab === 'leads' ? (
        <div className="crm-table-view-section">
          <LeadTable
            leads={filteredLeads}
            onInspectLead={(l) => setSelectedLeadForDetail(l)}
            onEditLead={(l) => setSelectedLeadForDetail(l)}
            onDeleteLead={handleDeleteLead}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : (
        <div className="crm-pipeline-board-section">
          <LeadPipeline
            leads={filteredLeads}
            onInspectLead={(l) => setSelectedLeadForDetail(l)}
            onEditLead={(l) => setSelectedLeadForDetail(l)}
            onDeleteLead={handleDeleteLead}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateLead={handleAddLead}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        isOpen={Boolean(selectedLeadForDetail)}
        onClose={() => setSelectedLeadForDetail(null)}
        onStatusChange={handleStatusChange}
        onDeleteLead={handleDeleteLead}
      />
    </div>
  );
}

export default LeadCRMPage;
