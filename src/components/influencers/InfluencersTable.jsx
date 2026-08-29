import React from 'react';
import { Users2, Sparkles, Trash2, Tag } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function InfluencersTable({
  influencers = [],
  onOpenPitchModal,
  onUpdateStage,
  onDeleteInfluencer,
}) {
  return (
    <div className="influencers-table-card">
      <div className="influencers-table-responsive">
        <table className="saas-table influencers-pipeline-table">
          <thead>
            <tr>
              <th>Creator & Platform</th>
              <th>Client Workspace</th>
              <th>Campaign & Niche</th>
              <th>Followers & Engagement</th>
              <th>Rate & Promo Code</th>
              <th>Attributed Sales</th>
              <th>Stage Pipeline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {influencers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">
                  No creator partnerships match your filter criteria.
                </td>
              </tr>
            ) : (
              influencers.map((inf) => (
                <tr key={inf.id} className="inf-row-item">
                  {/* Creator */}
                  <td>
                    <div className="table-creator-profile-cell">
                      <img
                        src={inf.avatar}
                        alt={inf.name}
                        className="table-inf-avatar"
                      />
                      <div>
                        <strong className="table-inf-name">{inf.name}</strong>
                        <span className="table-inf-handle">{inf.handle} ({inf.platform})</span>
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td>
                    <span className="table-client-name">🏢 {inf.clientName}</span>
                  </td>

                  {/* Campaign */}
                  <td>
                    <div>
                      <strong className="table-campaign-name">{inf.campaign}</strong>
                      <span className="table-niche-text">{inf.niche}</span>
                    </div>
                  </td>

                  {/* Followers */}
                  <td>
                    <div>
                      <strong>{inf.followers}</strong>
                      <span className="table-er-tag text-success">({inf.engagementRate} ER)</span>
                    </div>
                  </td>

                  {/* Rate & Code */}
                  <td>
                    <div>
                      <span className="table-rate-val">{inf.rate}</span>
                      <span className="table-code-val">🏷️ {inf.promoCode}</span>
                    </div>
                  </td>

                  {/* Sales */}
                  <td>
                    <div>
                      <strong className="text-cyan">{inf.attributedSales}</strong>
                      <span className="table-roi-text">({inf.roi})</span>
                    </div>
                  </td>

                  {/* Stage */}
                  <td>
                    <select
                      value={inf.stage}
                      onChange={(e) => onUpdateStage(inf.id, e.target.value)}
                      className="table-stage-select"
                    >
                      <option value="Outreach Sent">Outreach Sent</option>
                      <option value="Contract Signed">Contract Signed</option>
                      <option value="Content Draft Review">Content Draft Review</option>
                      <option value="Published & Paid">Published & Paid</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onOpenPitchModal(inf)}
                        title="Generate AI Outreach Pitch"
                      >
                        <Sparkles size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action danger"
                        onClick={() => onDeleteInfluencer(inf.id)}
                        title="Remove Creator"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InfluencersTable;
