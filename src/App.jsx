import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/index.js';
import { useNavigation } from './hooks/useNavigation.js';
import { MODULES } from './utils/constants.js';
import { authSessionService } from './services/authSessionService.js';
import { LoginPage } from './pages/Auth/LoginPage.jsx';

import { DashboardPage } from './pages/Dashboard/index.jsx';
import { ClientsPage } from './pages/Clients/index.jsx';
import { SocialAccountsPage } from './pages/SocialAccounts/index.jsx';
import { InboxPage } from './pages/Inbox/index.jsx';
import { ContentManagementPage } from './pages/ContentManagement/index.jsx';
import { AIAssistantPage } from './pages/AIAssistant/index.jsx';
import { InfluencerHubPage } from './pages/InfluencerHub/index.jsx';
import { AdsPerformancePage } from './pages/AdsPerformance/index.jsx';
import { CompetitorRadarPage } from './pages/CompetitorRadar/index.jsx';
import { TrendDiscoveryPage } from './pages/TrendDiscovery/index.jsx';
import { AssetLibraryPage } from './pages/AssetLibrary/index.jsx';
import { CampaignPlannerPage } from './pages/CampaignPlanner/index.jsx';
import { ContractsBillingPage } from './pages/ContractsBilling/index.jsx';
import { SocialListeningPage } from './pages/SocialListening/index.jsx';
import { EmailMarketingPage } from './pages/EmailMarketing/index.jsx';
import { SEOCommandCenterPage } from './pages/SEOCommandCenter/index.jsx';
import { LeadCRMPage } from './pages/LeadCRM/index.jsx';
import { WhatsAppMarketingPage } from './pages/WhatsAppMarketing/index.jsx';
import { AIIntelligencePage } from './pages/AIIntelligence/index.jsx';
import { AutomationsPage } from './pages/Automations/index.jsx';
import { AnalyticsReportsPage } from './pages/AnalyticsReports/index.jsx';
import { TasksWorkflowPage } from './pages/TasksWorkflow/index.jsx';
import { TeamManagementPage } from './pages/TeamManagement/index.jsx';
import { ReportsPage } from './pages/Reports/index.jsx';
import { ClientPortalPage } from './pages/ClientPortal/index.jsx';
import { SettingsPage } from './pages/Settings/index.jsx';

import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => authSessionService.getCurrentUser());
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);

  useEffect(() => {
    const unsubscribe = authSessionService.subscribe((user) => {
      setCurrentUser(user);
    });

    authSessionService
      .restoreSession()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsSessionRestoring(false));

    return unsubscribe;
  }, []);

  const { activeModule, navigateTo, activeClient, setActiveClient } = useNavigation(
    MODULES.DASHBOARD
  );
  const [dateRange, setDateRange] = useState('30d');

  const renderActiveModule = () => {
    switch (activeModule) {
      case MODULES.DASHBOARD:
        return (
          <DashboardPage
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onNavigate={navigateTo}
          />
        );
      case MODULES.CLIENTS:
        return <ClientsPage onNavigate={navigateTo} />;
      case MODULES.SOCIAL_ACCOUNTS:
        return <SocialAccountsPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.INBOX:
        return <InboxPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.CONTENT:
        return <ContentManagementPage activeClient={activeClient} />;
      case MODULES.AI_ASSISTANT:
        return <AIAssistantPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.INFLUENCER_HUB:
        return <InfluencerHubPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.ADS_PERFORMANCE:
        return (
          <AdsPerformancePage
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            activeClient={activeClient}
            onNavigate={navigateTo}
          />
        );
      case MODULES.COMPETITORS:
        return <CompetitorRadarPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.TRENDS:
        return <TrendDiscoveryPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.ASSETS:
        return <AssetLibraryPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.CAMPAIGN_PLANNER:
        return <CampaignPlannerPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.CONTRACTS:
        return <ContractsBillingPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.SOCIAL_LISTENING:
        return <SocialListeningPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.EMAIL_MARKETING:
        return <EmailMarketingPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.SEO_COMMAND_CENTER:
        return <SEOCommandCenterPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.LEAD_CRM:
        return <LeadCRMPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.WHATSAPP_MARKETING:
        return <WhatsAppMarketingPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.AI_INTELLIGENCE:
        return <AIIntelligencePage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.AUTOMATIONS:
        return <AutomationsPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.ANALYTICS:
        return (
          <AnalyticsReportsPage
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            activeClient={activeClient}
            onNavigate={navigateTo}
          />
        );
      case MODULES.TASKS:
        return <TasksWorkflowPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.TEAM:
        return <TeamManagementPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.REPORTS:
        return <ReportsPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.CLIENT_PORTAL:
        return <ClientPortalPage activeClient={activeClient} onNavigate={navigateTo} />;
      case MODULES.SETTINGS:
        return <SettingsPage activeClient={activeClient} onNavigate={navigateTo} />;
      default:
        return (
          <DashboardPage
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onNavigate={navigateTo}
          />
        );
    }
  };

  if (isSessionRestoring) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Connecting to Antigravity Cloud...</p>
      </div>
    );
  }

  if (!currentUser || !currentUser.isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <AppLayout
      activeModule={activeModule}
      onNavigate={navigateTo}
      activeClient={activeClient}
      onClientChange={setActiveClient}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      currentUser={currentUser}
    >
      {renderActiveModule()}
    </AppLayout>
  );
}
