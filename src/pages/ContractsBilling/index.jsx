import React, { useState, useEffect, useMemo } from 'react';
import {
  ContractHeader,
  ContractKpiCards,
  ContractsGrid,
  InvoicesScheduleTab,
  ContractDetailModal,
  CreateContractModal,
  AIProposalGeneratorModal,
} from '../../components/contracts/index.js';
import { contractService } from '../../services/contractService.js';
import { CheckCircle2 } from 'lucide-react';

export function ContractsBillingPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('contracts'); // 'contracts' | 'invoices'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [inspectedContract, setInspectedContract] = useState(null);
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
    const [contractData, invoiceData] = await Promise.all([
      contractService.getContracts(),
      contractService.getInvoices(),
    ]);
    setContracts(contractData);
    setInvoices(invoiceData);
    setLoading(false);
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.signatory.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesStatus && matchesSearch;
    });
  }, [contracts, selectedClientFilter, selectedStatus, searchQuery]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : inv.clientId === selectedClientFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesSearch;
    });
  }, [invoices, selectedClientFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return contractService.calculateContractMetrics(filteredContracts);
  }, [filteredContracts]);

  // Handlers
  const handleCreateContract = async (formData) => {
    const created = await contractService.createContract(formData);
    setContracts((prev) => [created, ...prev]);
    showToast(`✨ Successfully created agreement "${created.title}"!`);
  };

  const handleDeleteContract = async (id) => {
    await contractService.deleteContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contract removed from system.');
  };

  const handleMarkPaid = async (invoiceId) => {
    await contractService.markInvoicePaid(invoiceId);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv))
    );
    showToast(`✓ Payment recorded for invoice #${invoiceId}`);
  };

  return (
    <div className="contracts-billing-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <ContractHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <ContractKpiCards metrics={metrics} />

      {/* Main Content: Contracts vs Invoices */}
      {viewMode === 'contracts' ? (
        <ContractsGrid
          contracts={filteredContracts}
          onInspect={setInspectedContract}
          onDeleteContract={handleDeleteContract}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <InvoicesScheduleTab
          invoices={filteredInvoices}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {/* Inspect Contract Modal */}
      <ContractDetailModal
        contract={inspectedContract}
        isOpen={Boolean(inspectedContract)}
        onClose={() => setInspectedContract(null)}
      />

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateContract={handleCreateContract}
      />

      {/* AI Proposal Generator Modal */}
      <AIProposalGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}

export default ContractsBillingPage;
