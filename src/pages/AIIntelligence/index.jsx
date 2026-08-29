import React, { useState, useEffect } from 'react';
import {
  AIIntelligenceHeader,
  IntelligenceKpiCards,
  BusinessHealthOverview,
  DailyBriefingPanel,
  AIInsightsPanel,
  AIRecommendationsPanel,
  AnomaliesPanel,
  ClientIntelligencePanel,
  ChannelPerformanceMatrix,
  LeadVelocityPanel,
  RevenueAttributionPanel,
  ForecastPanel,
  AIActionCenter,
  InsightDetailModal,
  AnomalyDetailModal,
  IntelligenceSearch,
  IntelligenceReportModal,
  ExecutiveDecisionScoreboard,
  OpportunityMap,
  ClientRiskRadar,
  RevenueLeakagePanel,
  NextBestActionPanel,
  WhatIfSimulator,
  ClientComparisonMatrix,
  ExecutiveSummaryPanel,
  AIActionHistory,
  AIActivityStream,
} from '../../components/aiIntelligence/index.js';
import { aiIntelligenceService } from '../../services/aiIntelligenceService.js';
import { aiActionOrchestrator } from '../../services/aiActionOrchestrator.js';
import { initialMockAIIntelligence } from '../../data/mockAIIntelligence.js';
import { MODULES } from '../../utils/constants.js';
import { CheckCircle2, FileText, Sparkles, ChevronDown, ChevronUp, Layers, Target, Compass, Activity, History } from 'lucide-react';

