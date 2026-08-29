import React, { useState, useEffect, useMemo } from 'react';
import {
  ClientDirectoryHeader,
  ClientCard,
  ClientTable,
  ClientProfileView,
  AddClientModal,
  EditClientModal,
  ArchiveClientModal,
} from '../../components/clients/index.js';
import { clientsService } from '../../services/clientsService.js';
import { Building2, Plus, AlertCircle, RefreshCw } from 'lucide-react';

export function ClientsPage({ onNavigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Modals & Active Selections
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToArchive, setClientToArchive] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await clientsService.getClients();
      setClients(data);

      // If a client is currently selected, refresh its details in place
      if (selectedClient) {
        const updatedSelected = data.find((c) => c.id === selectedClient.id);
        if (updatedSelected) {
          setSelectedClient(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to load clients from PostgreSQL:', err);
      setError(
        err.message ||
          'Unable to connect to database or retrieve client records. Please verify connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddClient = async (newClientData) => {
    await clientsService.addClient(newClientData);
    await loadClients(true);
  };

  const handleUpdateClient = async (clientId, updates) => {
    const updated = await clientsService.updateClient(clientId, updates);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? updated : c))
    );
    if (selectedClient?.id === clientId) {
      setSelectedClient(updated);
    }
    setClientToEdit(null);
  };

  const handleArchiveClient = async (clientId) => {
    await clientsService.deleteClient(clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (selectedClient?.id === clientId) {
      setSelectedClient(null);
    }
    setClientToArchive(null);
  };

  // Filtered & Sorted clients list
  const filteredClients = useMemo(() => {
    let result = clients.filter((c) => {
      const name = (c.name || c.clientName || '').toLowerCase();
      const industry = (c.industry || '').toLowerCase();
      const contact = (c.contactPerson || c.primaryContact || '').toLowerCase();
      const email = (c.email || c.contactEmail || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        industry.includes(q) ||
        contact.includes(q) ||
        email.includes(q);

      const status = (c.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ? true : status === statusFilter.toLowerCase();

      const matchesIndustry =
        industryFilter === 'All Industries'
          ? true
          : (c.industry || '').toLowerCase() === industryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesIndustry;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'name_asc') {
        return (a.name || a.clientName || '').localeCompare(
          b.name || b.clientName || ''
        );
      }
      if (sortBy === 'name_desc') {
        return (b.name || b.clientName || '').localeCompare(
          a.name || a.clientName || ''
        );
      }
      if (sortBy === 'retainer_desc') {
        const retA = Number(a.monthlyRetainer ?? a.monthlyBudget ?? 0);
        const retB = Number(b.monthlyRetainer ?? b.monthlyBudget ?? 0);
        return retB - retA;
      }
      if (sortBy === 'health_desc') {
        const hA = Number(a.healthScore ?? 90);
        const hB = Number(b.healthScore ?? 90);
        return hB - hA;
      }
      return 0;
    });

    return result;
  }, [clients, searchQuery, statusFilter, industryFilter, sortBy]);

  const activeCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'active'
  ).length;
  const pausedCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'paused'
  ).length;
  const inactiveCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'inactive'
  ).length;

  if (selectedClient) {
    return (
      <div className="clients-management-page-view">
        <ClientProfileView
          client={selectedClient}
          onBack={() => setSelectedClient(null)}
          onNavigateToModule={onNavigate}
          onEditClient={(c) => setClientToEdit(c)}
          onArchiveClient={(c) => setClientToArchive(c)}
        />

        {/* Edit Client Modal */}
        <EditClientModal
          isOpen={Boolean(clientToEdit)}
          onClose={() => setClientToEdit(null)}
          client={clientToEdit}
          onUpdateClient={handleUpdateClient}
        />

        {/* Archive Client Confirmation Modal */}
        <ArchiveClientModal
          isOpen={Boolean(clientToArchive)}
          onClose={() => setClientToArchive(null)}
          client={clientToArchive}
          onConfirmArchive={handleArchiveClient}
        />
      </div>
    );
  }

  return (
    <div className="clients-management-page-view">
      {/* Header & Controls */}
      <ClientDirectoryHeader
        totalCount={clients.length}
        activeCount={activeCount}
        pausedCount={pausedCount}
        inactiveCount={inactiveCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        industryFilter={industryFilter}
        onIndustryFilterChange={setIndustryFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefresh={() => loadClients(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main View Area */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">Loading clients from PostgreSQL database...</p>
          <span className="clients-state-sub">Connecting to live multi-tenant workspace</span>
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
            onClick={() => loadClients(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : clients.length === 0 ? (
        <div className="clients-empty-state-card">
          <div className="empty-state-icon">
            <Building2 size={36} />
          </div>
          <h3 className="clients-empty-title">No client workspaces registered yet</h3>
          <p className="clients-empty-desc">
            Your live PostgreSQL database has no client accounts registered yet. Onboard your first client to start managing campaigns and analytics.
          </p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Your First Client</span>
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="clients-empty-state-card">
          <div className="empty-state-icon">
            <Building2 size={32} />
          </div>
          <h3 className="clients-empty-title">No matching clients found</h3>
          <p className="clients-empty-desc">
            No client records match your current search query or filter criteria.
          </p>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setIndustryFilter('All Industries');
            }}
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="clients-portfolio-grid">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSelectClient={(c) => setSelectedClient(c)}
              onEditClient={(c) => setClientToEdit(c)}
              onArchiveClient={(c) => setClientToArchive(c)}
            />
          ))}
        </div>
      ) : (
        <ClientTable
          clients={filteredClients}
          onSelectClient={(c) => setSelectedClient(c)}
          onEditClient={(c) => setClientToEdit(c)}
          onArchiveClient={(c) => setClientToArchive(c)}
        />
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={Boolean(clientToEdit)}
        onClose={() => setClientToEdit(null)}
        client={clientToEdit}
        onUpdateClient={handleUpdateClient}
      />

      {/* Archive Client Confirmation Modal */}
      <ArchiveClientModal
        isOpen={Boolean(clientToArchive)}
        onClose={() => setClientToArchive(null)}
        client={clientToArchive}
        onConfirmArchive={handleArchiveClient}
      />
    </div>
  );
}

export default ClientsPage;
