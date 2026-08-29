import {
  initialMockAudios,
  initialMockHashtags,
  initialMockSavedSets,
  initialMockTopicForecasts,
} from '../data/mockTrends.js';
import { mockClients } from '../data/mockClients.js';

let audiosState = JSON.parse(JSON.stringify(initialMockAudios));
let hashtagsState = JSON.parse(JSON.stringify(initialMockHashtags));
let savedSetsState = JSON.parse(JSON.stringify(initialMockSavedSets));
let forecastsState = JSON.parse(JSON.stringify(initialMockTopicForecasts));

export const trendService = {
  /**
   * Get trending audio tracks
   */
  async getAudios(filters = {}) {
    const { genre, platform, search } = filters;

    let filtered = [...audiosState];

    if (genre && genre !== 'all') {
      filtered = filtered.filter(
        (a) => a.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter((a) =>
        a.platform.toLowerCase().includes(platform.toLowerCase())
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get hashtag exploration library
   */
  async getHashtags(filters = {}) {
    const { platform, competition, search } = filters;

    let filtered = [...hashtagsState];

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (h) => h.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (competition && competition !== 'all') {
      filtered = filtered.filter(
        (h) => h.competition.toLowerCase() === competition.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((h) => h.tag.toLowerCase().includes(q));
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get saved hashtag sets
   */
  async getSavedSets(clientId = 'all') {
    let filtered = [...savedSetsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((s) => s.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Save a new hashtag cluster set
   */
  async saveHashtagSet(setData) {
    const client = mockClients.find((c) => c.id === setData.clientId) || mockClients[0];
    const tagsArray = Array.isArray(setData.hashtags)
      ? setData.hashtags
      : setData.hashtags
          .split(/[\s,]+/)
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
          .filter(Boolean);

    const newSet = {
      id: `set-${Date.now()}`,
      name: setData.name,
      clientId: client.id,
      clientName: client.name,
      tagsCount: tagsArray.length,
      hashtags: tagsArray,
    };

    savedSetsState = [newSet, ...savedSetsState];
    return Promise.resolve(newSet);
  },

  /**
   * Delete saved hashtag set
   */
  async deleteHashtagSet(id) {
    savedSetsState = savedSetsState.filter((s) => s.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Get viral topic forecasts
   */
  async getTopicForecasts(clientId = 'all') {
    let filtered = [...forecastsState];
    if (clientId && clientId !== 'all') {
      const client = mockClients.find((c) => c.id === clientId);
      if (client) {
        filtered = filtered.filter((f) => f.niche === client.name);
      }
    }
    return Promise.resolve(filtered);
  },

  /**
   * AI Hashtag Generator (3-Tier Balanced Engine)
   */
  async generateAIHashtags(clientId, topicPrompt = 'Brand Growth') {
    const client = mockClients.find((c) => c.id === clientId) || mockClients[0];
    const cleanClient = client.name.replace(/\s+/g, '');
    const cleanTopic = topicPrompt.replace(/\s+/g, '');

    const generatedTags = [
      `#${cleanClient}`,
      `#${cleanClient}Community`,
      `#${cleanTopic}`,
      `#${cleanTopic}Daily`,
      `#${cleanTopic}Tips`,
      '#ViralReach',
      '#OrganicGrowth',
      '#TrendingTopic',
      '#ContentCreators',
      '#SocialMediaMarketing',
      '#HighPerformance',
      '#DailyInspiration',
      '#BrandExcellence',
      '#AlgorithmGrowth',
      '#ExplorePage',
    ];

    return Promise.resolve({
      clusterName: `${client.name} - ${topicPrompt} Viral Cluster`,
      tags: generatedTags,
    });
  },

  /**
   * Calculate summary metrics
   */
  calculateTrendMetrics(audios, hashtags, sets, forecasts) {
    return {
      trendsTracked: '24 Trends Tracked',
      audioTracks: `${audios.length} Trending Sounds`,
      savedSets: `${sets.length} Saved Bundles`,
      trendVelocity: '+280% Surge',
      aiForecasts: `${forecasts.length} Active Forecasts`,
    };
  },
};

export default trendService;
