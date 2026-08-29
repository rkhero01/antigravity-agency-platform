import React, { useState } from 'react';
import { X, History, Trash2, RotateCcw, Sparkles, Search } from 'lucide-react';

export function AIHistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onRestoreItem,
  onDeleteItem,
  onClearAll,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.prompt?.toLowerCase().includes(query) ||
      item.clientName?.toLowerCase().includes(query) ||
      item.toolName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="drawer-backdrop-overlay" onClick={onClose}>
      <div className="history-slide-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-box">
            <History size={18} className="text-primary" />
            <h3>Generation History</h3>
            <span className="drawer-count-tag">{history.length} items</span>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="drawer-toolbar">
          <div className="drawer-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search past prompts or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="drawer-search-input"
            />
          </div>

          {history.length > 0 && (
            <button
              type="button"
              className="btn-clear-history-all"
              onClick={onClearAll}
              title="Clear all generation history"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* History Items List */}
        <div className="drawer-history-list">
          {filteredHistory.length === 0 ? (
            <div className="drawer-empty-state">
              <Sparkles size={28} className="empty-sparkle" />
              <p>No past generations found matching your search.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="history-item-card">
                <div className="item-header-meta">
                  <span className="history-tool-tag">{item.toolName || item.toolId}</span>
                  <span className="history-time-tag">{item.timestamp}</span>
                </div>

                <h4 className="history-item-client">🏢 {item.clientName}</h4>
                <p className="history-item-prompt">{item.prompt}</p>

                <div className="item-footer-actions">
                  <span className="history-vars-count">
                    {item.variations?.length || 1} Variation{item.variations?.length > 1 ? 's' : ''}
                  </span>

                  <div className="item-action-btns">
                    <button
                      type="button"
                      className="btn-history-restore"
                      onClick={() => {
                        onRestoreItem(item);
                        onClose();
                      }}
                      title="Load into workspace"
                    >
                      <RotateCcw size={12} />
                      <span>Load Output</span>
                    </button>
                    <button
                      type="button"
                      className="btn-history-delete"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete from history"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AIHistoryDrawer;
