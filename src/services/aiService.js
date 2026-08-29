import { mockClients } from '../data/mockClients.js';
import { INITIAL_AI_HISTORY, PRESET_TEMPLATES } from '../data/mockAI.js';

let historyState = [...INITIAL_AI_HISTORY];

export const aiService = {
  /**
   * Main Generator Engine
   */
  async generateContent({
    toolId = 'captions',
    clientId = 'c1',
    tone = 'bold',
    prompt = '',
    platform = 'instagram',
    objective = 'engagement',
    creativity = 0.7,
    model = 'pulse-omni-4.5',
    variationsCount = 3,
  }) {
    // Simulate API network latency (600ms)
    await new Promise((res) => setTimeout(res, 650));

    const client = mockClients.find((c) => c.id === clientId) || mockClients[0];
    const clientName = client.name;
    const industry = client.industry;

    const variations = [];

    for (let i = 1; i <= Math.min(variationsCount, 3); i++) {
      let generated = null;

      switch (toolId) {
        case 'captions':
          generated = buildCaptionVariation(i, prompt, clientName, industry, tone, platform, objective);
          break;
        case 'reels':
          generated = buildReelScriptVariation(i, prompt, clientName, industry, tone, platform, objective);
          break;
        case 'pillars':
          generated = buildContentMatrixVariation(i, prompt, clientName, industry, tone, objective);
          break;
        case 'hashtags':
          generated = buildHashtagClusterVariation(i, prompt, clientName, industry, platform);
          break;
        case 'rewrite':
          generated = buildRewriteVariation(i, prompt, clientName, industry, tone);
          break;
        case 'ads':
          generated = buildAdCopyVariation(i, prompt, clientName, industry, tone, objective);
          break;
        default:
          generated = buildCaptionVariation(i, prompt, clientName, industry, tone, platform, objective);
      }

      variations.push(generated);
    }

    const historyItem = {
      id: `hist-${Date.now()}`,
      toolId,
      toolName: getToolDisplayName(toolId),
      clientId: client.id,
      clientName: client.name,
      tone,
      platform,
      objective,
      model,
      prompt: prompt.trim() || 'Custom Prompt',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Today',
      variations,
    };

    // Save to local history
    historyState = [historyItem, ...historyState];

    return {
      success: true,
      historyItem,
      variations,
      meta: {
        modelUsed: model,
        tokensGenerated: Math.floor(Math.random() * 250) + 420,
        generationTimeMs: 650,
      },
    };
  },

  /**
   * Fast Rewriter Engine
   */
  async rewriteContent({ text, targetTone = 'bold', clientName = 'Apex Fitness', platform = 'instagram' }) {
    await new Promise((res) => setTimeout(res, 400));
    return {
      rewrittenText: `✨ [Refined for ${clientName} • ${targetTone.toUpperCase()} Voice]:\n\n${text.trim()}\n\n🚀 Join the conversation below!`,
      wordCount: text.split(/\s+/).length + 12,
    };
  },

  /**
   * History CRUD
   */
  async getHistory() {
    return Promise.resolve([...historyState]);
  },

  async deleteHistory(id) {
    historyState = historyState.filter((h) => h.id !== id);
    return Promise.resolve(true);
  },

  async clearHistory() {
    historyState = [];
    return Promise.resolve(true);
  },

  /**
   * Templates
   */
  getTemplates(toolId = null) {
    if (!toolId || toolId === 'all') return PRESET_TEMPLATES;
    return PRESET_TEMPLATES.filter((t) => t.toolId === toolId);
  },
};

/* --------------------------------------------------------------------------
   GENERATION BUILDER HELPER FUNCTIONS
   -------------------------------------------------------------------------- */

function getToolDisplayName(toolId) {
  const map = {
    captions: 'Captions & Hooks',
    reels: 'Reel & Short Scripts',
    pillars: '30-Day Content Matrix',
    hashtags: 'Hashtag Clusters & SEO',
    rewrite: 'Brand-Voice Rewriter',
    ads: 'Paid Ad Copy & Angles',
  };
  return map[toolId] || 'AI Generator';
}

