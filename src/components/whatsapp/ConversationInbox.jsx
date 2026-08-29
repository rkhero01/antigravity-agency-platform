import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList.jsx';
import { ConversationChat } from './ConversationChat.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { CheckCircle2 } from 'lucide-react';

export function ConversationInbox({
  selectedClient = 'all',
  searchQuery = '',
  onSearchChange,
}) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    clientId: selectedClient,
    status: 'all',
    leadStage: 'all',
    sentiment: 'all',
    assignedTo: 'all',
    isPriority: 'all',
    tag: 'all',
    source: 'all',
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
    loadConversations();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadConversations = async () => {
    setLoading(true);
    const data = await whatsappService.getConversations(filters);
    setConversations(data);
    if (data.length > 0) {
      if (!selectedConversation || !data.some((c) => c.id === selectedConversation.id)) {
        setSelectedConversation(data[0]);
      } else {
        const refreshed = data.find((c) => c.id === selectedConversation.id);
        if (refreshed) setSelectedConversation(refreshed);
      }
    } else {
      setSelectedConversation(null);
    }
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
      leadStage: 'all',
      sentiment: 'all',
      assignedTo: 'all',
      isPriority: 'all',
      tag: 'all',
      source: 'all',
      search: '',
    });
    if (onSearchChange) onSearchChange('');
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    if (conv.unreadCount > 0) {
      await whatsappService.markConversationRead(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedConversation) return;
    const updated = await whatsappService.sendMessage(selectedConversation.id, text);
    setSelectedConversation(updated);
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    showToast('✓ WhatsApp message dispatched (Sandbox Simulation)');
  };

  const handleSendTemplate = async (templateId, variables) => {
    if (!selectedConversation) return;
    const updated = await whatsappService.sendTemplateMessage(
      selectedConversation.id,
      templateId,
      variables
    );
    setSelectedConversation(updated);
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    showToast(`✓ Meta Verified Template "${templateId}" sent successfully!`);
  };

  const handleTogglePriority = async (id) => {
    const updated = await whatsappService.togglePriority(id);
    if (updated) {
      setSelectedConversation(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast(updated.isPriority ? '⭐ Added to VIP Priority Queue' : 'Removed from VIP Priority');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const updated = await whatsappService.updateConversationStatus(id, status);
    if (updated) {
      setSelectedConversation(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast(`Chat status updated to "${status}"`);
    }
  };

  const handleUpdateLeadStage = async (id, stage) => {
    const updated = await whatsappService.updateLeadStage(id, stage);
    if (updated) {
      setSelectedConversation(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast(`CRM Deal Stage advanced to "${stage}"`);
    }
  };

  const handleAssignStaff = async (id, staffName) => {
    const updated = await whatsappService.assignConversation(id, staffName);
    if (updated) {
      setSelectedConversation(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast(`Conversation reassigned to ${staffName}`);
    }
  };

  return (
    <div className="wa-conversation-inbox-workspace">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="wa-inbox-split-grid">
        {/* Left Column: Conversation List & Filters */}
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          loading={loading}
        />

        {/* Center & Right Columns: Chat Thread, Composer & Intelligence */}
        <ConversationChat
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
          onSendTemplate={handleSendTemplate}
          onTogglePriority={handleTogglePriority}
          onUpdateStatus={handleUpdateStatus}
          onUpdateLeadStage={handleUpdateLeadStage}
          onAssignStaff={handleAssignStaff}
        />
      </div>
    </div>
  );
}

export default ConversationInbox;
