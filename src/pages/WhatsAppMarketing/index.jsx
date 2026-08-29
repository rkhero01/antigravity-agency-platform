import React, { useState, useEffect } from 'react';
import {
  WhatsAppHeader,
  WhatsAppKpiCards,
  ConversationInbox,
  CampaignsTab,
  TemplatesTab,
  AutomationsTab,
  TeamTab,
  FollowUpsTab,
  WhatsAppAnalyticsTab,
  CreateCampaignModal,
  CreateTemplateModal,
} from '../../components/whatsapp/index.js';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients } from '../../data/mockWhatsApp.js';
import { CheckCircle2, Zap, Users, MessageSquare } from 'lucide-react';

export function WhatsAppMarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadOverview();
  }, [selectedClient]);

  const loadOverview = async () => {
    setLoading(true);
    const data = await whatsappService.getWhatsAppOverview({ clientId: selectedClient });
    setAnalytics(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCreateCampaignSubmit = async (campData) => {
    await whatsappService.createCampaign(campData);
    showToast('✓ WhatsApp broadcast campaign scheduled');
    loadOverview();
  };

  const handleCreateTemplateSubmit = async (tmplData) => {
    await whatsappService.createTemplate(tmplData);
    showToast('✓ Meta WhatsApp message template registered');
    loadOverview();
  };

  return (
    <div className="wa-marketing-container p-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main WhatsApp Header */}
      <WhatsAppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewConversation={() => setActiveTab('conversations')}
        onCreateCampaign={() => setIsNewCampaignOpen(true)}
        onOpenAIModal={() => showToast('🤖 AI Reply Studio & Conversation Co-Pilot Active')}
        clients={whatsappClients}
      />

      {/* Overview Tab: Displays 8 KPI Cards + Live Summary Workspace */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <WhatsAppKpiCards analytics={analytics} loading={loading} />

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Live Inbox Preview */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={17} className="text-success" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Conversational Pulse
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn-saas-secondary text-xs"
                  onClick={() => setActiveTab('conversations')}
                >
                  Open Full Inbox
                </button>
              </div>
              <ConversationInbox
                selectedClient={selectedClient}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Quick Broadcast Campaigns Summary */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={17} className="text-primary" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Recent Broadcasts & Automations
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn-saas-secondary text-xs"
                  onClick={() => setActiveTab('campaigns')}
                >
                  View All Campaigns
                </button>
              </div>
              <CampaignsTab
                selectedClient={selectedClient}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab: Full 3-Column Live Inbox */}
      {activeTab === 'conversations' && (
        <ConversationInbox
          selectedClient={selectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Campaigns Tab: Broadcast Campaigns Workspace */}
      {activeTab === 'campaigns' && (
        <CampaignsTab
          selectedClient={selectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Templates Tab: Meta-Approved Templates Center */}
      {activeTab === 'templates' && (
        <TemplatesTab
          selectedClient={selectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Automations Tab: Customer Journeys & Trigger Workflows */}
      {activeTab === 'automations' && (
        <AutomationsTab
          selectedClient={selectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Team Operations Tab: Staff Workload & Availability */}
      {activeTab === 'team' && (
        <TeamTab
          onSelectOperatorChats={(operatorName) => {
            setSearchQuery(operatorName);
            setActiveTab('conversations');
          }}
        />
      )}

      {/* Follow-ups & Task Command Center Tab */}
      {activeTab === 'follow-ups' && (
        <FollowUpsTab
          selectedClient={selectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenConversation={(convId) => {
            setActiveTab('conversations');
          }}
        />
      )}

      {/* Analytics & Reporting Center Tab */}
      {activeTab === 'analytics' && (
        <WhatsAppAnalyticsTab
          selectedClient={selectedClient}
          onClientChange={setSelectedClient}
        />
      )}

      {/* Global Modals */}
      <CreateCampaignModal
        isOpen={isNewCampaignOpen}
        onClose={() => setIsNewCampaignOpen(false)}
        onSubmitCampaign={handleCreateCampaignSubmit}
      />

      <CreateTemplateModal
        isOpen={isNewTemplateOpen}
        onClose={() => setIsNewTemplateOpen(false)}
        onSubmitTemplate={handleCreateTemplateSubmit}
      />
    </div>
  );
}

export default WhatsAppMarketingPage;
