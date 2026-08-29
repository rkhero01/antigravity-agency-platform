# PulseAI Marketing Platform — Agency Social Media OS

A high-performance, modular, AI-powered Social Media Marketing Management SaaS platform engineered for digital marketing agencies to manage multi-client campaigns, content calendars, cross-network analytics, performance ads, approval workflows, and AI generation from a single dashboard.

---

## 🎯 Product Overview

Digital agencies managing multiple brand clients face fragmentation across siloed social networks, disconnected ad accounts, manual copywriting bottlenecks, and disorganized client review processes. 

**PulseAI Marketing Platform** provides a centralized Operating System for agencies:
- **Unified Multi-Client Management**: Seamlessly switch between client workspaces or view aggregate portfolio metrics.
- **Omnichannel Content Hub**: Schedule, draft, review, and auto-publish Posts, Reels, and Stories across Meta, LinkedIn, YouTube, and Google.
- **Integrated AI Marketing Studio**: On-demand brand-tone caption generation, viral hooks, reel scripts, and hashtag cluster optimization.
- **Paid Ads & Performance Tracker**: Real-time Meta Ads and Google Ads spend, CPL, CPA, and ROAS monitoring.
- **Cross-Channel Analytics & Reporting**: One-click executive PDF report generation and audience engagement tracking.
- **Agency Workflow & Approvals**: Client sign-off stages, task boards, deadlines, and role-based permissions.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Component lifecycle & UI state management |
| **Build & Dev Tool** | Vite 6 (`vite`, `@vitejs/plugin-react`) | Ultra-fast HMR and optimized production bundling |
| **Icons & UI Tokens** | Lucide React (`lucide-react`) | Modern, consistent iconography |
| **Design System & Styling** | Vanilla Modern CSS (CSS Variables) | Dark-mode-first glassmorphism, responsive grid layouts |
| **Architecture** | Modular Layered Architecture | Clean separation of UI, Services, Hooks, Data, and Utils |
| **Version Control** | Git | Feature branching & release tracking |

---

## 🏗️ Application Architecture

The platform follows a scalable, modular architecture structured for seamless future backend and API integration:

```text
Ai Projects/
├── index.html                     # Application HTML5 shell with Google Fonts
├── vite.config.js                 # Vite bundler configuration
├── package.json                   # Project dependencies and build scripts
├── README.md                      # Product architecture and roadmap
└── src/
    ├── assets/                    # Static media and brand asset registries
    │   └── index.js
    ├── components/                # Reusable UI component building blocks
    │   ├── common/                # Shared UI elements (Badge, StatCard, Sidebar, Navbar)
    │   │   ├── Badge.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   └── index.js
    │   ├── Header.jsx
    │   ├── Hero.jsx
    │   └── Features.jsx
    ├── layouts/                   # Structural page shells
    │   ├── MainLayout.jsx         # App shell with Sidebar and Top Navigation
    │   ├── DashboardLayout.jsx    # Standardized module container with action bars
    │   └── index.js
    ├── pages/                     # 10 Core Application Modules
    │   ├── Dashboard/             # 1. Dashboard & Portfolio Overview
    │   ├── Clients/               # 2. Client Profiles & Channel Connections
    │   ├── SocialAccounts/        # 3. Account Health & Sync Status
    │   ├── ContentManagement/     # 4. Content Hub & Publishing Pipeline
    │   ├── AIAssistant/           # 5. AI Marketing Studio & Copy Generators
    │   ├── AdsPerformance/        # 6. Meta & Google Ads Spend / ROAS
    │   ├── AnalyticsReports/      # 7. Multi-channel Analytics & Reports
    │   ├── TasksWorkflow/         # 8. Team Tasks & Approval Kanban
    │   ├── TeamManagement/        # 9. Agency Staff Roles & Permissions
    │   ├── Settings/              # 10. Workspace & Integration Settings
    │   └── index.js
    ├── services/                  # Business logic & API client abstraction
    │   ├── apiClient.js           # Base HTTP fetch / REST handler
    │   ├── clientsService.js      # Client entity operations
    │   ├── socialAccountsService.js# Social account connection handlers
    │   ├── contentService.js      # Content creation & calendar methods
    │   ├── aiService.js           # AI prompt generation service
    │   ├── adsService.js          # Paid campaign performance service
    │   ├── analyticsService.js    # Metric retrieval & aggregation service
    │   ├── tasksService.js        # Workflow & task management service
    │   ├── teamService.js         # Staff & permission service
    │   ├── settingsService.js     # Workspace preferences service
    │   └── index.js
    ├── hooks/                     # Custom React hooks
    │   ├── useNavigation.js       # Active module & client switcher state
    │   ├── useTheme.js            # Theme toggling & persistence
    │   └── index.js
    ├── utils/                     # Helpers, formatters, and constants
    │   ├── constants.js           # Module IDs, platform types, status enums
    │   ├── formatters.js          # Currency, ROAS, number, and date formatters
    │   └── validators.js          # Input validation helpers
    ├── data/                      # Structured mock datasets & schema contracts
    │   ├── mockClients.js
    │   ├── mockSocialAccounts.js
    │   ├── mockContent.js
    │   ├── mockAds.js
    │   ├── mockAnalytics.js
    │   ├── mockTasks.js
    │   ├── mockTeam.js
    │   └── index.js
    ├── index.css                  # Global tokens, color variables & CSS reset
    ├── App.css                    # Shell, navbar, sidebar, and page styles
    ├── App.jsx                    # Root component with dynamic module router
    └── main.jsx                   # React 19 bootstrap entry point
```

