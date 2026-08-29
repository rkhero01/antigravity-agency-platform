import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { NAVIGATION_ITEMS } from '../../utils/constants.js';

export function AppLayout({
  activeModule,
  onNavigate,
  activeClient,
  onClientChange,
  dateRange,
  onDateRangeChange,
  currentUser = null,
  children,
}) {
  const currentItem = NAVIGATION_ITEMS.find((item) => item.id === activeModule);
  const activeTitle = currentItem ? currentItem.label : 'Dashboard';

  return (
    <div className="saas-app-shell">
      {/* Persistent Left Sidebar */}
      <Sidebar activeModule={activeModule} onNavigate={onNavigate} />

      {/* Main Workspace Frame */}
      <div className="saas-main-viewport">
        <Topbar
          activeTitle={activeTitle}
          selectedDateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          activeClient={activeClient}
          onClientChange={onClientChange}
          onOpenQuickAction={onNavigate}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />
        <main className="saas-content-canvas" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
