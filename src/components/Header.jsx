import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="header glass-panel">
      <div className="header-inner container">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles className="icon-gradient" size={22} />
          </div>
          <span className="brand-name">AI Projects<span className="brand-dot">.</span></span>
        </div>

        <nav className="nav-links">
          <a href="#overview" className="nav-link active">Overview</a>
          <a href="#features" className="nav-link">Stack</a>
          <a href="#quickstart" className="nav-link">Quickstart</a>
        </nav>

        <div className="header-actions">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Ready for Dev</span>
          </div>
        </div>
      </div>
    </header>
  );
}
