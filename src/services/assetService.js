import { initialMockAssets, initialMockStorageMetrics } from '../data/mockAssets.js';
import { mockClients } from '../data/mockClients.js';

let assetsState = JSON.parse(JSON.stringify(initialMockAssets));
let storageState = JSON.parse(JSON.stringify(initialMockStorageMetrics));

export const assetService = {
  /**
   * Get all media assets with filtering
   */
  async getAssets(filters = {}) {
    const { clientId, type, aspectRatio, search } = filters;

    let filtered = [...assetsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }

    if (type && type !== 'all') {
      filtered = filtered.filter(
        (a) => a.type.toLowerCase() === type.toLowerCase()
      );
    }

    if (aspectRatio && aspectRatio !== 'all') {
      filtered = filtered.filter(
        (a) => a.aspectRatio.toLowerCase() === aspectRatio.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.clientName.toLowerCase().includes(q) ||
          a.format.toLowerCase().includes(q) ||
          a.aiTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single asset by ID
   */
  async getAssetById(id) {
    const asset = assetsState.find((a) => a.id === id);
    return Promise.resolve(asset || null);
  },

  /**
   * Upload new media asset
   */
  async uploadAsset(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newAsset = {
      id: `ast-${Date.now()}`,
      title: data.title,
      clientId: client.id,
      clientName: client.name,
      type: data.type || 'Image',
      aspectRatio: data.aspectRatio || '1:1',
      resolution: data.resolution || '1080 x 1080',
      fileSize: data.fileSize || '3.2 MB',
      format: data.format || 'WEBP',
      url: data.url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      aiTags: data.aiTags || ['Marketing', 'Brand Asset', 'High Resolution', 'New Upload'],
      usedCount: 0,
      uploadedAt: 'Just now',
      uploader: 'Agency Creative Director',
    };

    assetsState = [newAsset, ...assetsState];
    return Promise.resolve(newAsset);
  },

  /**
   * Delete asset
   */
  async deleteAsset(id) {
    assetsState = assetsState.filter((a) => a.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Get storage metrics
   */
  async getStorageMetrics() {
    return Promise.resolve(storageState);
  },

  /**
   * Calculate summary KPI metrics
   */
  calculateAssetMetrics(assetsList) {
    const total = assetsList.length;
    const videos = assetsList.filter((a) => a.type === 'Video').length;
    return {
      totalAssets: `${total + 1274} Files`,
      storageUsed: storageState.usedBytes,
      totalQuota: storageState.totalQuota,
      percentageUsed: storageState.percentageUsed,
      videoAssets: `${videos + 338} 4K Videos`,
      aiTagged: '1,190 Items (93%)',
      bandwidth: storageState.monthlyBandwidth,
    };
  },
};

export default assetService;
