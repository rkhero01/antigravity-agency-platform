import React, { useState, useEffect } from 'react';
import { WhatsAppAnalyticsHeader } from './WhatsAppAnalyticsHeader.jsx';
import { AnalyticsKpiCards } from './AnalyticsKpiCards.jsx';
import { MessageVolumeChart } from './MessageVolumeChart.jsx';
import { ConversationAnalytics } from './ConversationAnalytics.jsx';
import { WhatsAppConversionFunnel } from './WhatsAppConversionFunnel.jsx';
import { CampaignAnalytics } from './CampaignAnalytics.jsx';
import { TemplateAnalytics } from './TemplateAnalytics.jsx';
import { AutomationAnalytics } from './AutomationAnalytics.jsx';
import { TeamAnalytics } from './TeamAnalytics.jsx';
import { FollowUpAnalytics } from './FollowUpAnalytics.jsx';
import { ClientAnalytics } from './ClientAnalytics.jsx';
import { WhatsAppSourceAnalytics } from './WhatsAppSourceAnalytics.jsx';
import { WhatsAppActivityHeatmap } from './WhatsAppActivityHeatmap.jsx';
import { WhatsAppInsightsPanel } from './WhatsAppInsightsPanel.jsx';
import { WhatsAppAnalyticsReportModal } from './WhatsAppAnalyticsReportModal.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients } from '../../data/mockWhatsApp.js';
import { CheckCircle2 } from 'lucide-react';

export function WhatsAppAnalyticsTab({
  selectedClient = 'all',
  onClientChange,
  clients = whatsappClients,
}) {
  const [timeframe, setTimeframe] = useState('30d');
  const [comparePeriod, setComparePeriod] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedClient, timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await whatsappService.getWhatsAppAnalytics({
      clientId: selectedClient,
      timeframe,
    });
    setAnalytics(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const handleExportCSV = async () => {
    await whatsappService.exportWhatsAppAnalyticsCSV({
      clientId: selectedClient,
      timeframe,
    });
    showToast('✓ WhatsApp Analytics CSV exported successfully');
  };

  return (
    <div className="wa-analytics-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Global Controls */}
      <WhatsAppAnalyticsHeader
        selectedClient={selectedClient}
        onClientChange={onClientChange}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        comparePeriod={comparePeriod}
        onToggleCompare={setComparePeriod}
        onExportCSV={handleExportCSV}
        onOpenReportModal={() => setIsReportOpen(true)}
        clients={clients}
      />

      {/* 2. 12-Card Executive KPI Dashboard */}
      <AnalyticsKpiCards analytics={analytics} loading={loading} />

      {/* 3. Message Volume Trajectory Chart */}
      <MessageVolumeChart
        timeframe={timeframe}
        selectedClient={selectedClient}
      />

      {/* 4. Conversation Metrics & SLA Radar */}
      <ConversationAnalytics selectedClient={selectedClient} />

      {/* 5. End-to-End Conversion Funnel */}
      <WhatsAppConversionFunnel selectedClient={selectedClient} />

      {/* 6. Campaign Comparative ROI */}
      <CampaignAnalytics selectedClient={selectedClient} />

      {/* 7. Template Performance & Approvals */}
      <TemplateAnalytics selectedClient={selectedClient} />

      {/* 8. Automation Flow ROI & Journey Lift */}
      <AutomationAnalytics selectedClient={selectedClient} />

      {/* 9. Team Operator Productivity & Sales Leaderboard */}
      <TeamAnalytics />

      {/* 10. Follow-up SLA & Overdue Recovery */}
      <FollowUpAnalytics selectedClient={selectedClient} />

      {/* 11. Multi-Client Workspace Matrix */}
      <ClientAnalytics />

      {/* 12. Multi-Channel Source Attribution */}
      <WhatsAppSourceAnalytics />

      {/* 13. 24x7 Activity Heatmap */}
      <WhatsAppActivityHeatmap />

      {/* 14. AI Insights & Anomaly Detection */}
      <WhatsAppInsightsPanel />

      {/* 15. Executive Report Modal */}
      <WhatsAppAnalyticsReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        selectedClient={selectedClient}
        timeframe={timeframe}
      />
    </div>
  );
}

export default WhatsAppAnalyticsTab;
