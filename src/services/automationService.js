import {
  initialMockAutomations,
  initialMockAutomationLogs,
  initialMockRecipes,
} from '../data/mockAutomations.js';

let automationsState = JSON.parse(JSON.stringify(initialMockAutomations));
let logsState = JSON.parse(JSON.stringify(initialMockAutomationLogs));
let recipesState = JSON.parse(JSON.stringify(initialMockRecipes));

export const automationService = {
  /**
   * Get all automation rules with filtering
   */
  async getAutomations(filters = {}) {
    const { category, status, clientScope, search } = filters;

    let filtered = [...automationsState];

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(
        (a) => a.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (clientScope && clientScope !== 'all') {
      filtered = filtered.filter(
        (a) =>
          a.clientScope === 'All Client Workspaces' ||
          a.clientScope.toLowerCase().includes(clientScope.toLowerCase())
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.trigger.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Toggle Active / Paused state
   */
  async toggleAutomation(id) {
    automationsState = automationsState.map((a) => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Paused' : 'Active';
        return { ...a, status: nextStatus };
      }
      return a;
    });

    const updated = automationsState.find((a) => a.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Create new automation rule
   */
  async createAutomation(data) {
    const newRule = {
      id: `auto-${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.category || 'Content & Publishing',
      trigger: data.trigger || 'Custom Event Trigger',
      action: data.action || 'Custom Automated Action',
      status: 'Active',
      clientScope: data.clientScope || 'All Client Workspaces',
      executionsCount: 0,
      lastRun: 'Never',
      successRate: '100%',
    };

    automationsState = [newRule, ...automationsState];
    return Promise.resolve(newRule);
  },

  /**
   * Delete automation rule
   */
  async deleteAutomation(id) {
    automationsState = automationsState.filter((a) => a.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Execute simulated test run
   */
  async triggerTestRun(id) {
    const rule = automationsState.find((a) => a.id === id);
    if (!rule) return Promise.resolve(null);

    // Update execution stats
    automationsState = automationsState.map((a) =>
      a.id === id
        ? {
            ...a,
            executionsCount: a.executionsCount + 1,
            lastRun: 'Just now (Manual Test)',
          }
        : a
    );

    // Add log
    const newLog = {
      id: `log-${Date.now()}`,
      automationName: rule.name,
      triggerEvent: `Manual test invocation triggered for ${rule.trigger}`,
      actionExecuted: `Action executed successfully: ${rule.action}`,
      clientName: rule.clientScope,
      timestamp: 'Just now',
      status: 'Success',
      duration: '310ms',
    };

    logsState = [newLog, ...logsState];
    return Promise.resolve({ rule, log: newLog });
  },

  /**
   * Get execution audit logs
   */
  async getLogs() {
    return Promise.resolve([...logsState]);
  },

  /**
   * Get pre-built recipe templates
   */
  async getRecipes() {
    return Promise.resolve([...recipesState]);
  },

  /**
   * Install a recipe template
   */
  async installRecipe(recipeId, clientScope = 'All Client Workspaces') {
    const recipe = recipesState.find((r) => r.id === recipeId);
    if (!recipe) return Promise.resolve(null);

    const newRule = {
      id: `auto-${Date.now()}`,
      name: recipe.title,
      description: recipe.description,
      category: recipe.category,
      trigger: recipe.trigger,
      action: recipe.action,
      status: 'Active',
      clientScope,
      executionsCount: 0,
      lastRun: 'Never',
      successRate: '100%',
    };

    automationsState = [newRule, ...automationsState];
    return Promise.resolve(newRule);
  },

  /**
   * Compute aggregate automation metrics
   */
  calculateAutomationMetrics(automations, logs) {
    const activeCount = automations.filter((a) => a.status === 'Active').length;
    const totalExecutions = automations.reduce(
      (sum, a) => sum + (a.executionsCount || 0),
      0
    );

    return {
      activeCount,
      totalExecutions: `${totalExecutions} Runs`,
      hoursSaved: '184 Hours / mo',
      successRate: '99.8%',
      triggeredToday: `${logs.length * 6} Actions`,
    };
  },
};

export default automationService;
