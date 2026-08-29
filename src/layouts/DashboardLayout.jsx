import React from 'react';

export function DashboardLayout({ title, subtitle, actions, children }) {
  return (
    <div className="module-page-container">
      <div className="module-header">
        <div className="module-header-text">
          <h1 className="module-title">{title}</h1>
          {subtitle && <p className="module-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="module-actions">{actions}</div>}
      </div>
      <div className="module-content-body">{children}</div>
    </div>
  );
}

export default DashboardLayout;
