import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Inbox,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AutomationMetrics } from './AutomationMetrics.jsx';
import { AutomationFilters } from './AutomationFilters.jsx';
import { AutomationCard } from './AutomationCard.jsx';
import { AutomationDetailModal } from './AutomationDetailModal.jsx';
import { CreateAutomationModal } from './CreateAutomationModal.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function AutomationsTab({
  selectedClient = 'all',
  searchQuery = '',
  onSearchChange,
  clients = whatsappClients,
}) {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [filters, setFilters] = useState({
    clientId: selectedClient,
    status: 'all',
    trigger: 'all',
    search: searchQuery,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      clientId: selectedClient,
      search: searchQuery,
    }));
  }, [selectedClient, searchQuery]);

  useEffect(() => {
    loadFlows();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadFlows = async () => {
    setLoading(true);
    const data = await whatsappService.getAutomationFlows(filters);
    setFlows(data);
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      clientId: selectedClient,
      status: 'all',
      trigger: 'all',
      search: '',
    });
    if (onSearchChange) onSearchChange('');
  };

  const handleOpenDetails = (flow) => {
    setSelectedFlow(flow);
    setIsDetailOpen(true);
  };

  const handleEdit = (flow) => {
    setEditingFlow(flow);
    setIsCreateOpen(true);
  };

  const handleDuplicate = async (flow) => {
    let copyName = `${flow.name} — Copy`;
    let counter = 2;
    while (flows.some((f) => f.name === copyName)) {
      copyName = `${flow.name} — Copy ${counter}`;
      counter++;
    }

    const duplicatedPayload = {
      ...flow,
      id: undefined,
      name: copyName,
      status: 'Paused',
      enrolled: 0,
      completed: 0,
      revenue: 0,
    };

    const created = await whatsappService.createAutomationFlow(duplicatedPayload);
    setFlows((prev) => [created, ...prev]);
    showToast(`✓ Duplicated automation journey as "${copyName}"`);
  };

  const handleToggleStatus = async (id) => {
    const updated = await whatsappService.toggleAutomationFlow(id);
    if (updated) {
      setFlows((prev) => prev.map((f) => (f.id === id ? updated : f)));
      if (selectedFlow?.id === id) {
        setSelectedFlow(updated);
      }
      showToast(`Automation flow is now ${updated.status}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this automated customer journey? This action cannot be undone.')) {
      await whatsappService.deleteAutomationFlow(id);
      setFlows((prev) => prev.filter((f) => f.id !== id));
      if (selectedFlow?.id === id) {
        setIsDetailOpen(false);
      }
      showToast('Automation journey deleted successfully');
    }
  };

  const handleSaveFlow = async (flowData) => {
    if (flowData.id) {
      const updated = await whatsappService.updateAutomationFlow(flowData.id, flowData);
      setFlows((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      showToast('✓ Automation journey updated successfully');
    } else {
      const created = await whatsappService.createAutomationFlow(flowData);
      setFlows((prev) => [created, ...prev]);
      showToast('✓ New visual customer journey activated');
    }
  };

  return (
    <div className="wa-automations-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metrics Strip */}
      <AutomationMetrics flows={flows} />

      {/* Control Card & Toolbar */}
      <div className="wa-automations-toolbar-card">
        <div className="flex justify-between items-center gap-4 flex-wrap w-full mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap size={17} className="text-primary" />
              <span>WhatsApp Automation Flows & Customer Journeys</span>
            </h3>
            <p className="text-xs text-muted">
              Trigger-action automated workflows, delay branching, and CRM pipeline synchronization
            </p>
          </div>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={() => {
              setEditingFlow(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create Automation</span>
          </button>
        </div>

        <AutomationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          clients={clients}
        />
      </div>

      {/* 3-Column Automation Cards Grid */}
      {loading ? (
        <div className="automations-cards-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="wa-automation-card skeleton-card">
              <div className="skeleton-line w-32 h-4 mb-2" />
              <div className="skeleton-line w-48 h-5 mb-3" />
              <div className="skeleton-line w-full h-16 mb-3" />
              <div className="skeleton-line w-full h-8" />
            </div>
          ))}
        </div>
      ) : flows.length === 0 ? (
        <div className="wa-empty-conversations-box">
          <Inbox size={40} className="text-dim mb-2" />
          <strong className="text-white text-base block">No Automation Flows Found</strong>
          <p className="text-xs text-muted max-w-[280px]">
            No automated journeys match your current filter and search criteria.
          </p>
          <button
            type="button"
            className="btn-saas-secondary mt-3"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="automations-cards-grid">
          {flows.map((flow) => (
            <AutomationCard
              key={flow.id}
              flow={flow}
              onOpenDetails={handleOpenDetails}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AutomationDetailModal
        flow={selectedFlow}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      <CreateAutomationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitFlow={handleSaveFlow}
        editingFlow={editingFlow}
        clients={clients}
      />
    </div>
  );
}

export default AutomationsTab;
