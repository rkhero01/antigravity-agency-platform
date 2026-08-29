import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Eye,
  MessageCircle,
  Award,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { CampaignCard } from './CampaignCard.jsx';
import { CampaignFilters } from './CampaignFilters.jsx';
import { CampaignDetailModal } from './CampaignDetailModal.jsx';
import { CreateCampaignModal } from './CreateCampaignModal.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function CampaignsTab({
  selectedClient = 'all',
  searchQuery = '',
  onSearchChange,
  clients = whatsappClients,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [filters, setFilters] = useState({
    clientId: selectedClient,
    type: 'all',
    status: 'all',
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
    loadCampaigns();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await whatsappService.getCampaigns(filters);
    setCampaigns(data);
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
      type: 'all',
      status: 'all',
      search: '',
    });
    if (onSearchChange) onSearchChange('');
  };

  // Top KPI aggregate calculations
  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipients || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.delivered || 0), 0);
  const totalRead = campaigns.reduce((acc, c) => acc + (c.read || 0), 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + (c.replied || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const overallRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) + 'x' : 'N/A';

  const avgDelivery = totalRecipients > 0 ? ((totalDelivered / totalRecipients) * 100).toFixed(1) + '%' : '0.0%';
  const avgRead = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) + '%' : '0.0%';
  const avgReply = totalDelivered > 0 ? ((totalReplied / totalDelivered) * 100).toFixed(1) + '%' : '0.0%';

  const handleOpenDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setIsCreateOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    const updated = await whatsappService.updateCampaignStatus(id, newStatus);
    if (updated) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(updated);
      }
      showToast(`Campaign status updated to "${newStatus}"`);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await whatsappService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (selectedCampaign?.id === id) {
        setIsDetailOpen(false);
      }
      showToast('Campaign deleted successfully');
    }
  };

  const handleSaveCampaign = async (campaignData) => {
    if (campaignData.id) {
      const updated = await whatsappService.updateCampaign(campaignData.id, campaignData);
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast('✓ Campaign updated successfully');
    } else {
      const created = await whatsappService.createCampaign(campaignData);
      setCampaigns((prev) => [created, ...prev]);
      showToast('✓ New broadcast campaign scheduled');
    }
  };

  return (
    <div className="wa-campaigns-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Campaign Aggregate KPI Strip */}
      <div className="campaign-summary-kpi-strip">
        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Total Campaigns</span>
          <strong className="c-kpi-val text-white">{campaigns.length}</strong>
          <span className="c-kpi-sub text-success">
            {campaigns.filter((c) => c.status === 'Running').length} Running Live
          </span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Audience Reach</span>
          <strong className="c-kpi-val text-cyan">{totalRecipients.toLocaleString()}</strong>
          <span className="c-kpi-sub text-dim">Total targeted contacts</span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Avg Delivery</span>
          <strong className="c-kpi-val text-success">{avgDelivery}</strong>
          <span className="c-kpi-sub text-muted">{totalDelivered.toLocaleString()} messages</span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Avg Read Rate</span>
          <strong className="c-kpi-val text-purple">{avgRead}</strong>
          <span className="c-kpi-sub text-muted">{totalRead.toLocaleString()} reads</span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Avg Reply Rate</span>
          <strong className="c-kpi-val text-pink">{avgReply}</strong>
          <span className="c-kpi-sub text-muted">{totalReplied.toLocaleString()} responses</span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Conversions</span>
          <strong className="c-kpi-val text-white">{totalConversions}</strong>
          <span className="c-kpi-sub text-success">Closed deals</span>
        </div>

        <div className="c-kpi-item">
          <span className="c-kpi-lbl">Attributed Revenue</span>
          <strong className="c-kpi-val text-warning">₹{totalRevenue.toLocaleString()}</strong>
          <span className="c-kpi-sub text-success">Overall ROAS: {overallRoas}</span>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="campaign-controls-header-card">
        <div className="flex justify-between items-center gap-4 flex-wrap w-full mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone size={17} className="text-primary" />
              <span>Multi-Client Broadcast Campaigns</span>
            </h3>
            <p className="text-xs text-muted">
              Manage promotional drops, win-back flows, and lead follow-up blasts across workspaces
            </p>
          </div>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={() => {
              setEditingCampaign(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>

        <CampaignFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          clients={clients}
        />
      </div>

      {/* Campaign Cards Grid */}
      {loading ? (
        <div className="campaign-cards-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="wa-campaign-card skeleton-card">
              <div className="skeleton-line w-32 h-4 mb-2" />
              <div className="skeleton-line w-48 h-6 mb-3" />
              <div className="skeleton-line w-full h-16 mb-3" />
              <div className="skeleton-line w-full h-8" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="wa-empty-conversations-box">
          <Inbox size={40} className="text-dim mb-2" />
          <strong className="text-white text-base block">No Campaigns Found</strong>
          <p className="text-xs text-muted max-w-[280px]">
            No broadcast campaigns match your current filter and search criteria.
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
        <div className="campaign-cards-grid">
          {campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onOpenDetails={handleOpenDetails}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusChange={handleStatusChange}
        onEdit={handleEditCampaign}
      />

      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitCampaign={handleSaveCampaign}
        editingCampaign={editingCampaign}
        clients={clients}
      />
    </div>
  );
}

export default CampaignsTab;
