import React from 'react';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { Navbar } from '../components/common/Navbar.jsx';

export function MainLayout({ activeModule, onNavigate, activeClient, onClientChange, children }) {
  return (
    <div className="agency-shell-layout">
      <Sidebar activeModule={activeModule} onNavigate={onNavigate} />
      <div className="agency-main-area">
        <Navbar
          activeClient={activeClient}
          onClientChange={onClientChange}
          onQuickAction={onNavigate}
        />
        <main className="agency-content-viewport">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
