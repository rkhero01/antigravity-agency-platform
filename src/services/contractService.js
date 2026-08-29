import { initialMockContracts } from '../data/mockContracts.js';
import { mockClients } from '../data/mockClients.js';

let contractsState = JSON.parse(JSON.stringify(initialMockContracts));

export const contractService = {
  /**
   * Get all contracts & proposals with filtering
   */
  async getContracts(filters = {}) {
    const { clientId, status, search } = filters;

    let filtered = [...contractsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.signatory.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single contract by ID
   */
  async getContractById(id) {
    const cnt = contractsState.find((c) => c.id === id);
    return Promise.resolve(cnt || null);
  },

  /**
   * Create new retainer contract or proposal
   */
  async createContract(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const feeNumber = parseInt(data.monthlyFee.replace(/[^0-9]/g, '') || '8000', 10);
    const annualNumber = feeNumber * 12;

    const deliverablesArray = Array.isArray(data.scopeDeliverables)
      ? data.scopeDeliverables
      : data.scopeDeliverables
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

    const newContract = {
      id: `cnt-${Date.now()}`,
      title: data.title,
      clientId: client.id,
      clientName: client.name,
      status: data.status || 'Draft Proposal',
      monthlyFee: `$${feeNumber.toLocaleString()}`,
      annualValue: `$${annualNumber.toLocaleString()}`,
      billingCycle: data.billingCycle || 'Monthly Auto-Charge (1st of month)',
      startDate: data.startDate || 'Oct 01, 2026',
      renewalDate: data.renewalDate || 'Sep 30, 2027',
      termMonths: parseInt(data.termMonths || '12', 10),
      signatory: data.signatory || 'Pending Client Authorized Signature',
      scopeDeliverables: deliverablesArray.length > 0 ? deliverablesArray : [
        '20 Dedicated Multi-Channel Posts / month',
        'Managed Paid Ad Campaigns ($25,000 / mo budget limit)',
        'Bi-Weekly Strategic Growth & Conversion Audits',
      ],
      invoices: [],
    };

    contractsState = [newContract, ...contractsState];
    return Promise.resolve(newContract);
  },

  /**
   * Update status
   */
  async updateContractStatus(id, newStatus) {
    const idx = contractsState.findIndex((c) => c.id === id);
    if (idx !== -1) {
      contractsState[idx].status = newStatus;
      return Promise.resolve(contractsState[idx]);
    }
    return Promise.resolve(null);
  },

  /**
   * Delete contract
   */
  async deleteContract(id) {
    contractsState = contractsState.filter((c) => c.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Get all invoices across clients
   */
  async getInvoices(clientId = 'all') {
    let allInvoices = [];
    contractsState.forEach((c) => {
      if (clientId === 'all' || c.clientId === clientId) {
        c.invoices.forEach((inv) => {
          allInvoices.push({
            ...inv,
            clientId: c.clientId,
            clientName: c.clientName,
            contractTitle: c.title,
          });
        });
      }
    });
    return Promise.resolve(allInvoices);
  },

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(invoiceId) {
    contractsState.forEach((c) => {
      c.invoices.forEach((inv) => {
        if (inv.id === invoiceId) {
          inv.status = 'Paid';
        }
      });
    });
    return Promise.resolve(true);
  },

  /**
   * AI Proposal Synthesizer
   */
  async generateAIProposal(clientId, tier = 'Growth Accelerator') {
    const client = mockClients.find((c) => c.id === clientId) || mockClients[0];
    const tierPricing = {
      'Starter Foundation': { fee: '$5,500 / mo', acv: '$66,000', posts: '15 Posts', ads: '$15K Managed Spend' },
      'Growth Accelerator': { fee: '$11,000 / mo', acv: '$132,000', posts: '28 Posts', ads: '$50K Managed Spend' },
      'Enterprise Scale': { fee: '$22,500 / mo', acv: '$270,000', posts: '45 Posts', ads: '$100K+ Managed Spend' },
    };

    const config = tierPricing[tier] || tierPricing['Growth Accelerator'];

    return Promise.resolve({
      proposalTitle: `${client.name} — Full-Funnel ${tier} Retainer Proposal`,
      tierName: tier,
      monthlyFee: config.fee,
      annualValue: config.acv,
      executiveSummary: `Antigravity Agency proposes a comprehensive 12-month commercial engagement designed to accelerate ${client.name}'s market share, optimize customer acquisition cost (CAC), and scale omnichannel digital revenue.`,
      deliverables: [
        `${config.posts} per month across Meta, TikTok, LinkedIn & YouTube`,
        `Omnichannel Paid Media Optimization (${config.ads})`,
        'Weekly Creative Asset Refresh & Automated AI Copywriting',
        '24/7 Social Inbox Response Moderation & Lead Routing',
        'Dedicated Senior Strategist & Monthly Executive Performance Reviews',
      ],
      terms: '12-Month Commitment with 30-Day Mutual Performance Review Clause.',
    });
  },

  /**
   * Calculate financial summary metrics
   */
  calculateContractMetrics(contractsList) {
    const activeContracts = contractsList.filter((c) => c.status === 'Active Retainer');
    const totalMrr = activeContracts.reduce((acc, curr) => {
      const val = parseInt(curr.monthlyFee.replace(/[^0-9]/g, '') || '0', 10);
      return acc + val;
    }, 0);

    const count = activeContracts.length;
    const avgMrr = count > 0 ? Math.round(totalMrr / count) : 0;

    return {
      mrr: `$${totalMrr.toLocaleString()} MRR`,
      activeRetainers: `${count} Active Retainers`,
      avgContractValue: `$${avgMrr.toLocaleString()} / mo ACV`,
      renewalRate: '98.2% Renewed',
      overdueInvoices: '$0 Overdue',
    };
  },
};

export default contractService;
