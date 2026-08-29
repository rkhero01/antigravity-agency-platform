import React from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ReportsTable({
  reports = [],
  onViewReport,
  onDownloadReport,
  onDeleteReport,
}) {
  return (
    <div className="reports-table-card">
      <div className="reports-table-responsive">
        <table className="saas-table reports-library-table">
          <thead>
            <tr>
              <th>Report Title & Category</th>
              <th>Client Workspace</th>
              <th>Reporting Period</th>
              <th>Format & Size</th>
              <th>Generated Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No reports match your filter criteria.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="report-row-item">
                  {/* Title & Category */}
                  <td>
                    <div className="table-report-title-cell">
                      <FileText size={16} className="text-primary icon-file" />
                      <div>
                        <strong
                          className="table-rep-title clickable"
                          onClick={() => onViewReport(report)}
                        >
                          {report.title}
                        </strong>
                        <span className="table-rep-cat">{report.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td>
                    <span className="table-client-name">🏢 {report.clientName}</span>
                  </td>

                  {/* Period */}
                  <td>
                    <span className="table-period-text">
                      <Calendar size={11} className="inline-icon" /> {report.period}
                    </span>
                  </td>

                  {/* Format & Size */}
                  <td>
                    <span className="table-format-pill">{report.type}</span>
                    <span className="table-file-size">({report.fileSize})</span>
                  </td>

                  {/* Generated Date */}
                  <td>
                    <span className="table-gen-date">{report.generatedAt}</span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant="success" size="sm">
                      {report.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onViewReport(report)}
                        title="View & Present"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onDownloadReport(report)}
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action danger"
                        onClick={() => onDeleteReport(report.id)}
                        title="Delete Report"
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

export default ReportsTable;
