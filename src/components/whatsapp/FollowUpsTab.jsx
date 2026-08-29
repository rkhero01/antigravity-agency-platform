import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Inbox,
} from 'lucide-react';
import { FollowUpMetrics } from './FollowUpMetrics.jsx';
import { FollowUpFilters } from './FollowUpFilters.jsx';
import { FollowUpCard } from './FollowUpCard.jsx';
import { FollowUpTable } from './FollowUpTable.jsx';
import { FollowUpDetailModal } from './FollowUpDetailModal.jsx';
import { CreateFollowUpModal } from './CreateFollowUpModal.jsx';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients, whatsappTeamMembers } from '../../data/mockWhatsApp.js';

export function FollowUpsTab({
  selectedClient = 'all',
  searchQuery = '',
  onSearchChange,
  onOpenConversation,
  clients = whatsappClients,
  teamMembers = whatsappTeamMembers,
}) {
  const [followUps, setFollowUps] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [filters, setFilters] = useState({
    clientId: selectedClient,
    assignedStaff: 'all',
    status: 'all',
    priority: 'all',
    type: 'all',
    leadStage: 'all',
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
    loadData();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadData = async () => {
    setLoading(true);
    const data = await whatsappService.getFollowUps(filters);
    const met = await whatsappService.getFollowUpMetrics(filters);
    setFollowUps(data);
    setMetrics(met);
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
      assignedStaff: 'all',
      status: 'all',
      priority: 'all',
      type: 'all',
      leadStage: 'all',
      search: '',
    });
    if (onSearchChange) onSearchChange('');
  };

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  const handleComplete = async (id) => {
    await whatsappService.completeFollowUp(id);
    showToast('✓ Follow-up marked as Completed and logged in CRM activity timeline');
    loadData();
  };

  const handleReschedule = async (item) => {
    const newDueDate = prompt('Enter new scheduled follow-up date and time:', 'Tomorrow at 04:00 PM');
    if (newDueDate) {
      await whatsappService.rescheduleFollowUp(item.id, {
        dueDate: newDueDate,
        reason: item.reason,
      });
      showToast(`✓ Follow-up rescheduled to ${newDueDate}`);
      loadData();
    }
  };

  const handleReassign = async (id, staffName) => {
    await whatsappService.assignFollowUp(id, staffName);
    showToast(`✓ Reassigned follow-up to ${staffName}`);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scheduled follow-up task?')) {
      await whatsappService.deleteFollowUp(id);
      showToast('Follow-up task removed');
      loadData();
    }
  };

  const handleSaveFollowUp = async (formData) => {
    if (formData.id) {
      await whatsappService.updateFollowUp(formData.id, formData);
      showToast('✓ Follow-up task updated successfully');
    } else {
      await whatsappService.createFollowUp(formData);
      showToast('✓ New pipeline follow-up task scheduled');
    }
    loadData();
  };

  const handleAutoBalance = async () => {
    await whatsappService.autoBalanceFollowUps();
    showToast('✓ Auto-balanced overdue and today follow-ups across online staff');
    loadData();
  };

  const handleSuggestionAction = (suggestion) => {
    setEditingItem({
      customerName: suggestion.customerName.split('(')[0].trim(),
      phone: suggestion.phone,
      reason: suggestion.reason,
      priority: suggestion.priority,
      dealValue: suggestion.dealValue,
      type: suggestion.recommendedChannel.includes('Call') ? 'Call' : 'WhatsApp',
      dueDate: suggestion.recommendedTime,
    });
    setIsCreateOpen(true);
  };

  // Group follow-ups into time buckets
  const overdueItems = followUps.filter((f) => f.status === 'Overdue');
  const todayItems = followUps.filter((f) => f.status === 'Due Today');
  const tomorrowItems = followUps.filter((f) => f.status === 'Due Tomorrow');
  const upcomingItems = followUps.filter((f) => f.status === 'Upcoming');
  const completedItems = followUps.filter((f) => f.status === 'Completed');

  return (
    <div className="wa-followups-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metrics Strip */}
      <FollowUpMetrics metrics={metrics} />

      {/* AI Smart Suggestions Panel */}
      <SmartSuggestionsPanel onQuickAction={handleSuggestionAction} />

      {/* Toolbar & Filters Card */}
      <div className="wa-followups-toolbar-card">
        <div className="flex justify-between items-center gap-4 flex-wrap w-full mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck size={17} className="text-primary" />
              <span>WhatsApp Follow-up &amp; Task Command Center</span>
            </h3>
            <p className="text-xs text-muted">
              Pipeline touchpoints, overdue alerts, SLA reminders, and bi-directional CRM synchronization
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="view-mode-toggle-pill">
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Time Bucket Cards View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table List View"
              >
                <List size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={handleAutoBalance}
              title="Auto-balance tasks across online operators"
            >
              <Sparkles size={13} className="text-warning" />
              <span>Auto-Balance</span>
            </button>

            <button
              type="button"
              className="btn-wa-primary"
              onClick={() => {
                setEditingItem(null);
                setIsCreateOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Schedule Follow-up</span>
            </button>
          </div>
        </div>

        <FollowUpFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          clients={clients}
          teamMembers={teamMembers}
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="followup-cards-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="wa-followup-card skeleton-card">
              <div className="skeleton-line w-28 h-4 mb-2" />
              <div className="skeleton-line w-40 h-5 mb-2" />
              <div className="skeleton-line w-full h-12 mb-3" />
              <div className="skeleton-line w-full h-8" />
            </div>
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="wa-empty-conversations-box">
          <Inbox size={40} className="text-dim mb-2" />
          <strong className="text-white text-base block">No Follow-ups Found</strong>
          <p className="text-xs text-muted max-w-[280px]">
            No scheduled follow-up tasks match your active filter and search criteria.
          </p>
          <button
            type="button"
            className="btn-saas-secondary mt-3"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <FollowUpTable
          followUps={followUps}
          onComplete={handleComplete}
          onReschedule={handleReschedule}
          onOpenDetails={handleOpenDetails}
          onOpenConversation={onOpenConversation}
        />
      ) : (
        /* Cards View with Categorized Time Buckets */
        <div className="time-buckets-vertical-stack">
          {/* OVERDUE BUCKET */}
          {overdueItems.length > 0 && (
            <div className="time-bucket-section overdue-section">
              <div className="bucket-section-header">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-danger" />
                  <h4 className="bucket-title text-danger">
                    OVERDUE TOUCHPOINTS ({overdueItems.length})
                  </h4>
                </div>
                <span className="text-xs text-danger font-semibold">
                  Immediate action required
                </span>
              </div>
              <div className="followup-cards-grid">
                {overdueItems.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    onOpenConversation={onOpenConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* DUE TODAY BUCKET */}
          {todayItems.length > 0 && (
            <div className="time-bucket-section today-section">
              <div className="bucket-section-header">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-warning" />
                  <h4 className="bucket-title text-warning">
                    DUE TODAY ({todayItems.length})
                  </h4>
                </div>
                <span className="text-xs text-warning font-semibold">
                  Scheduled for today's active window
                </span>
              </div>
              <div className="followup-cards-grid">
                {todayItems.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    onOpenConversation={onOpenConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* DUE TOMORROW BUCKET */}
          {tomorrowItems.length > 0 && (
            <div className="time-bucket-section tomorrow-section">
              <div className="bucket-section-header">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-cyan" />
                  <h4 className="bucket-title text-cyan">
                    DUE TOMORROW ({tomorrowItems.length})
                  </h4>
                </div>
                <span className="text-xs text-muted font-medium">
                  Next business day queue
                </span>
              </div>
              <div className="followup-cards-grid">
                {tomorrowItems.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    onOpenConversation={onOpenConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING BUCKET */}
          {upcomingItems.length > 0 && (
            <div className="time-bucket-section upcoming-section">
              <div className="bucket-section-header">
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-purple" />
                  <h4 className="bucket-title text-purple">
                    UPCOMING PIPELINE ({upcomingItems.length})
                  </h4>
                </div>
                <span className="text-xs text-dim">Future scheduled touchpoints</span>
              </div>
              <div className="followup-cards-grid">
                {upcomingItems.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    onOpenConversation={onOpenConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED BUCKET */}
          {completedItems.length > 0 && (
            <div className="time-bucket-section completed-section">
              <div className="bucket-section-header">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  <h4 className="bucket-title text-success">
                    COMPLETED TASKS ({completedItems.length})
                  </h4>
                </div>
                <span className="text-xs text-success font-medium">Logged in CRM activity timeline</span>
              </div>
              <div className="followup-cards-grid">
                {completedItems.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={handleComplete}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDetails={handleOpenDetails}
                    onOpenConversation={onOpenConversation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <FollowUpDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onComplete={handleComplete}
        onReschedule={handleReschedule}
        onReassign={handleReassign}
        onDelete={handleDelete}
        onOpenConversation={onOpenConversation}
        teamMembers={teamMembers}
      />

      {/* Create / Edit Modal */}
      <CreateFollowUpModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitFollowUp={handleSaveFollowUp}
        editingItem={editingItem}
        clients={clients}
        teamMembers={teamMembers}
      />
    </div>
  );
}

export default FollowUpsTab;
