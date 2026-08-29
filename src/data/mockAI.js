export const AI_MODELS = [
  { id: 'pulse-omni-4.5', name: 'PulseAI Omni-4.5 Ultra', tag: 'Recommended', speed: 'Fast (1.2s)', tokens: '128k' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', tag: 'Creative Lead', speed: 'Deep Reasoning', tokens: '200k' },
  { id: 'gpt-4o-marketing', name: 'GPT-4o Marketing Fine-Tuned', tag: 'Direct Response', speed: 'Ultra-fast (0.8s)', tokens: '128k' },
  { id: 'deepseek-r1-strategy', name: 'DeepSeek R1 Strategy', tag: 'Analytical', speed: 'In-depth', tokens: '64k' },
];

export const AI_TOOLS = [
  {
    id: 'captions',
    name: 'Captions & Hooks',
    iconName: 'Sparkles',
    badge: 'Popular',
    desc: 'High-converting social captions with attention hooks & CTAs',
    defaultPrompt: 'Promote our new seasonal launch highlighting sustainable benefits and organic ingredients.',
  },
  {
    id: 'reels',
    name: 'Reel & Short Scripts',
    iconName: 'Video',
    badge: 'Viral',
    desc: 'Timestamped 15-60s video scripts with visual & audio cues',
    defaultPrompt: 'Create a 30-second high-energy workout breakdown script showcasing morning mobility routines.',
  },
  {
    id: 'pillars',
    name: '30-Day Content Matrix',
    iconName: 'CalendarRange',
    badge: 'Strategy',
    desc: 'Multi-week structured topic pillars and engagement angles',
    defaultPrompt: 'Generate a 4-week thematic content matrix for our B2B SaaS launch targeting marketing directors.',
  },
  {
    id: 'hashtags',
    name: 'Hashtag Clusters & SEO',
    iconName: 'Hash',
    badge: 'SEO',
    desc: 'Niche, medium, and high-reach tag clusters tailored to algorithms',
    defaultPrompt: 'Curate high-performance Instagram and TikTok hashtags for specialty artisanal coffee roasting.',
  },
  {
    id: 'rewrite',
    name: 'Brand-Voice Rewriter',
    iconName: 'Wand2',
    badge: 'Polisher',
    desc: 'Transform raw notes, bullet points, or drafts into on-brand copy',
    defaultPrompt: 'We just won the 2026 Boutique Law Firm of the Year award in NYC. Draft is: we won an award, very excited, thanks team and clients.',
  },
  {
    id: 'ads',
    name: 'Paid Ad Copy & Angles',
    iconName: 'Megaphone',
    badge: 'ROAS',
    desc: 'Meta & Google Ads primary texts, killer headlines, and benefit hooks',
    defaultPrompt: 'Write 3 high-converting Meta ad angles for our 7-day gym trial targeting local professionals.',
  },
];

export const VOICE_TONES = [
  { id: 'bold', label: 'Bold, Punchy & Energetic', emoji: '🔥', desc: 'Direct, inspiring, and high enthusiasm' },
  { id: 'professional', label: 'Executive & Authoritative', emoji: '👔', desc: 'Credible, data-informed, and polished' },
  { id: 'friendly', label: 'Warm, Authentic & Relatable', emoji: '✨', desc: 'Conversational, community-focused, and caring' },
  { id: 'luxury', label: 'Luxury, Refined & Minimalist', emoji: '💎', desc: 'Elevated, aspirational, and sophisticated' },
  { id: 'educational', label: 'Actionable & Educational', emoji: '🧠', desc: 'Step-by-step, insight-dense, and instructive' },
  { id: 'humorous', label: 'Witty, Meme-Savvy & Viral', emoji: '⚡', desc: 'Playful, sharp, and highly shareable' },
];

export const CAMPAIGN_OBJECTIVES = [
  { id: 'leads', label: 'Lead Generation & DMs' },
  { id: 'engagement', label: 'Community Engagement & Comments' },
  { id: 'brand_awareness', label: 'Brand Awareness & Reach' },
  { id: 'product_launch', label: 'New Product / Service Launch' },
  { id: 'sales_promo', label: 'Flash Sale / Limited Time Promo' },
  { id: 'thought_leadership', label: 'Executive Thought Leadership' },
];

export const PRESET_TEMPLATES = [
  {
    id: 'tmpl-1',
    toolId: 'captions',
    title: 'Customer Transformation Story',
    category: 'Social Proof',
    prompt: 'Write an inspiring before-and-after customer success story highlighting real metric improvements, emotional relief, and a call-to-action to book a strategy call.',
  },
  {
    id: 'tmpl-2',
    toolId: 'captions',
    title: 'Myth vs Reality Industry Debunk',
    category: 'Engagement',
    prompt: 'Debunk the top 3 common industry misconceptions with hard truths and actionable advice. End with an open debate question to boost comment volume.',
  },
  {
    id: 'tmpl-3',
    toolId: 'reels',
    title: 'Hook-Story-Offer Viral Reel (30s)',
    category: 'Short-Form Video',
    prompt: 'Write a 30-second Reel script with a 3-second pattern interrupt hook, relatable struggle story, and clear frictionless offer.',
  },
  {
    id: 'tmpl-4',
    toolId: 'reels',
    title: 'Behind-The-Scenes Process Reel',
    category: 'Authenticity',
    prompt: 'Create a dynamic 20-second behind-the-scenes montage script with fast cuts, voiceover narration, and trending audio suggestions.',
  },
  {
    id: 'tmpl-5',
    toolId: 'pillars',
    title: '4-Week Thematic Strategy Calendar',
    category: 'Planning',
    prompt: 'Generate 4 weekly content pillars (Educational, Social Proof, Product Deep-Dive, Culture/Lifestyle) with 3 post topics for each pillar.',
  },
  {
    id: 'tmpl-6',
    toolId: 'hashtags',
    title: 'Balanced 30-Tag Cluster Strategy',
    category: 'Reach',
    prompt: 'Generate an optimized 30-hashtag cluster split across 5 High-Volume (1M+), 15 Niche-Targeted (50K-250K), 5 Location-Based, and 5 Branded tags.',
  },
  {
    id: 'tmpl-7',
    toolId: 'rewrite',
    title: 'Convert Notes to Polished Announcement',
    category: 'Refinement',
    prompt: 'Turn raw brainstorm notes into an executive LinkedIn announcement with formatted bullet points, compelling hook, and celebratory tone.',
  },
  {
    id: 'tmpl-8',
    toolId: 'ads',
    title: '3-Angle Meta Ads Performance Pack',
    category: 'Paid Media',
    prompt: 'Generate 3 high-converting Meta ad variations: 1 Fear of Missing Out (FOMO), 1 Logic/Value ROI angle, and 1 Social Proof Testimonial angle.',
  },
];

export const INITIAL_AI_HISTORY = [
  {
    id: 'hist-1',
    toolId: 'captions',
    toolName: 'Captions & Hooks',
    clientId: 'c1',
    clientName: 'Apex Fitness Club',
    tone: 'bold',
    prompt: '5 Morning Mobility Exercises to Supercharge Your Day',
    timestamp: '2026-08-28 09:15 AM',
    variations: [
      {
        id: 'var-1',
        title: 'High-Energy Morning Routine',
        hook: 'Stop snoozing your alarm and start waking up your spine! 🌅🔥',
        body: 'If you sit at a desk all day, your hip flexors and thoracic spine are begging for movement. Try these 5 simple mobility exercises before your first cup of coffee:\n\n1️⃣ World\'s Greatest Stretch (5 reps/side)\n2️⃣ Cat-Cow Flow (60 secs)\n3️⃣ Deep Squat Pry (10 deep breaths)\n4️⃣ 90/90 Hip Swivels\n5️⃣ Overhead Wall Slides\n\nConsistency beats intensity every single time.',
        cta: '💬 Drop a 🔥 in the comments if you are committing to morning mobility this week! Save this reel so you have it ready tomorrow at 7 AM.',
        hashtags: ['#MobilityFirst', '#MorningWorkout', '#ApexFit', '#AustinGym', '#FunctionalFitness', '#SpineHealth'],
        wordCount: 104,
        readingTime: '25s',
      },
      {
        id: 'var-2',
        title: 'Actionable & Direct',
        hook: '5 minutes tomorrow morning will fix 8 hours of desk stiffness. ⚡',
        body: 'Here is the exact mobility protocol our head trainers recommend to every Apex member:\n\n• Thoracic Spine Rotations\n• Glute Bridges with isometric hold\n• Quadruped T-Spine open-ups\n• Deep Ankle Dorsiflexion holds\n\nNo equipment required. Just your floor and 5 minutes.',
        cta: '👉 Tag your favorite workout partner and claim your free day pass via link in bio!',
        hashtags: ['#DailyMobility', '#ApexMovement', '#DeskStiffness', '#WorkoutTips'],
        wordCount: 88,
        readingTime: '20s',
      }
    ],
  },
  {
    id: 'hist-2',
    toolId: 'reels',
    toolName: 'Reel & Short Scripts',
    clientId: 'c2',
    clientName: 'Verde Organics & Botanicals',
    tone: 'luxury',
    prompt: 'Autumn Clean Skincare Routine & Barrier Repair',
    timestamp: '2026-08-28 08:30 AM',
    variations: [
      {
        id: 'var-1',
        title: 'Aesthetic Botanical Barrier Script',
        hook: '[0-3s] VISUAL: Close-up dropper releasing gold botanical serum onto dew-dropped eucalyptus leaf. TEXT ON SCREEN: "The 1 thing your skin craves this Autumn."',
        body: '[3-12s] AUDIO: Ambient soothing lo-fi beats. VOICEOVER: "As temperatures drop, indoor heating strips your natural lipids. Don\'t layer heavier creams — repair your moisture barrier with bio-fermented botanicals."\n\n[12-22s] VISUAL: Model applying velvet elixir with jade gua sha. Clean minimalist bathroom aesthetic.\n\n[22-30s] VOICEOVER: "100% cold-pressed. Zero synthetic fillers. Just pure botanical nourishment."',
        cta: '[30-35s] TEXT ON SCREEN: "Discover the Autumn Elixir — Tap Link in Bio for 15% off launch edition." AUDIO: Crisp chime.',
        hashtags: ['#VerdeOrganics', '#CleanBeauty', '#AutumnSkincare', '#BotanicalRitual', '#GlowRoutine'],
        wordCount: 118,
        readingTime: '30s',
      }
    ],
  },
];
