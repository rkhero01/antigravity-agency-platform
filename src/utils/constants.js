/**
 * Application Constants & Navigation Modules
 */

export const APP_NAME = 'AI Projects';
export const APP_SUBTITLE = 'Social Media Marketing Management OS';
export const APP_VERSION = '1.0.0';

export const MODULES = {
  DASHBOARD: 'dashboard',
  CLIENTS: 'clients',
  SOCIAL_ACCOUNTS: 'social-accounts',
  INBOX: 'inbox',
  CONTENT: 'content',
  AI_ASSISTANT: 'ai-assistant',
  INFLUENCER_HUB: 'influencer-hub',
  ADS_PERFORMANCE: 'ads-performance',
  COMPETITORS: 'competitors',
  TRENDS: 'trends',
  ASSETS: 'assets',
  CAMPAIGN_PLANNER: 'campaigns',
  CONTRACTS: 'contracts',
  SOCIAL_LISTENING: 'listening',
  EMAIL_MARKETING: 'email-marketing',
  SEO_COMMAND_CENTER: 'seo',
  LEAD_CRM: 'crm',
  WHATSAPP_MARKETING: 'whatsapp',
  AI_INTELLIGENCE: 'ai-intelligence',
  AUTOMATIONS: 'automations',
  ANALYTICS: 'analytics',
  TASKS: 'tasks',
  TEAM: 'team',
  REPORTS: 'reports',
  CLIENT_PORTAL: 'client-portal',
  SETTINGS: 'settings',
};

export const NAVIGATION_ITEMS = [
  { id: MODULES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard', badge: null },
  { id: MODULES.CLIENTS, label: 'Clients', icon: 'Users', badge: '24' },
  { id: MODULES.SOCIAL_ACCOUNTS, label: 'Social Accounts', icon: 'Share2', badge: '68' },
  { id: MODULES.INBOX, label: 'Social Inbox', icon: 'MessageSquare', badge: '5' },
  { id: MODULES.CONTENT, label: 'Content', icon: 'CalendarDays', badge: '19' },
  { id: MODULES.AI_ASSISTANT, label: 'AI Assistant', icon: 'Sparkles', badge: 'Pro' },
  { id: MODULES.INFLUENCER_HUB, label: 'Influencer & UGC', icon: 'Users2', badge: 'Hot' },
  { id: MODULES.ADS_PERFORMANCE, label: 'Ads & Performance', icon: 'TrendingUp', badge: null },
  { id: MODULES.COMPETITORS, label: 'Competitor Radar', icon: 'Target', badge: 'Spy' },
  { id: MODULES.TRENDS, label: 'Trend Discovery', icon: 'Flame', badge: 'Viral' },
  { id: MODULES.ASSETS, label: 'Asset Library', icon: 'FolderGit2', badge: 'Vault' },
  { id: MODULES.CAMPAIGN_PLANNER, label: 'Campaign Planner', icon: 'Rocket', badge: 'Plan' },
  { id: MODULES.CONTRACTS, label: 'Contracts & Billing', icon: 'Receipt', badge: 'MRR' },
  { id: MODULES.SOCIAL_LISTENING, label: 'Social Listening', icon: 'Radio', badge: 'Live' },
  { id: MODULES.EMAIL_MARKETING, label: 'Email & SMS CRM', icon: 'Mail', badge: 'CRM' },
  { id: MODULES.SEO_COMMAND_CENTER, label: 'SEO Command Center', icon: 'SearchCheck', badge: 'SEO' },
  { id: MODULES.LEAD_CRM, label: 'Lead CRM & Pipeline', icon: 'UserCheck', badge: 'Hot' },
  { id: MODULES.WHATSAPP_MARKETING, label: 'WhatsApp Automation', icon: 'PhoneCall', badge: 'Meta' },
  { id: MODULES.AI_INTELLIGENCE, label: 'AI Intelligence', icon: 'Brain', badge: 'AI' },
  { id: MODULES.AUTOMATIONS, label: 'Automations', icon: 'Zap', badge: 'Auto' },
  { id: MODULES.ANALYTICS, label: 'Analytics', icon: 'BarChart3', badge: null },
  { id: MODULES.TASKS, label: 'Tasks', icon: 'CheckSquare', badge: '5' },
  { id: MODULES.TEAM, label: 'Team', icon: 'Shield', badge: null },
  { id: MODULES.REPORTS, label: 'Reports', icon: 'FileText', badge: 'New' },
  { id: MODULES.CLIENT_PORTAL, label: 'Client Portal', icon: 'Globe', badge: 'Live' },
  { id: MODULES.SETTINGS, label: 'Settings', icon: 'Settings', badge: null },
];

export const PLATFORMS = {
  META: 'meta',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  GOOGLE_BUSINESS: 'google-business',
  GOOGLE_ADS: 'google-ads',
};

export const CONTENT_STATUSES = {
  DRAFT: 'Draft',
  REVIEW: 'In Review',
  APPROVED: 'Approved',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
};
