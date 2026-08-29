import React, { useState, useEffect, useMemo } from 'react';
import {
  AutomationsHeader,
  AutomationsKpiCards,
  AutomationsGrid,
  AutomationLogsTable,
  CreateAutomationModal,
  RecipeTemplatesModal,
} from '../../components/automations/index.js';
import { automationService } from '../../services/automationService.js';
import { CheckCircle2 } from 'lucide-react';

export function AutomationsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [automations, setAutomations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'logs'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecipesModalOpen, setIsRecipesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const [autoData, logData, recipeData] = await Promise.all([
      automationService.getAutomations(),
      automationService.getLogs(),
      automationService.getRecipes(),
    ]);
    setAutomations(autoData);
    setLogs(logData);
    setRecipes(recipeData);
    setLoading(false);
  };

  // Filtered Rules
  const filteredAutomations = useMemo(() => {
    return automations.filter((a) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : a.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : a.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.action.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [automations, selectedCategory, selectedStatus, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return automationService.calculateAutomationMetrics(filteredAutomations, logs);
  }, [filteredAutomations, logs]);

  // Handlers
  const handleToggleStatus = async (id) => {
    const updated = await automationService.toggleAutomation(id);
    setAutomations((prev) => prev.map((a) => (a.id === id ? updated : a)));
    showToast(`Automation rule "${updated.name}" is now ${updated.status}.`);
  };

  const handleCreateAutomation = async (formData) => {
    const created = await automationService.createAutomation(formData);
    setAutomations((prev) => [created, ...prev]);
    showToast(`⚡ Created and activated rule "${created.name}"!`);
  };

  const handleTriggerTest = async (id) => {
    const result = await automationService.triggerTestRun(id);
    if (result) {
      setAutomations((prev) => prev.map((a) => (a.id === id ? result.rule : a)));
      setLogs((prev) => [result.log, ...prev]);
      showToast(`🚀 Test execution successful for "${result.rule.name}"! (Latency: ${result.log.duration})`);
    }
  };

  const handleDeleteAutomation = async (id) => {
    await automationService.deleteAutomation(id);
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    showToast('Automation rule deleted.');
  };

  const handleInstallRecipe = async (recipeId) => {
    const installed = await automationService.installRecipe(recipeId);
    if (installed) {
      setAutomations((prev) => [installed, ...prev]);
      showToast(`✨ Installed recipe template "${installed.name}"!`);
    }
  };

  return (
    <div className="automations-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <AutomationsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenRecipesModal={() => setIsRecipesModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <AutomationsKpiCards metrics={metrics} />

      {/* Main Content: Active Rules Grid or Audit Logs Table */}
      {viewMode === 'grid' ? (
        <AutomationsGrid
          automations={filteredAutomations}
          onToggleStatus={handleToggleStatus}
          onTriggerTest={handleTriggerTest}
          onDeleteAutomation={handleDeleteAutomation}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <AutomationLogsTable logs={logs} />
      )}

      {/* Create Automation Modal */}
      <CreateAutomationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAutomation={handleCreateAutomation}
      />

      {/* Recipe Templates Modal */}
      <RecipeTemplatesModal
        recipes={recipes}
        isOpen={isRecipesModalOpen}
        onClose={() => setIsRecipesModalOpen(false)}
        onInstallRecipe={handleInstallRecipe}
      />
    </div>
  );
}

export default AutomationsPage;