---

## 📦 Core Modules Breakdown

1. **Executive Dashboard (`pages/Dashboard`)**
   - High-level KPI cards: Active Clients, Portfolio Monthly Ad Spend, Aggregate ROAS, Cross-channel Engagement.
   - Quick action shortcuts, live campaign tables, and priority agency task alerts.

2. **Client Management (`pages/Clients`)**
   - Client directory with industry classifications, direct contact points, assigned team leads, and monthly retainers.

3. **Social Accounts (`pages/SocialAccounts`)**
   - Multi-platform integration tracker for Facebook, Instagram, LinkedIn, YouTube, and Google Business Profile.
   - Connection health monitoring, token re-authentication flags, and publishing status.

4. **Content Management & Hub (`pages/ContentManagement`)**
   - Comprehensive content pipeline supporting Posts, Reels, Carousels, and Stories.
   - Lifecycle status tracking: Draft, In Review, Approved, Scheduled, and Published.

5. **AI Marketing Studio (`pages/AIAssistant`)**
   - Brand-tone copywriting engine: Caption Generator, Post Topic Ideas, Reel/Short Scripts, Hashtag Recommender, and Content Rewriter.

6. **Ads & Performance Tracker (`pages/AdsPerformance`)**
   - Unified ad metrics across Meta Ads and Google Ads: Spend, Leads, Revenue, CPL, CPA, CTR, and ROAS.

7. **Analytics & Executive Reports (`pages/AnalyticsReports`)**
   - Aggregate audience reach, engagement rate, channel breakdown comparisons, and PDF export preview.

8. **Tasks & Approval Workflow (`pages/TasksWorkflow`)**
   - Kanban board organizing tasks by status (To Do, In Progress, Pending Approval, Completed) with priority tags and due dates.

9. **Team Management & Roles (`pages/TeamManagement`)**
   - Agency staff directory with role tiers (Admin, Creative Director, Performance Specialist, Social Media Manager).

10. **Workspace Settings (`pages/Settings`)**
    - Organization profile, timezone localization, AI model preferences, and API key integrations.

---

## 🗺️ Iterative Development Roadmap

```text
Phase 1: Architecture & Structural Foundation (Current Phase)
├── [x] Scalable folder structure & design system
├── [x] Reusable common UI components (Sidebar, Navbar, StatCard, Badge)
├── [x] 10 core module page skeletons & navigation
├── [x] Service abstraction layer & mock data contracts
└── [x] Production build verification

Phase 2: Interactive Modules & State Management
├── [ ] Client onboarding & profile management forms
├── [ ] Dynamic content calendar view & post composer
├── [ ] Interactive AI prompt execution & copy generation studio
└── [ ] Kanban drag-and-drop workflow updates

Phase 3: Ads, Analytics & Reporting Engine
├── [ ] Advanced date-range filtering & metric charts
├── [ ] Campaign budget optimizer & lead performance tracking
└── [ ] Automated client PDF report export

Phase 4: Backend, Authentication & Live Integrations
├── [ ] REST / GraphQL API server implementation
├── [ ] Role-based access control (RBAC) & OAuth login
├── [ ] Meta Graph API, LinkedIn API, & Google API integrations
└── [ ] Webhook handlers for real-time publishing & sync
```

---

## 🚀 Running the Application

### Development Server
```bash
npm.cmd run dev
```
Serves the application locally at `http://localhost:3000`.

### Production Build
```bash
npm.cmd run build
```
Compiles and generates the optimized production bundle in the `dist/` directory.

### Preview Build
```bash
npm.cmd run preview
```
