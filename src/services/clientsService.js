import { initialMockClients } from '../data/mockClients.js';

let clientsState = [...initialMockClients];

export const clientsService = {
  async getClients() {
    return Promise.resolve([...clientsState]);
  },
  async getClientById(id) {
    const client = clientsState.find((c) => c.id === id);
    return Promise.resolve(client || null);
  },
  async addClient(clientData) {
    const newClient = {
      id: `c${Date.now()}`,
      status: 'Active',
      roas: 'N/A (New)',
      activeCampaignsCount: 0,
      totalLeads: 0,
      audienceSize: '0',
      recentPosts: [],
      ...clientData,
    };
    clientsState = [newClient, ...clientsState];
    return Promise.resolve(newClient);
  },
  async updateClient(id, updates) {
    clientsState = clientsState.map((c) => (c.id === id ? { ...c, ...updates } : c));
    return Promise.resolve(clientsState.find((c) => c.id === id));
  },
};
