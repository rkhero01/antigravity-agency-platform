import React, { useState, useEffect, useMemo } from 'react';
import {
  ClientDirectoryHeader,
  ClientCard,
  ClientTable,
  ClientProfileView,
  AddClientModal,
} from '../../components/clients/index.js';
import { clientsService } from '../../services/clientsService.js';
import { Building2, Plus, Users } from 'lucide-react';

export function ClientsPage({ onNavigate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const data = await clientsService.getClients();
    setClients(data);
    setLoading(false);
  };

  const handleAddClient = async (newClientData) => {
    const created = await clientsService.addClient(newClientData);
    setClients((prev) => [created, ...prev]);
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const activeCount = clients.filter((c) => c.status === 'Active').length;
  const onboardingCount = clients.filter((c) => c.status === 'Onboarding').length;
  const pausedCount = clients.filter((c) => c.status === 'Paused').length;

  if (selectedClient) {
    return (
      <ClientProfileView
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onNavigateToModule={onNavigate}
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

      {/* Main Content: Grid or Table */}
      {filteredClients.length === 0 ? (
        <div className="clients-empty-state-card">
          <div className="empty-state-icon">
            <Building2 size={32} />
          </div>
          <h3>No clients found</h3>
          <p>Try adjusting your search query or status filter criteria.</p>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Reset Filters
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
