/**
 * Unified Reactive React Hooks Data Layer
 * Task 28 — Step 4: Full Frontend Data Access Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api/apiClient.js';
import { authSessionService } from '../services/authSessionService.js';
import { initialMockClients } from '../data/mockClients.js';
import { initialMockTeam } from '../data/mockTeam.js';
import { initialMockLeads, initialMockContacts } from '../data/mockCRM.js';
import { initialMockCampaigns } from '../data/mockCampaigns.js';
import { mockSEOKeywords, mockSEOTasks } from '../data/mockSEO.js';
import { initialMockContracts, initialMockInvoices } from '../data/mockContracts.js';

// -----------------------------------------------------------------------------
// 1. Authentication & Session Hook
// -----------------------------------------------------------------------------
export function useAuth() {
  const [user, setUser] = useState(() => authSessionService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authSessionService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    authSessionService.restoreSession().catch(() => {});
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    return authSessionService.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    return authSessionService.logout();
  }, []);

  return {
    user,
    role: user?.role || 'OPERATOR',
    permissions: user?.permissions || [],
    agencyId: user?.agencyId || 'agency-demo-001',
    isAuthenticated: authSessionService.isAuthenticated(),
    login,
    logout,
  };
}

// -----------------------------------------------------------------------------
// 2. Agency Settings Hook
// -----------------------------------------------------------------------------
export function useAgency() {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgency = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.agency.get();
      setAgency(res.data.agency);
    } catch (err) {
      setError(err);
      // Fallback
      setAgency({
        id: 'agency-demo-001',
        name: 'Antigravity Agency Global',
        domain: 'antigravity.agency',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgency();
  }, [fetchAgency]);

  const updateAgency = useCallback(async (updates) => {
    try {
      const res = await apiClient.agency.update(updates);
      setAgency(res.data.agency);
      return res.data.agency;
    } catch (err) {
      setAgency((prev) => (prev ? { ...prev, ...updates } : updates));
      throw err;
    }
  }, []);

  return { agency, loading, error, refresh: fetchAgency, updateAgency };
}

// -----------------------------------------------------------------------------
// 3. Client Management Hook
// -----------------------------------------------------------------------------
export function useClients(filters = {}) {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.clients.list(filters);
      const data = Array.isArray(res.data) ? res.data : res.data.clients || [];
      setClients(data);
      setMeta(res.meta || {});
    } catch (err) {
      setError(err);
      setClients(initialMockClients);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(async (clientData) => {
    try {
      const res = await apiClient.clients.create(clientData);
      const created = res.data.client || res.data;
      setClients((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      // Optimistic fallback
      const fallback = { id: `c${Date.now()}`, ...clientData, status: 'Active' };
      setClients((prev) => [fallback, ...prev]);
      return fallback;
    }
  }, []);

  const updateClient = useCallback(async (id, updates) => {
    try {
      const res = await apiClient.clients.update(id, updates);
      const updated = res.data.client || res.data;
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      return updated;
    } catch (err) {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      await apiClient.clients.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  }, []);

  return { clients, meta, loading, error, refresh: fetchClients, createClient, updateClient, deleteClient };
}

// -----------------------------------------------------------------------------
// 4. CRM Leads Hook
// -----------------------------------------------------------------------------
export function useLeads(clientId = null, filters = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (clientId && clientId !== 'all') params.clientId = clientId;
      const res = await apiClient.leads.list(params);
      const data = Array.isArray(res.data) ? res.data : res.data.leads || [];
      setLeads(data);
    } catch (err) {
      setError(err);
      setLeads(initialMockLeads || []);
    } finally {
      setLoading(false);
    }
  }, [clientId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = useCallback(async (leadData) => {
    const res = await apiClient.leads.create(leadData);
    const created = res.data.lead || res.data;
    setLeads((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateLead = useCallback(async (id, updates) => {
    const res = await apiClient.leads.update(id, updates);
    const updated = res.data.lead || res.data;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    return updated;
  }, []);

  const deleteLead = useCallback(async (id) => {
    await apiClient.leads.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { leads, loading, error, refresh: fetchLeads, createLead, updateLead, deleteLead };
}

// -----------------------------------------------------------------------------
// 5. Client Contacts Hook
// -----------------------------------------------------------------------------
export function useContacts(clientId = null, filters = {}) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (clientId && clientId !== 'all') params.clientId = clientId;
      const res = await apiClient.contacts.list(params);
      const data = Array.isArray(res.data) ? res.data : res.data.contacts || [];
      setContacts(data);
    } catch (err) {
      setError(err);
      setContacts(initialMockContacts || []);
    } finally {
      setLoading(false);
    }
  }, [clientId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (contactData) => {
    const res = await apiClient.contacts.create(contactData);
    const created = res.data.contact || res.data;
    setContacts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateContact = useCallback(async (id, updates) => {
    const res = await apiClient.contacts.update(id, updates);
    const updated = res.data.contact || res.data;
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    return updated;
  }, []);

  const deleteContact = useCallback(async (id) => {
    await apiClient.contacts.delete(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { contacts, loading, error, refresh: fetchContacts, createContact, updateContact, deleteContact };
}

// -----------------------------------------------------------------------------
// 6. Paid Media Campaigns Hook
// -----------------------------------------------------------------------------
export function useCampaigns(clientId = null, filters = {}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (clientId && clientId !== 'all') params.clientId = clientId;
      const res = await apiClient.campaigns.list(params);
      const data = Array.isArray(res.data) ? res.data : res.data.campaigns || [];
      setCampaigns(data);
    } catch (err) {
      setError(err);
      setCampaigns(initialMockCampaigns || []);
    } finally {
      setLoading(false);
    }
  }, [clientId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = useCallback(async (campData) => {
    const res = await apiClient.campaigns.create(campData);
    const created = res.data.campaign || res.data;
    setCampaigns((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCampaign = useCallback(async (id, updates) => {
    const res = await apiClient.campaigns.update(id, updates);
    const updated = res.data.campaign || res.data;
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    return updated;
  }, []);

  return { campaigns, loading, error, refresh: fetchCampaigns, createCampaign, updateCampaign };
}

// -----------------------------------------------------------------------------
// 7. Team Management Hook
// -----------------------------------------------------------------------------
export function useTeam(filters = {}) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.team.list(filters);
      const data = Array.isArray(res.data) ? res.data : res.data.team || [];
      setTeam(data);
    } catch (err) {
      setError(err);
      setTeam(initialMockTeam || []);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const createMember = useCallback(async (memberData) => {
    const res = await apiClient.team.create(memberData);
    const created = res.data.member || res.data;
    setTeam((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateMember = useCallback(async (id, updates) => {
    const res = await apiClient.team.update(id, updates);
    const updated = res.data.member || res.data;
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    return updated;
  }, []);

  const deleteMember = useCallback(async (id) => {
    await apiClient.team.delete(id);
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { team, loading, error, refresh: fetchTeam, createMember, updateMember, deleteMember };
}

// -----------------------------------------------------------------------------
// 8. WhatsApp Center Hook (Conversations, Templates, Automations, Follow-ups)
// -----------------------------------------------------------------------------
export function useWhatsApp(clientId = null) {
  const [conversations, setConversations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = clientId && clientId !== 'all' ? { clientId } : {};
      const [cRes, tRes, aRes, fRes] = await Promise.all([
        apiClient.whatsapp.conversations.list(params).catch(() => ({ data: [] })),
        apiClient.whatsapp.templates.list(params).catch(() => ({ data: [] })),
        apiClient.whatsapp.automations.list(params).catch(() => ({ data: [] })),
        apiClient.whatsapp.followUps.list(params).catch(() => ({ data: [] })),
      ]);

      setConversations(Array.isArray(cRes.data) ? cRes.data : []);
      setTemplates(Array.isArray(tRes.data) ? tRes.data : []);
      setAutomations(Array.isArray(aRes.data) ? aRes.data : []);
      setFollowUps(Array.isArray(fRes.data) ? fRes.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addMessage = useCallback(async (conversationId, messageData) => {
    const res = await apiClient.whatsapp.conversations.addMessage(conversationId, messageData);
    return res.data.message || res.data;
  }, []);

  return {
    conversations,
    templates,
    automations,
    followUps,
    loading,
    error,
    refresh: fetchAll,
    addMessage,
  };
}

// -----------------------------------------------------------------------------
// 9. SEO Tracking Hook (Keywords & Tasks)
// -----------------------------------------------------------------------------
export function useSEO(clientId = null) {
  const [keywords, setKeywords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSEO = useCallback(async () => {
    setLoading(true);
    try {
      const params = clientId && clientId !== 'all' ? { clientId } : {};
      const [kRes, tRes] = await Promise.all([
        apiClient.seo.keywords.list(params).catch(() => ({ data: mockSEOKeywords || [] })),
        apiClient.seo.tasks.list(params).catch(() => ({ data: mockSEOTasks || [] })),
      ]);

      setKeywords(Array.isArray(kRes.data) ? kRes.data : []);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (err) {
      setError(err);
      setKeywords(mockSEOKeywords || []);
      setTasks(mockSEOTasks || []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchSEO();
  }, [fetchSEO]);

  const createKeyword = useCallback(async (data) => {
    const res = await apiClient.seo.keywords.create(data);
    const created = res.data.keyword || res.data;
    setKeywords((prev) => [created, ...prev]);
    return created;
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await apiClient.seo.tasks.create(data);
    const created = res.data.task || res.data;
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  return { keywords, tasks, loading, error, refresh: fetchSEO, createKeyword, createTask };
}

// -----------------------------------------------------------------------------
// 10. Contracts & Billing Hook
// -----------------------------------------------------------------------------
export function useContracts(clientId = null) {
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = clientId && clientId !== 'all' ? { clientId } : {};
      const [cRes, iRes] = await Promise.all([
        apiClient.contracts.list(params).catch(() => ({ data: initialMockContracts || [] })),
        apiClient.contracts.invoices.list(params).catch(() => ({ data: initialMockInvoices || [] })),
      ]);

      setContracts(Array.isArray(cRes.data) ? cRes.data : []);
      setInvoices(Array.isArray(iRes.data) ? iRes.data : []);
    } catch (err) {
      setError(err);
      setContracts(initialMockContracts || []);
      setInvoices(initialMockInvoices || []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const createContract = useCallback(async (data) => {
    const res = await apiClient.contracts.create(data);
    const created = res.data.contract || res.data;
    setContracts((prev) => [created, ...prev]);
    return created;
  }, []);

  const createInvoice = useCallback(async (data) => {
    const res = await apiClient.contracts.invoices.create(data);
    const created = res.data.invoice || res.data;
    setInvoices((prev) => [created, ...prev]);
    return created;
  }, []);

  return { contracts, invoices, loading, error, refresh: fetchContracts, createContract, createInvoice };
}

// -----------------------------------------------------------------------------
// 11. AI Intelligence Signals & Execution Hook
// -----------------------------------------------------------------------------
export function useAI(clientId = null) {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAI = useCallback(async () => {
    setLoading(true);
    try {
      const params = clientId && clientId !== 'all' ? { clientId } : {};
      const [ins, rec, anom] = await Promise.all([
        apiClient.ai.insights(params).catch(() => ({ data: [] })),
        apiClient.ai.recommendations(params).catch(() => ({ data: [] })),
        apiClient.ai.anomalies(params).catch(() => ({ data: [] })),
      ]);
      setInsights(Array.isArray(ins.data) ? ins.data : []);
      setRecommendations(Array.isArray(rec.data) ? rec.data : []);
      setAnomalies(Array.isArray(anom.data) ? anom.data : []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAI();
  }, [fetchAI]);

  const executeAction = useCallback(async (actionId, options = {}) => {
    return apiClient.actions.execute(actionId, options);
  }, []);

  const rollbackAction = useCallback(async (actionId, options = {}) => {
    return apiClient.actions.rollback(actionId, options);
  }, []);

  return { insights, recommendations, anomalies, loading, refresh: fetchAI, executeAction, rollbackAction };
}

// -----------------------------------------------------------------------------
// 12. System Health Hook
// -----------------------------------------------------------------------------
export function useSystemHealth() {
  const [health, setHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [providersHealth, setProvidersHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const [h, db, prov] = await Promise.all([
        apiClient.health.system().catch(() => ({ data: { status: 'Offline Demo Sandbox' } })),
        apiClient.health.database().catch(() => ({ data: { status: 'Demo In-Memory Mode' } })),
        apiClient.health.providers().catch(() => ({ data: { providers: [] } })),
      ]);
      setHealth(h.data);
      setDbHealth(db.data);
      setProvidersHealth(prov.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { health, dbHealth, providersHealth, loading, refresh: fetchHealth };
}
