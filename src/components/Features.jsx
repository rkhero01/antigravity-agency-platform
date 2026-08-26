import React from 'react';
import { Cpu, Palette, GitBranch, ShieldCheck, Sparkles, Box } from 'lucide-react';

const STACK_CARDS = [
  {
    icon: Cpu,
    title: 'Vite 6 + React 19',
    description: 'Blazing fast instant server start and lightning Hot Module Replacement (HMR) for seamless developer workflow.',
    tag: 'Runtime'
  },
  {
    icon: Palette,
    title: 'Vanilla CSS Design System',
    description: 'Custom CSS tokens, dark mode palette, smooth gradients, responsive layout, and glassmorphism without heavy framework overhead.',
    tag: 'Styling'
  },
  {
    icon: GitBranch,
    title: 'Git Version Control',
    description: 'Clean repository initialized with a curated .gitignore matching modern Node.js and web standards.',
    tag: 'VCS'
  },
  {
    icon: Box,
    title: 'Component-Driven Architecture',
    description: 'Modular file structure in src/components for building scalable, clean, and reusable interfaces.',
    tag: 'Architecture'
  }
];

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Architecture</span>
          <h2 className="section-title">Engineered for High-Performance UI</h2>
          <p className="section-description">
            Everything you need to rapidly iterate, prototype, and build production-ready applications.
          </p>
        </div>

        <div className="features-grid">
          {STACK_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="feature-card glass-panel">
                <div className="feature-top">
                  <div className="feature-icon-wrapper">
                    <Icon size={24} className="feature-icon" />
                  </div>
                  <span className="feature-tag">{card.tag}</span>
                </div>
                <h3 className="feature-title">{card.title}</h3>
                <p className="feature-desc">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="quickstart-box glass-panel" id="quickstart">
          <div className="quickstart-header">
            <Sparkles size={20} className="text-accent" />
            <h3 className="quickstart-title">Quick Developer Commands</h3>
          </div>
          <div className="quickstart-grid">
            <div className="code-block">
              <span className="code-comment"># Start local development server</span>
              <code>npm run dev</code>
            </div>
            <div className="code-block">
              <span className="code-comment"># Build optimized production bundle</span>
              <code>npm run build</code>
            </div>
            <div className="code-block">
              <span className="code-comment"># Preview production build locally</span>
              <code>npm run preview</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