function buildCaptionVariation(index, prompt, clientName, industry, tone, platform, objective) {
  const cleanedPrompt = prompt.trim() || `Transform your daily workflow with ${clientName}`;

  if (index === 1) {
    return {
      id: `var-${index}`,
      title: 'Variation 1: High-Engagement Viral Hook',
      hook: `Stop doing ${industry.toLowerCase()} the old way. Here is the exact playbook ${clientName} uses to guarantee results: 👇⚡`,
      body: `Most people assume that succeeding in ${industry.toLowerCase()} requires endless hours and overwhelming complexity. In reality, it comes down to 3 non-negotiable fundamentals:\n\n1️⃣ Precision execution over guesswork\n2️⃣ Daily consistency over sporadic sprints\n3️⃣ Aligning your routine with proven frameworks\n\nWhether you are just starting or scaling to the next level, ${clientName} gives you the edge to outperform expectations every single week.`,
      cta: `💬 What is your biggest obstacle right now? Drop a comment below or DM us "GROWTH" for our complimentary guide! 📲 Tap link in bio.`,
      hashtags: [`#${clientName.replace(/\s+/g, '')}`, `#${industry.replace(/\s+/g, '')}Tips`, '#GrowthMindset', '#DailyExcellence', '#HighPerformance'],
      wordCount: 124,
      readingTime: '28s',
      toneScore: '98% On-Brand',
    };
  } else if (index === 2) {
    return {
      id: `var-${index}`,
      title: 'Variation 2: Story-Driven & Social Proof Angle',
      hook: `3 months ago, this seemed almost impossible. Today, it is our new standard. ✨`,
      body: `When we first sat down with our team at ${clientName}, our mission was simple: eliminate friction, elevate quality, and deliver undeniable value to our community.\n\n"${cleanedPrompt}"\n\nBy focusing on sustainable habits and authentic connection, we turned hesitation into consistent momentum. The results speak for themselves.`,
      cta: `👉 Save this post for your weekly planning session and share it with someone who needs this motivation today!`,
      hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#TransformationStory', '#Leadership', '#CommunityFirst', '#InspirationDaily'],
      wordCount: 110,
      readingTime: '24s',
      toneScore: '95% On-Brand',
    };
  } else {
    return {
      id: `var-${index}`,
      title: 'Variation 3: Direct-Action & Fast ROI',
      hook: `Quick question: Is your current ${industry.toLowerCase()} routine actually working for you? 🧐`,
      body: `If your answer is anything less than a resounding "YES", it's time to upgrade. At ${clientName}, we cut through the noise with results-backed solutions:\n\n✓ Zero fluff, all signal\n✓ Custom tailored for high achievers\n✓ Proven track record with 5-star feedback\n\nDon't leave your progress to chance.`,
      cta: `🚀 Click the link in bio to explore our current offerings or tap "Contact Us" to speak with our dedicated specialist today!`,
      hashtags: [`#${clientName.replace(/\s+/g, '')}`, `#${industry.replace(/\s+/g, '')}`, '#ResultsDriven', '#ScaleUp', '#ActionTakers'],
      wordCount: 96,
      readingTime: '20s',
      toneScore: '94% On-Brand',
    };
  }
}

