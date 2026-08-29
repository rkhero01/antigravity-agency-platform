import React, { useState, useEffect, useMemo } from 'react';
import {
  ClientDirectoryHeader,
  ClientCard,
  ClientTable,
  ClientProfileView,
  AddClientModal,
} from '../../components/clients/index.js';
import { clientsService } from '../../services/clientsService.js';
import { Building2, Plus, Users, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export function ClientsPage({ onNavigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients from PostgreSQL:', err);
      setError(
        err.message ||
          'Unable to connect to database or retrieve client records. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (newClientData) => {
    // 1. Create client in PostgreSQL via live API
    await clientsService.addClient(newClientData);
    // 2. Refresh PostgreSQL source of truth
    await loadClients();
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await clientsService.deleteClient(clientId);
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      await loadClients();
    } catch (err) {
      console.error('Failed to archive client:', err);
    }
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const name = (c.name || c.clientName || '').toLowerCase();
      const industry = (c.industry || '').toLowerCase();
      const contact = (c.contactPerson || c.primaryContact || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || name.includes(q) || industry.includes(q) || contact.includes(q);

      const status = (c.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ? true : status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const activeCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'active'
  ).length;
  const onboardingCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'onboarding'
  ).length;
  const pausedCount = clients.filter(
    (c) => (c.status || '').toLowerCase() === 'paused'
  ).length;

  if (selectedClient) {
    return (
      <ClientProfileView
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onNavigateToModule={onNavigate}
        onDeleteClient={() => handleDeleteClient(selectedClient.id)}
      />
    );
  }

  return (
    <div className="clients-management-page-view">
      {/* Header & Controls */}
      <ClientDirectoryHeader
        totalCount={clients.length}
        activeCount={activeCount}
        onboardingCount={onboardingCount}
        pausedCount={pausedCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content: Loading, Error, Empty, or Data Grid/Table */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">Loading clients from PostgreSQL database...</p>
          <span className="clients-state-sub">Fetching live agency portfolio data</span>
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
            onClick={loadClients}
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
          <h3 className="clients-empty-title">No client workspaces yet</h3>
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
          <p className="clients-empty-desc">Try adjusting your search query or status filter criteria.</p>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            <span>Reset Filters</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="clients-portfolio-grid">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSelectClient={(c) => setSelectedClient(c)}
            />
          ))}
        </div>
      ) : (
        <ClientTable
          clients={filteredClients}
          onSelectClient={(c) => setSelectedClient(c)}
        />
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />
    </div>
  );
}

export default ClientsPage;
