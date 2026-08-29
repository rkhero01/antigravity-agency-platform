import React from 'react';
import {
  DashboardHeader,
  KpiCard,
  PerformanceChart,
  PlatformPerformance,
  RecentActivity,
  ContentPipeline,
  UpcomingTasks,
  QuickActions,
} from '../../components/dashboard/index.js';
import { mockKpis } from '../../data/mockDashboard.js';

export function DashboardPage({ dateRange = '30d', onDateRangeChange, onNavigate }) {
  return (
    <div className="saas-dashboard-view">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onCreateContent={() => onNavigate?.('content')}
        onAddClient={() => onNavigate?.('clients')}
      />

      {/* 2. Primary 6 KPI Cards Grid */}
      <section className="kpi-cards-grid" aria-label="Key Performance Indicators">
        {mockKpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            isPositive={kpi.isPositive}
            sublabel={kpi.sublabel}
            icon={kpi.icon}
            badge={kpi.badge}
          />
        ))}
      </section>

      {/* 3. Performance Chart Section */}
      <section className="dashboard-chart-section" aria-label="Marketing Performance Charts">
        <PerformanceChart />
      </section>

      {/* 4. Two-Column Modular Layout */}
      <div className="dashboard-content-columns">
        {/* Left / Main Column */}
        <div className="dashboard-primary-col">
          {/* Platform Performance */}
          <PlatformPerformance
            onNavigateToPlatforms={() => onNavigate?.('social-accounts')}
          />

          {/* Recent Client Activity */}
          <RecentActivity
            onNavigateToClients={() => onNavigate?.('clients')}
          />
        </div>

        {/* Right / Side Column */}
        <div className="dashboard-secondary-col">
          {/* Content Pipeline */}
          <ContentPipeline
            onNavigateToContent={() => onNavigate?.('content')}
          />

          {/* Upcoming Tasks & Approvals */}
          <UpcomingTasks
            onNavigateToTasks={() => onNavigate?.('tasks')}
          />

          {/* Quick Actions Shortcuts */}
          <QuickActions onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