export function AIIntelligencePage({ activeClient, onNavigate }) {
  const [selectedClient, setSelectedClient] = useState(activeClient || 'all');
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Intelligence State Data
  const [agencyOverview, setAgencyOverview] = useState({});
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [businessHealth, setBusinessHealth] = useState({});
  const [dailyBriefing, setDailyBriefing] = useState({});
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [channels, setChannels] = useState([]);
  const [leadVelocityData, setLeadVelocityData] = useState({});
  const [revenueData, setRevenueData] = useState({});

  // Decision & Action Intelligence Data
  const [decisionScoreboard, setDecisionScoreboard] = useState({});
  const [opportunityMap, setOpportunityMap] = useState([]);
  const [clientRiskRadar, setClientRiskRadar] = useState([]);
  const [revenueLeakage, setRevenueLeakage] = useState([]);
  const [nextBestActions, setNextBestActions] = useState([]);
  const [clientComparison, setClientComparison] = useState([]);
  const [executiveSummary, setExecutiveSummary] = useState({});
  const [actionHistory, setActionHistory] = useState([]);
  const [activityStream, setActivityStream] = useState([]);

  // Active Modals & Selected Entities
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Accordion Sections State
  const [isDecisionEngineExpanded, setIsDecisionEngineExpanded] = useState(true);
  const [isDeepDiveExpanded, setIsDeepDiveExpanded] = useState(true);

  useEffect(() => {
    loadAllIntelligence();
  }, [selectedClient, timeframe]);

  const loadAllIntelligence = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        aiIntelligenceService.getAgencyIntelligence(),
        aiIntelligenceService.getClientIntelligence('all'),
        selectedClient !== 'all'
          ? aiIntelligenceService.getClientIntelligence(selectedClient)
          : Promise.resolve(null),
        aiIntelligenceService.getBusinessHealth({ clientId: selectedClient, timeframe }),
        aiIntelligenceService.getDailyBriefing({ clientId: selectedClient }),
        aiIntelligenceService.getAIInsights({ clientId: selectedClient }),
        aiIntelligenceService.getAIRecommendations({ clientId: selectedClient }),
        aiIntelligenceService.getAnomalies({ clientId: selectedClient }),
        aiIntelligenceService.getChannelIntelligence({ clientId: selectedClient }),
        aiIntelligenceService.getLeadVelocityIntelligence({ clientId: selectedClient }),
        aiIntelligenceService.getRevenueAttribution({ clientId: selectedClient }),
        aiIntelligenceService.getExecutiveDecisionScore(),
        aiIntelligenceService.getOpportunityMap({ clientId: selectedClient }),
        aiIntelligenceService.getClientRiskRadar(),
        aiIntelligenceService.getRevenueLeakage({ clientId: selectedClient }),
        aiIntelligenceService.getNextBestActions({ clientId: selectedClient }),
        aiIntelligenceService.getClientComparison({ clientId: selectedClient }),
        aiIntelligenceService.generateExecutiveSummary({ clientId: selectedClient }),
        aiActionOrchestrator.getActionHistory({ clientId: selectedClient }),
      ]);

      if (results[0].status === 'fulfilled') setAgencyOverview(results[0].value || {});
      if (results[1].status === 'fulfilled') setClientsList(results[1].value || []);
      if (results[2].status === 'fulfilled') setSelectedClientData(results[2].value);
      if (results[3].status === 'fulfilled') setBusinessHealth(results[3].value || {});
      if (results[4].status === 'fulfilled') setDailyBriefing(results[4].value || {});
      if (results[5].status === 'fulfilled') setInsights(results[5].value || []);
      if (results[6].status === 'fulfilled') setRecommendations(results[6].value || []);
      if (results[7].status === 'fulfilled') setAnomalies(results[7].value || []);
      if (results[8].status === 'fulfilled') setChannels(results[8].value || []);
      if (results[9].status === 'fulfilled') setLeadVelocityData(results[9].value || {});
      if (results[10].status === 'fulfilled') setRevenueData(results[10].value || {});
      if (results[11].status === 'fulfilled') setDecisionScoreboard(results[11].value || {});
      if (results[12].status === 'fulfilled') setOpportunityMap(results[12].value || []);
      if (results[13].status === 'fulfilled') setClientRiskRadar(results[13].value || []);
      if (results[14].status === 'fulfilled') setRevenueLeakage(results[14].value || []);
      if (results[15].status === 'fulfilled') setNextBestActions(results[15].value || []);
      if (results[16].status === 'fulfilled') setClientComparison(results[16].value || []);
      if (results[17].status === 'fulfilled') setExecutiveSummary(results[17].value || {});
      if (results[18].status === 'fulfilled') setActionHistory(results[18].value || []);

      setActivityStream(initialMockAIIntelligence.activityStream || []);
    } catch (err) {
      console.error('Error fetching AI intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleRefresh = async () => {
    showToast('🔄 Synchronizing multi-module intelligence models...');
    await loadAllIntelligence();
    showToast('✓ AI Intelligence models updated successfully');
  };

  const handleGenerateBriefing = async () => {
    showToast('⚡ Generating updated Executive Briefing (Demo Simulation)...');
    const briefing = await aiIntelligenceService.getDailyBriefing({ clientId: selectedClient });
    const summary = await aiIntelligenceService.generateExecutiveSummary({ clientId: selectedClient });
    setDailyBriefing(briefing);
    setExecutiveSummary(summary);
    showToast('✓ New Daily Intelligence Briefing generated');
  };

  const handleOpenExecutiveReport = async () => {
    showToast('📄 Assembling Full Executive Intelligence Report...');
    const data = await aiIntelligenceService.generateExecutiveReport({ clientId: selectedClient });
    setReportData(data);
    setIsReportModalOpen(true);
  };

  const handleDismissInsight = async (id) => {
    await aiIntelligenceService.dismissInsight(id);
    setInsights((prev) => prev.filter((ins) => ins.id !== id));
    showToast('✓ Strategic insight dismissed');
  };

  const handleSnoozeInsight = async (id) => {
    await aiIntelligenceService.snoozeInsight(id);
    setInsights((prev) => prev.filter((ins) => ins.id !== id));
    showToast('⏰ Insight snoozed for 24 hours');
  };

  const handleTakeAction = (insight) => {
    showToast(`Demo action executed successfully. No external API action was performed.`);
  };

  const handleCompleteRecommendation = async (id) => {
    await aiIntelligenceService.completeRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    showToast('✓ Growth recommendation marked as completed');
  };

  const handleDismissRecommendation = async (id) => {
    await aiIntelligenceService.dismissRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    showToast('✓ Recommendation dismissed');
  };

  const handleExecuteActionOrchestration = async (act) => {
    const updatedHistory = await aiActionOrchestrator.getActionHistory({ clientId: selectedClient });
    setActionHistory(updatedHistory);
    showToast(`Demo action executed successfully. No external API action was performed.`);
  };

  const handleUndoAction = async (actionId) => {
    const res = await aiActionOrchestrator.undoLastAction(actionId);
    const updatedHistory = await aiActionOrchestrator.getActionHistory({ clientId: selectedClient });
    setActionHistory(updatedHistory);
    showToast(res.message);
  };

  const handleResolveAnomaly = async (id) => {
    await aiIntelligenceService.resolveAnomaly(id);
    setAnomalies((prev) => prev.filter((a) => a.id !== id));
    showToast('✓ Anomaly marked as resolved in sandbox');
  };

  const handleRemediateAnomaly = (anom) => {
    showToast(`Demo remediation executed successfully. No external API action was performed.`);
  };

  const handleModuleNavigation = (targetModule) => {
    if (!targetModule) return;
    const normalized = targetModule.toLowerCase();
    let target = MODULES.DASHBOARD;

    if (normalized.includes('whatsapp')) target = MODULES.WHATSAPP_MARKETING;
    else if (normalized.includes('crm') || normalized.includes('lead')) target = MODULES.LEAD_CRM;
    else if (normalized.includes('ads')) target = MODULES.ADS_PERFORMANCE;
    else if (normalized.includes('seo')) target = MODULES.SEO_COMMAND_CENTER;
    else if (normalized.includes('client')) target = MODULES.CLIENTS;
    else if (normalized.includes('email')) target = MODULES.EMAIL_MARKETING;

    if (onNavigate) {
      onNavigate(target);
    } else {
      showToast(`Navigating to module: ${target}`);
    }
  };

  const handleSearchSelect = (result) => {
    if (result.type === 'CLIENT') {
      setSelectedClient(result.data.clientId);
      showToast(`🏢 Scoped view to ${result.data.clientName}`);
    } else if (result.type === 'INSIGHT') {
      setSelectedInsight(result.data);
      setIsInsightModalOpen(true);
    } else if (result.type === 'ANOMALY') {
      setSelectedAnomaly(result.data);
      setIsAnomalyModalOpen(true);
    } else if (result.type === 'RECOMMENDATION') {
      showToast(`Playbook: "${result.data.title}"`);
    }
  };

  return (
    <div className="ai-intelligence-page-container p-6 space-y-6">
      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Universal Search Bar & Report Trigger */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-xl">
          <IntelligenceSearch onSelectResult={handleSearchSelect} />
        </div>

        <button
          type="button"
          className="btn-ai-primary text-xs flex items-center gap-1.5"
          onClick={handleOpenExecutiveReport}
        >
          <FileText size={13} />
          <span>Executive Intelligence Report (Printable)</span>
        </button>
      </div>

      {/* Row 1: AI Intelligence Header */}
      <AIIntelligenceHeader
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={handleRefresh}
        onGenerateBriefing={handleGenerateBriefing}
        clients={clientsList}
        loading={loading}
      />

      {/* Row 2: Top-Level Executive KPI Cards */}
      <IntelligenceKpiCards
        agencyOverview={agencyOverview}
        selectedClientData={selectedClientData}
        loading={loading}
      />

      {/* Row 3: Multidimensional Business Health (Left) + Executive Daily Briefing (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <BusinessHealthOverview businessHealth={businessHealth} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <DailyBriefingPanel
            dailyBriefing={dailyBriefing}
            onRefreshBriefing={handleGenerateBriefing}
            loading={loading}
          />
        </div>
      </div>

      {/* ====================================================
          SECTION: AI OPERATIONS COMMAND CENTER (STEP 5)
          ==================================================== */}
      <div className="ai-ops-command-card bg-slate-900/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2 border-b border-white/8 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan">
              <Zap size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  AI Operations Command Center
                </h3>
                <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Demo / Sandbox Mode
                </span>
              </div>
              <p className="text-[11px] text-muted">Real-time operational orchestration telemetry and sandbox approval status</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-dim">Execution Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational Sandbox Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Decision Score</span>
            <strong className="text-purple font-bold text-xs">{decisionScoreboard.agencyDecisionScore || 92} / 100</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Business Health</span>
            <strong className="text-emerald-400 font-bold text-xs">{businessHealth.overall?.score || 92} / 100</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Critical Alerts</span>
            <strong className="text-rose-400 font-bold text-xs">1 Active</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Pending Approvals</span>
            <strong className="text-warning font-bold text-xs">2 Directives</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Executed Today</span>
            <strong className="text-cyan font-bold text-xs">{actionHistory.length} Simulated</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Revenue Impact</span>
            <strong className="text-emerald-400 font-bold text-xs">+₹2.19M</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Failed Actions</span>
            <strong className="text-slate-400 font-bold text-xs">0 Errors</strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[9px] text-dim font-bold uppercase block mb-0.5">Rollbacks Ready</span>
            <strong className="text-amber-300 font-bold text-xs">{actionHistory.filter(a => a.rollbackAvailable).length} Available</strong>
          </div>
        </div>

        {/* Multi-Provider Integration Readiness Strip */}
        <div className="mt-3 pt-2.5 border-t border-white/6 flex justify-between items-center flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-1 text-dim">
            <span className="font-semibold text-slate-300">API Readiness:</span>
            <span>Integration Ready / Sandbox Active</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="provider-status-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> WhatsApp: Sandbox
            </span>
            <span className="provider-status-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> CRM: Sandbox
            </span>
            <span className="provider-status-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Ads: Sandbox
            </span>
            <span className="provider-status-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> SEO: Sandbox
            </span>
            <span className="provider-status-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-purple inline-block" /> AI Core: Active
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          SECTION: EXECUTIVE DECISION & ACTION ENGINE
          ==================================================== */}
      <div className="deep-dive-accordion-bar decision-engine-accent">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-warning" />
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Executive Decision Scoreboard &amp; Prescriptive Engine
          </h2>
        </div>
        <button
          type="button"
          className="btn-saas-secondary text-xs flex items-center gap-1"
          onClick={() => setIsDecisionEngineExpanded(!isDecisionEngineExpanded)}
        >
          <span>{isDecisionEngineExpanded ? 'Collapse Decision Engine' : 'Expand Decision Engine'}</span>
          {isDecisionEngineExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isDecisionEngineExpanded && (
        <div className="space-y-6">
          {/* 1. Executive Decision Scoreboard (0–100) */}
          <ExecutiveDecisionScoreboard
            decisionData={decisionScoreboard}
            loading={loading}
          />

          {/* 2. AI Executive Briefing Narrative Synthesis */}
          <ExecutiveSummaryPanel
            summaryData={executiveSummary}
            onExecuteAction={handleExecuteActionOrchestration}
            loading={loading}
          />

          {/* 3. Next Best Action Engine with Cross-Module Navigation */}
          <NextBestActionPanel
            actions={nextBestActions}
            onExecuteAction={handleExecuteActionOrchestration}
            onNavigateModule={handleModuleNavigation}
            onSnoozeAction={(id) => showToast('⏰ Action snoozed for 24 hours')}
            onDismissAction={(id) => {
              setNextBestActions((prev) => prev.filter((a) => a.id !== id));
              showToast('✓ Action dismissed');
            }}
            loading={loading}
          />

          {/* 4. Cross-Module Opportunity Map */}
          <OpportunityMap
            opportunities={opportunityMap}
            onExecuteOpportunity={handleExecuteActionOrchestration}
            loading={loading}
          />

          {/* 5. Revenue Leakage Detector */}
          <RevenueLeakagePanel
            leakageItems={revenueLeakage}
            onFixLeakage={handleExecuteActionOrchestration}
            loading={loading}
          />

          {/* 6. Client Risk Radar */}
          <ClientRiskRadar
            riskClients={clientRiskRadar}
            onSelectClient={(cid) => {
              setSelectedClient(cid);
              showToast(`Scoped view to client workspace`);
            }}
            loading={loading}
          />

          {/* 7. Comprehensive Client Portfolio Comparison */}
          <ClientComparisonMatrix
            clients={clientComparison}
            onSelectClient={(cid) => {
              setSelectedClient(cid);
              showToast(`Scoped view to client workspace`);
            }}
            loading={loading}
          />

          {/* 8. Interactive What-If Growth Scenario Simulator */}
          <WhatIfSimulator />
        </div>
      )}

      {/* Row 4: AI Strategic Insights (Left) + Prescriptive Recommendations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightsPanel
          insights={insights}
          onDismissInsight={handleDismissInsight}
          onSnoozeInsight={handleSnoozeInsight}
          onTakeAction={(ins) => {
            setSelectedInsight(ins);
            setIsInsightModalOpen(true);
          }}
          loading={loading}
        />

        <AIRecommendationsPanel
          recommendations={recommendations}
          onCompleteRecommendation={handleCompleteRecommendation}
          onDismissRecommendation={handleDismissRecommendation}
          onExecuteRecommendation={handleExecuteActionOrchestration}
          loading={loading}
        />
      </div>

      {/* Row 5: Real-Time Machine Learning Anomalies & Outliers */}
      <AnomaliesPanel
        anomalies={anomalies}
        onFixAnomaly={(anom) => {
          setSelectedAnomaly(anom);
          setIsAnomalyModalOpen(true);
        }}
        loading={loading}
      />

      {/* Section Divider & Deep-Dive Trigger Bar */}
      <div className="deep-dive-accordion-bar">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan" />
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Operational Intelligence Deep-Dive &amp; Channel Hub
          </h2>
        </div>
        <button
          type="button"
          className="btn-saas-secondary text-xs flex items-center gap-1"
          onClick={() => setIsDeepDiveExpanded(!isDeepDiveExpanded)}
        >
          <span>{isDeepDiveExpanded ? 'Collapse Deep-Dive' : 'Expand Deep-Dive'}</span>
          {isDeepDiveExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Deep-Dive Operational Panels */}
      {isDeepDiveExpanded && (
        <div className="space-y-6">
          {/* 1. Client Intelligence Dossier */}
          <ClientIntelligencePanel
            clients={clientsList}
            selectedClientId={selectedClient}
            onSelectClient={setSelectedClient}
            loading={loading}
          />

          {/* 2. Omnichannel Performance Matrix */}
          <ChannelPerformanceMatrix
            channels={channels}
            onInvestigateChannel={(chan) => {
              showToast(`Investigating [${chan.channel}]: CPL ${chan.cpl}, ROAS ${chan.roas}`);
            }}
            loading={loading}
          />

          {/* 3. Lead Velocity & Stage Transitions */}
          <LeadVelocityPanel
            leadVelocityData={leadVelocityData}
            loading={loading}
          />

          {/* 4. Multitouch Revenue Attribution */}
          <RevenueAttributionPanel
            revenueData={revenueData}
            loading={loading}
          />

          {/* 5. Multi-Horizon Predictive Forecast Center */}
          <ForecastPanel
            initialTimeframe={timeframe}
            loading={loading}
          />

          {/* 6. Unified AI Action Command Center with Bulk Execution */}
          <AIActionCenter
            insights={insights}
            recommendations={recommendations}
            anomalies={anomalies}
            onExecuteAction={handleExecuteActionOrchestration}
            onReviewItem={(act) => {
              if (act.sourceType === 'INSIGHT') {
                setSelectedInsight(act.rawItem);
                setIsInsightModalOpen(true);
              } else if (act.sourceType === 'ANOMALY') {
                setSelectedAnomaly(act.rawItem);
                setIsAnomalyModalOpen(true);
              } else {
                showToast(`Playbook: "${act.title}"`);
              }
            }}
            onDismissItem={(id, type) => {
              if (type === 'INSIGHT') handleDismissInsight(id);
              else handleDismissRecommendation(id);
            }}
            onSnoozeItem={(id) => handleSnoozeInsight(id)}
            loading={loading}
          />
        </div>
      )}

      {/* Row 6: Live Activity Stream (Simulated Signals) */}
      <AIActivityStream
        streamEvents={activityStream}
        onSelectEvent={(ev) => showToast(`Signal event [${ev.title}]: ${ev.description}`)}
        loading={loading}
      />

      {/* Row 7: Action Audit Trail & Historical Execution Log */}
      <AIActionHistory
        historyItems={actionHistory}
        onUndoAction={handleUndoAction}
        loading={loading}
      />

      {/* Global Intelligence Modals */}
      <InsightDetailModal
        insight={selectedInsight}
        isOpen={isInsightModalOpen}
        onClose={() => {
          setIsInsightModalOpen(false);
          setSelectedInsight(null);
        }}
        onSnooze={handleSnoozeInsight}
        onDismiss={handleDismissInsight}
        onExecute={handleTakeAction}
      />

      <AnomalyDetailModal
        anomaly={selectedAnomaly}
        isOpen={isAnomalyModalOpen}
        onClose={() => {
          setIsAnomalyModalOpen(false);
          setSelectedAnomaly(null);
        }}
        onResolve={handleResolveAnomaly}
        onRemediate={handleRemediateAnomaly}
      />

      <IntelligenceReportModal
        reportData={reportData}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportData(null);
        }}
      />
    </div>
  );
}

export default AIIntelligencePage;
