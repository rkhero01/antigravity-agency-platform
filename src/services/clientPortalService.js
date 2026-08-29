import { initialMockPortalData } from '../data/mockClientPortal.js';
import { mockClients } from '../data/mockClients.js';

let portalState = JSON.parse(JSON.stringify(initialMockPortalData));

export const clientPortalService = {
  /**
   * Get client portal data
   */
  async getPortalData(clientId = 'c1') {
    const targetId = clientId === 'all' || !portalState[clientId] ? 'c1' : clientId;

    // If client exists in mockClients but not portalState, generate default
    if (!portalState[targetId]) {
      const client = mockClients.find((c) => c.id === targetId) || mockClients[0];
      portalState[targetId] = {
        client: {
          id: client.id,
          name: client.name,
          tagline: `${client.industry} Marketing & Content Hub`,
          logo: client.logo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
          primaryColor: client.brandColors?.primary || '#6366f1',
          subdomain: `${client.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.pulseportal.app`,
          accountManager: `${client.assignedLead || 'Alex Morgan'} (Account Director)`,
          contactEmail: client.contactEmail || 'contact@agency.ai',
        },
        stats: {
          totalDeliverables: 10,
          pendingApproval: 2,
          approvedCount: 8,
          reach: client.metrics?.reach || '45.0K',
          reachDelta: '+12.0%',
          roas: `${client.metrics?.roas || 4.5}x`,
          leads: `${client.metrics?.activeCampaigns || 3} Campaigns Active`,
        },
        posts: [
          {
            id: `post-${targetId}-1`,
            title: `${client.name} Brand Spotlight & Value Proposition`,
            platform: 'Instagram',
            type: 'Reel Video',
            scheduledDate: '2026-09-02 10:00 AM',
            status: 'Needs Approval',
            mediaUrl: client.coverImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
            caption: `Discover what sets ${client.name} apart. Premium execution, verified consistency, and customer-first value.`,
            hashtags: `#${client.name.replace(/\s+/g, '')} #Innovation #Quality #BrandExcellence`,
            author: client.assignedLead || 'Alex Morgan',
            feedback: null,
          },
        ],
        brandAssets: [
          { id: `ba-${targetId}-1`, name: `${client.name} Official Vector Logo`, size: '2.8 MB', type: 'Vector Graphics' },
          { id: `ba-${targetId}-2`, name: 'Brand Style & Copy Guide', size: '4.5 MB', type: 'PDF Document' },
        ],
      };
    }

    return Promise.resolve({ ...portalState[targetId] });
  },

  /**
   * 1-Click Approve Post
   */
  async approvePost(clientId, postId) {
    const targetId = clientId === 'all' || !portalState[clientId] ? 'c1' : clientId;
    if (portalState[targetId]) {
      portalState[targetId].posts = portalState[targetId].posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            status: 'Approved',
            feedback: 'Approved by Client Stakeholder',
          };
        }
        return p;
      });

      // Recalculate pending vs approved
      const pending = portalState[targetId].posts.filter((p) => p.status === 'Needs Approval').length;
      const approved = portalState[targetId].posts.filter((p) => p.status === 'Approved').length;
      portalState[targetId].stats.pendingApproval = pending;
      portalState[targetId].stats.approvedCount = approved;
    }

    return Promise.resolve({ ...portalState[targetId] });
  },

  /**
   * Request Post Revision with Feedback
   */
  async requestRevision(clientId, postId, feedbackText) {
    const targetId = clientId === 'all' || !portalState[clientId] ? 'c1' : clientId;
    if (portalState[targetId]) {
      portalState[targetId].posts = portalState[targetId].posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            status: 'Changes Requested',
            feedback: feedbackText || 'Client requested copy adjustments.',
          };
        }
        return p;
      });
    }

    return Promise.resolve({ ...portalState[targetId] });
  },

  /**
   * Generate Simulated Public Shareable URL
   */
  generatePublicShareableLink(clientId) {
    const targetId = clientId === 'all' ? 'c1' : clientId;
    const client = mockClients.find((c) => c.id === targetId) || mockClients[0];
    const slug = client.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `https://portal.pulseagency.ai/review/${slug}?auth_token=sec_${Date.now().toString(36)}`;
  },
};

export default clientPortalService;
