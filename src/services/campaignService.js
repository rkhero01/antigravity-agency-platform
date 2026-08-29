/**
 * Campaign Service Re-export for Backward Compatibility
 */

export {
  campaignsService,
  campaignService,
  adsService,
  CAMPAIGN_PLATFORMS,
  CAMPAIGN_OBJECTIVES,
  normalizeCampaign,
  toDbCampaignPayload,
} from './campaignsService.js';

export { campaignsService as default } from './campaignsService.js';
