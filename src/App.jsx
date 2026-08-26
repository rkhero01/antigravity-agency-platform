import React from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <footer className="footer container">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} AI Projects Workspace. Ready for custom development.</p>
          <div className="footer-links">
            <span className="footer-badge">Node.js {process.env.NODE_ENV || 'dev'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