function buildReelScriptVariation(index, prompt, clientName, industry, tone, platform, objective) {
  if (index === 1) {
    return {
      id: `var-${index}`,
      title: 'Variation 1: 30-Second Pattern Interrupt Script',
      hook: `[0:00 - 0:03s] VISUAL: Fast zoom-in on face / action. TEXT OVERLAY: "Stop doing this if you want ${industry.toLowerCase()} results..." AUDIO: Trending bass drop.`,
      body: `[0:03 - 0:12s] VISUAL: B-roll showing the common frustrating mistake. VOICEOVER: "90% of people make this one critical error that completely stalls their progress."\n\n[0:12 - 0:22s] VISUAL: High-tempo cut to the correct technique at ${clientName}. Upbeat track. VOICEOVER: "Instead, do this: switch from reactive chaos to structured daily action."\n\n[0:22 - 0:28s] VISUAL: Smiling team / polished client result showcase.`,
      cta: `[0:28 - 0:32s] VISUAL: Text on screen "Comment 'ACTION' for the full PDF breakdown!" AUDIO: Outro chime.`,
      hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#ReelTutorial', '#ShortFormVideo', '#ViralHook', '#CreatorEconomy'],
      wordCount: 115,
      readingTime: '32s Video',
      toneScore: '99% Dynamic',
    };
  } else {
    return {
      id: `var-${index}`,
      title: 'Variation 2: 45-Second Behind-The-Scenes Voiceover',
      hook: `[0:00 - 0:04s] VISUAL: Aesthetic cinematic B-roll of morning preparation. TEXT: "A Day In The Life with ${clientName}..." AUDIO: Ambient lofi jazz.`,
      body: `[0:04 - 0:20s] VOICEOVER: "Ever wonder what goes on behind the scenes before we launch a major campaign? Here is our exact 3-step preparation ritual."\n\n[0:20 - 0:35s] VISUAL: Fast sequence showing equipment, creative brainstorming, and final product polish. VOICEOVER: "Quality is never an accident; it is always the result of sincere effort and intelligent execution."`,
      cta: `[0:35 - 0:45s] VOICEOVER: "Tap the follow button for daily insider tips and visit our link in bio to join our inner circle."`,
      hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#BehindTheScenes', '#DayInTheLife', '#AgencyVibes', '#AestheticVideo'],
      wordCount: 130,
      readingTime: '45s Video',
      toneScore: '96% Dynamic',
    };
  }
}

function buildContentMatrixVariation(index, prompt, clientName, industry, tone, objective) {
  return {
    id: `var-${index}`,
    title: `Variation ${index}: 4-Week Strategic Pillar Roadmap`,
    hook: `📅 Complete 4-Week Thematic Matrix Engineered for ${clientName} (${industry}):`,
    body: `📌 WEEK 1: FOUNDATIONS & PROBLEM AWARENESS\n• Day 1 (Educational): "The 3 Biggest Myths in ${industry}"\n• Day 3 (Carousel): "Our 5-Step Framework Explained"\n• Day 5 (Reel): "Why Most People Fail at Habit Stacking"\n\n📌 WEEK 2: AUTHORITY & PROOF\n• Day 8 (Case Study): "How We Helped a Client 3X Their Output in 30 Days"\n• Day 10 (Story Poll): "Which of these 2 problems is slowing you down?"\n• Day 12 (Reel): Behind-the-Scenes at ${clientName}\n\n📌 WEEK 3: PRODUCT DEEP-DIVE & VALUE\n• Day 15 (Infographic): "The Science Behind Our Method"\n• Day 17 (Live Q&A): "Ask Our Senior Lead Anything"\n• Day 19 (Short): "1 Hack You Can Test in 60 Seconds"\n\n📌 WEEK 4: CONVERSION & COMMUNITY\n• Day 22 (Testimonial): Video spotlight from real customer\n• Day 24 (Direct Offer): Limited quarterly onboarding open\n• Day 27 (Recap Reel): "The Month in Review + Free Resource Link"`,
    cta: `💾 Click "Export Matrix to Calendar" to automatically generate drafts in your Content Hub for this month!`,
    hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#ContentCalendar', '#MarketingStrategy', '#SocialMediaMatrix', '#GrowthPlanning'],
    wordCount: 185,
    readingTime: '45s',
    toneScore: '97% Comprehensive',
  };
}

