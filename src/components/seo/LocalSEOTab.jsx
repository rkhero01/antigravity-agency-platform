import React from 'react';
import { MapPin, Star, CheckCircle2, RefreshCw, Phone, Globe, Award } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function LocalSEOTab({
  locations = [],
  onSyncLocation,
}) {
  return (
    <div className="seo-local-pane">
      <div className="local-top-banner">
        <MapPin size={20} className="text-warning flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Google Business Profile & Local 3-Pack Radar</strong>
          <span className="text-xs text-muted">Manage multi-location Google Map Pack positions, automated review acquisition, NAP consistency syncing, and local citation directories.</span>
        </div>
      </div>

      <div className="local-locations-grid">
        {locations.map((loc) => (
          <div key={loc.id} className="local-location-card">
            <div className="location-card-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="local-map-pack-badge">
                    <Award size={12} /> {loc.mapPackPosition}
                  </span>
                  <span className="local-client-tag">🏢 {loc.clientName}</span>
                </div>
                <h4 className="location-title">{loc.locationName}</h4>
              </div>

              <div className="gbp-visibility-box">
                <span className="gbp-pct-num">{loc.gbpVisibility}</span>
                <span className="gbp-lbl">GBP Visibility</span>
              </div>
            </div>

            <p className="location-address-text">
              <MapPin size={13} className="inline-icon" /> {loc.address}
            </p>

            <div className="location-telemetry-grid">
              <div className="lt-block">
                <span className="lt-lbl">Reviews & Rating</span>
                <strong className="lt-val text-warning">
                  <Star size={12} className="inline-icon fill-warning text-warning" /> {loc.avgRating} ({loc.reviewsCount})
                </strong>
              </div>

              <div className="lt-block">
                <span className="lt-lbl">NAP Consistency</span>
                <strong className="lt-val text-success">{loc.napConsistency}</strong>
              </div>

              <div className="lt-block">
                <span className="lt-lbl">Local Citations</span>
                <strong className="lt-val text-white">{loc.citationsCount} Directories</strong>
              </div>

              <div className="lt-block">
                <span className="lt-lbl">Local Searches</span>
                <strong className="lt-val text-cyan">{loc.monthlySearches} / mo</strong>
              </div>
            </div>

            <div className="location-card-footer">
              <span className="text-xs text-muted">Synced with Google Maps & Apple Business Connect</span>
              <button
                type="button"
                className="btn-sync-gbp"
                onClick={() => onSyncLocation(loc.id)}
              >
                <RefreshCw size={13} />
                <span>Sync GBP Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LocalSEOTab;
