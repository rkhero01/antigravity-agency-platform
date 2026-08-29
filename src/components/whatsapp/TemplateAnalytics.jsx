import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function TemplateAnalytics({
  selectedClient = 'all',
}) {
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTemplateAnalytics();
  }, [selectedClient]);

  const loadTemplateAnalytics = async () => {
    const res = await whatsappService.getTemplateAnalytics({ clientId: selectedClient });
    setData(res);
  };

  if (!data) return null;

  const categories = ['all', 'Marketing', 'Utility', 'Authentication'];
  let templates = data.templates || [];

  if (selectedCategory !== 'all') {
    templates = templates.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  return (
    <div className="wa-template-analytics-card">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText size={17} className="text-cyan" />
            <span>Message Template Effectiveness</span>
          </h3>
          <p className="text-xs text-muted">
            Open rates, response percentages, and conversion rates across Meta-approved message blueprints
          </p>
        </div>

        {/* Category Filter */}
        <div className="followup-mini-select-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Template Categories</option>
            {categories.filter((c) => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Performance Table */}
      <div className="wa-followup-table-container">
        <table className="wa-followup-table">
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Category</th>
              <th>Language</th>
              <th>Times Dispatched</th>
              <th>Delivery %</th>
              <th>Read %</th>
              <th>Replies %</th>
              <th>Conversion %</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tmpl) => (
              <tr key={tmpl.id} className="table-row-item">
                <td>
                  <div>
                    <strong className="text-white text-xs block">{tmpl.name}</strong>
                    <span className="text-[11px] text-dim">{tmpl.clientName}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                    {tmpl.category}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-dim">{tmpl.language}</span>
                </td>
                <td>
                  <span className="text-xs text-white font-semibold">{tmpl.usageCount || 0}</span>
                </td>
                <td>
                  <span className="text-xs text-success font-semibold">{tmpl.deliveryRate}</span>
                </td>
                <td>
                  <span className="text-xs text-purple font-semibold">{tmpl.readRate}</span>
                </td>
                <td>
                  <span className="text-xs text-pink font-semibold">{tmpl.replyRate}</span>
                </td>
                <td>
                  <strong className="text-xs text-success font-bold">{tmpl.conversionRate}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TemplateAnalytics;
