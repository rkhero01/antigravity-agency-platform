import React from 'react';
import { Users, Globe, Smartphone, Monitor } from 'lucide-react';

export function DemographicsCard({ demographics }) {
  if (!demographics) return null;

  const { ageGender = [], topLocations = [], devices = { mobile: 78, desktop: 18, tablet: 4 } } = demographics;

  return (
    <div className="demographics-main-card">
      <div className="demographics-header">
        <div className="demo-title-group">
          <Users size={16} className="text-primary" />
          <h3 className="demo-main-title">Audience Demographics & Geography</h3>
        </div>
        <span className="demo-subtext">Verified Active Profiles</span>
      </div>

      <div className="demographics-grid-three">
        {/* Age & Gender Distribution */}
        <div className="demo-block">
          <h4 className="demo-block-heading">Age & Gender Split</h4>
          <div className="age-gender-bars-list">
            {ageGender.map((item) => (
              <div key={item.age} className="age-row">
                <span className="age-label">{item.age}</span>
                <div className="age-split-track">
                  <div
                    className="gender-bar male"
                    style={{ width: `${item.male}%` }}
                    title={`Male: ${item.male}%`}
                  />
                  <div
                    className="gender-bar female"
                    style={{ width: `${item.female}%` }}
                    title={`Female: ${item.female}%`}
                  />
                </div>
                <span className="total-percent-label">{item.male + item.female}%</span>
              </div>
            ))}
          </div>
          <div className="gender-legend-row">
            <span className="legend-item"><span className="legend-dot male" /> Male (46%)</span>
            <span className="legend-item"><span className="legend-dot female" /> Female (54%)</span>
          </div>
        </div>

        {/* Top Locations */}
        <div className="demo-block">
          <div className="block-title-icon-row">
            <Globe size={14} className="text-cyan" />
            <h4 className="demo-block-heading">Top Metropolitan Cities</h4>
          </div>
          <div className="locations-ranking-list">
            {topLocations.map((loc, idx) => (
              <div key={loc.city} className="location-rank-row">
                <span className="rank-num">#{idx + 1}</span>
                <span className="city-name">{loc.city}</span>
                <div className="location-bar-track">
                  <div className="location-bar-fill" style={{ width: `${loc.share * 2.5}%` }} />
                </div>
                <span className="city-pct">{loc.percentage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="demo-block">
          <div className="block-title-icon-row">
            <Smartphone size={14} className="text-success" />
            <h4 className="demo-block-heading">Platform & Devices</h4>
          </div>
          <div className="device-progress-container">
            <div className="device-stacked-bar">
              <div className="device-segment mobile" style={{ width: `${devices.mobile}%` }} />
              <div className="device-segment desktop" style={{ width: `${devices.desktop}%` }} />
              <div className="device-segment tablet" style={{ width: `${devices.tablet}%` }} />
            </div>

            <div className="device-metrics-breakdown">
              <div className="device-metric-card">
                <Smartphone size={16} className="text-primary" />
                <div>
                  <span className="dev-name">Mobile Apps</span>
                  <strong className="dev-pct">{devices.mobile}%</strong>
                </div>
              </div>

              <div className="device-metric-card">
                <Monitor size={16} className="text-cyan" />
                <div>
                  <span className="dev-name">Desktop Web</span>
                  <strong className="dev-pct">{devices.desktop}%</strong>
                </div>
              </div>

              <div className="device-metric-card">
                <span className="tablet-icon-tag">📱</span>
                <div>
                  <span className="dev-name">Tablets</span>
                  <strong className="dev-pct">{devices.tablet}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemographicsCard;
