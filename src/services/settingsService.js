import { initialMockSettings } from '../data/mockSettings.js';

let settingsState = JSON.parse(JSON.stringify(initialMockSettings));

export const settingsService = {
  /**
   * Get all settings
   */
  async getSettings() {
    return Promise.resolve({ ...settingsState });
  },

  /**
   * Save a specific settings section
   */
  async saveSettings(section, updatedValues) {
    if (settingsState[section]) {
      settingsState[section] = {
        ...settingsState[section],
        ...updatedValues,
      };
    }
    return Promise.resolve({ ...settingsState });
  },

  /**
   * Toggle an integration connection
   */
  async toggleIntegration(id) {
    settingsState.integrations = settingsState.integrations.map((intg) => {
      if (intg.id === id) {
        const isConn = intg.status === 'Connected';
        return {
          ...intg,
          status: isConn ? 'Disconnected' : 'Connected',
          lastSync: isConn ? 'Disconnected' : 'Just synced (Now)',
        };
      }
      return intg;
    });
    return Promise.resolve([...settingsState.integrations]);
  },

  /**
   * Test webhook endpoint
   */
  async testWebhook(id) {
    settingsState.webhooks = settingsState.webhooks.map((wh) => {
      if (wh.id === id) {
        return {
          ...wh,
          lastTriggered: 'Tested just now (200 OK - 42ms response)',
        };
      }
      return wh;
    });
    return Promise.resolve(true);
  },

  /**
   * Add new webhook
   */
  async addWebhook(data) {
    const newWebhook = {
      id: `wh-${Date.now()}`,
      name: data.name || 'New Endpoint',
      url: data.url,
      events: data.events || ['post.published'],
      status: 'Active',
      lastTriggered: 'Created (Pending first trigger)',
    };
    settingsState.webhooks = [...settingsState.webhooks, newWebhook];
    return Promise.resolve(newWebhook);
  },

  /**
   * Delete webhook
   */
  async deleteWebhook(id) {
    settingsState.webhooks = settingsState.webhooks.filter((wh) => wh.id !== id);
    return Promise.resolve(true);
  },
};

export default settingsService;
