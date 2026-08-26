import React, { useState } from 'react';
import { Terminal, Copy, Check, Rocket, ArrowRight, Zap, Code2 } from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const command = 'npm run dev';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="hero-section" id="overview">
      <div className="container hero-content">
        <div className="hero-badge animate-fade-in">
          <Zap size={14} className="hero-badge-icon" />
          <span>Modern Web Workspace Initialized</span>
        </div>

        <h1 className="hero-title animate-fade-in">
          Build Next-Gen <span className="gradient-text">AI Web Applications</span> with Speed
        </h1>

        <p className="hero-subtitle animate-fade-in">
          Your workspace is configured with Vite, React, responsive Vanilla CSS design system, and Git version control. Ready for immediate feature development.
        </p>

        <div className="hero-cta-group animate-fade-in">
          <div className="command-box glass-panel">
            <Terminal size={18} className="command-icon" />
            <code className="command-text">{command}</code>
            <button
              onClick={copyToClipboard}
              className="copy-btn"
              title="Copy to clipboard"
              aria-label="Copy dev server command"
            >
              {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            </button>
          </div>

          <a href="#quickstart" className="btn-primary">
            <span>Get Started</span>
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="hero-stats glass-panel">
          <div className="stat-item">
            <span className="stat-value gradient-text">&lt; 50ms</span>
            <span className="stat-label">Vite HMR</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">Zero</span>
            <span className="stat-label">Extra Bloat</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value text-emerald">100%</span>
            <span className="stat-label">Local &amp; Configured</span>
          </div>
        </div>
      </div>
    </section>
  );
}
