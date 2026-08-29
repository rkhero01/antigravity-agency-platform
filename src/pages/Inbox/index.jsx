import React, { useState, useEffect, useMemo } from 'react';
import {
  InboxHeader,
  InboxKpiCards,
  InboxThreadList,
  InboxChatView,
  InboxCustomerSidebar,
} from '../../components/inbox/index.js';
import { inboxService } from '../../services/inboxService.js';
import { CheckCircle2 } from 'lucide-react';

export function InboxPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadConversations();
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

  const loadConversations = async () => {
    setLoading(true);
    const data = await inboxService.getConversations();
    setConversations(data);
    if (data.length > 0 && !selectedConvId) {
      setSelectedConvId(data[0].id);
    }
    setLoading(false);
  };

  // Filtered list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : c.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesSentiment =
        selectedSentiment === 'all'
          ? true
          : c.sentiment.toLowerCase() === selectedSentiment.toLowerCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesClient &&
        matchesPlatform &&
        matchesSentiment &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    conversations,
    selectedClientFilter,
    selectedPlatform,
    selectedSentiment,
    selectedStatus,
    searchQuery,
  ]);

  // Selected conversation object
  const activeConversation = useMemo(() => {
    return (
      filteredConversations.find((c) => c.id === selectedConvId) ||
      filteredConversations[0] ||
      null
    );
  }, [filteredConversations, selectedConvId]);

  // Metrics
  const metrics = useMemo(() => {
    return inboxService.calculateInboxMetrics(filteredConversations);
  }, [filteredConversations]);

  // Handlers
  const handleSendReply = async (convId, text) => {
    const updated = await inboxService.sendReply(convId, text);
    setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
    showToast(`🚀 Response dispatched to ${updated.customer.handle}!`);
  };

  const handleUpdateStatus = async (convId, newStatus) => {
    const updated = await inboxService.updateStatus(convId, newStatus);
    setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
    showToast(`Status updated to ${newStatus}`);
  };

  const handleAssignStaff = async (convId, staffName) => {
    const updated = await inboxService.assignStaff(convId, staffName);
    setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
    showToast(`Conversation assigned to ${staffName}`);
  };

  return (
    <div className="inbox-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <InboxHeader
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedSentiment={selectedSentiment}
        onSentimentChange={setSelectedSentiment}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 5 KPI Metric Cards */}
      <InboxKpiCards metrics={metrics} />

      {/* 3-Column Split Workspace */}
      <div className="inbox-split-workspace">
        {/* Left Column: Thread List */}
        <div className="inbox-left-column">
          <div className="inbox-column-header">
            <span className="col-title">Conversations</span>
            <span className="col-count-badge">{filteredConversations.length}</span>
          </div>
          <InboxThreadList
            conversations={filteredConversations}
            selectedConvId={activeConversation?.id}
            onSelectConversation={(conv) => setSelectedConvId(conv.id)}
          />
        </div>

        {/* Center Column: Chat & Reply View */}
        <div className="inbox-center-column">
          <InboxChatView
            conversation={activeConversation}
            onSendReply={handleSendReply}
            onUpdateStatus={handleUpdateStatus}
            onAssignStaff={handleAssignStaff}
          />
        </div>

        {/* Right Column: Customer Profile & SLA */}
        <div className="inbox-right-column">
          <InboxCustomerSidebar conversation={activeConversation} />
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
