import React from 'react';

export function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={`pulse-badge pulse-badge-${variant} pulse-badge-${size}`}>
      {children}
    </span>
  );
}

export default Badge;