function buildHashtagClusterVariation(index, prompt, clientName, industry, platform) {
  const brandTag = `#${clientName.replace(/\s+/g, '')}`;
  const indTag = `#${industry.replace(/\s+/g, '')}`;

  return {
    id: `var-${index}`,
    title: `Variation ${index}: High-Conversion 3-Tier Hashtag Engine`,
    hook: `🎯 Algorithmic Hashtag Distribution (Reach + Niche Authority for ${clientName}):`,
    body: `🌟 MEGA-REACH TIERS (1M+ Posts - High Discovery):\n${indTag} #DigitalMarketing #BusinessGrowth #InspirationDaily #SocialMediaStrategy\n\n🎯 MID-TIER TARGETED (100K-500K - Sweet Spot for Ranking):\n#${industry.replace(/\s+/g, '')}Tips #ScaleYourBrand #ModernEntrepreneur #CreativeAgency #MarketingLife #CommunityBuilding\n\n💎 ULTRA-NICHE / COMMUNITY (10K-100K - Highest Engagement & Retention):\n${brandTag} #${clientName.replace(/\s+/g, '')}Community #${industry.replace(/\s+/g, '')}Daily #ProvenResults #TexasMarketing #AustinFounders`,
    cta: `📋 One-click copy all 18 tags formatted for ${platform.toUpperCase()} first comment or bottom caption.`,
    hashtags: [brandTag, indTag, '#MarketingStrategy', '#ViralReach', '#GrowthHack', '#ContentCreators', '#NicheDominance', '#SEOStrategy'],
    wordCount: 85,
    readingTime: '15s',
    toneScore: '100% Algorithmic',
  };
}

function buildRewriteVariation(index, prompt, clientName, industry, tone) {
  const raw = prompt.trim() || 'We have a great announcement to share with everyone about our growth.';

  return {
    id: `var-${index}`,
    title: `Variation ${index}: Refined in [${tone.toUpperCase()}] Brand Voice`,
    hook: `🚀 Excited to share a major milestone from the team at ${clientName}!`,
    body: `Here is the elevated, publication-ready copy:\n\n"${raw}"\n\nKey Highlights & Takeaways:\n✨ Uncompromising focus on customer outcomes and quality\n✨ Seamless execution powered by our dedicated creative team\n✨ Setting a higher standard for ${industry.toLowerCase()} in 2026 and beyond\n\nThank you to our partners, clients, and community for making this journey extraordinary.`,
    cta: `💬 Let us know your thoughts in the comments or share this update with your network!`,
    hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#Milestone', '#LeadershipInAction', '#CompanyNews', '#Growth'],
    wordCount: 95,
    readingTime: '22s',
    toneScore: '99% Polished',
  };
}

function buildAdCopyVariation(index, prompt, clientName, industry, tone, objective) {
  return {
    id: `var-${index}`,
    title: `Variation ${index}: High-ROAS Direct Response Ad Creative`,
    hook: `🔥 PRIMARY HOOK: Still struggling to scale your ${industry.toLowerCase()} results in 2026?`,
    body: `HEADLINE 1: Experience the ${clientName} Difference Today (Risk-Free)\nHEADLINE 2: 3X Your Results Without The Headache\nHEADLINE 3: Austin's Top-Rated ${industry} Solution\n\nBODY COPY:\nStop settling for average returns. At ${clientName}, we engineer high-performance systems designed specifically for your goals.\n\n• Zero Long-Term Lock-In\n• Dedicated Senior Specialist Assigned\n• Proven Track Record with Over 1,000+ Success Stories\n\nClaim your special introductory offer before spots close this Friday!`,
    cta: `👉 CALL TO ACTION: [Get Offer Now] / [Book Free Strategy Call] - Link: ${clientName.toLowerCase().replace(/\s+/g, '')}.com/special`,
    hashtags: [`#${clientName.replace(/\s+/g, '')}`, '#MetaAds', '#GoogleAds', '#PerformanceMarketing', '#DirectResponse'],
    wordCount: 112,
    readingTime: '25s',
    toneScore: '98% High-Converting',
  };
}

export default aiService;
