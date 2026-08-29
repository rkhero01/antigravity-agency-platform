import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Inbox,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TemplatesMetrics } from './TemplatesMetrics.jsx';
import { TemplateFilters } from './TemplateFilters.jsx';
import { TemplateCard } from './TemplateCard.jsx';
import { TemplateDetailModal } from './TemplateDetailModal.jsx';
import { CreateTemplateModal } from './CreateTemplateModal.jsx';
import { UseTemplateModal } from './UseTemplateModal.jsx';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function TemplatesTab({
  selectedClient = 'all',
  searchQuery = '',
  onSearchChange,
  clients = whatsappClients,
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUseOpen, setIsUseOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [filters, setFilters] = useState({
    clientId: selectedClient,
    category: 'all',
    language: 'all',
    status: 'all',
    search: searchQuery,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      clientId: selectedClient,
      search: searchQuery,
    }));
  }, [selectedClient, searchQuery]);

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const loadTemplates = async () => {
    setLoading(true);
    const data = await whatsappService.getTemplates(filters);
    setTemplates(data);
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      clientId: selectedClient,
      category: 'all',
      language: 'all',
      status: 'all',
      search: '',
    });
    if (onSearchChange) onSearchChange('');
  };

  const handleOpenDetails = (template) => {
    setSelectedTemplate(template);
    setIsDetailOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsCreateOpen(true);
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setIsUseOpen(true);
  };

  const handleDuplicate = async (template) => {
    // Generate unique duplicate name
    let copyName = `${template.name}_copy`;
    let counter = 2;
    while (templates.some((t) => t.name === copyName)) {
      copyName = `${template.name}_copy_${counter}`;
      counter++;
    }

    const duplicatedPayload = {
      ...template,
      id: undefined,
      name: copyName,
      status: 'Approved',
      usageCount: 0,
    };

    const created = await whatsappService.createTemplate(duplicatedPayload);
    setTemplates((prev) => [created, ...prev]);
    showToast(`✓ Duplicated template as "${copyName}"`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template from Meta WhatsApp library?')) {
      await whatsappService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedTemplate?.id === id) {
        setIsDetailOpen(false);
      }
      showToast('Template deleted successfully');
    }
  };

  const handleSaveTemplate = async (templateData) => {
    if (templateData.id) {
      const updated = await whatsappService.updateTemplate(templateData.id, templateData);
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast('✓ Template updated successfully');
    } else {
      const created = await whatsappService.createTemplate(templateData);
      setTemplates((prev) => [created, ...prev]);
      showToast('✓ New Meta WhatsApp template registered');
    }
  };

  const handleTemplateSent = (templateName, convId) => {
    showToast(`✓ Dispatched template "${templateName}" to contact!`);
  };

  return (
    <div className="wa-templates-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metrics Strip */}
      <TemplatesMetrics templates={templates} />

      {/* Control Card & Toolbar */}
      <div className="wa-templates-toolbar-card">
        <div className="flex justify-between items-center gap-4 flex-wrap w-full mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText size={17} className="text-primary" />
              <span>WhatsApp Message Templates Library</span>
            </h3>
            <p className="text-xs text-muted">
              Meta-approved multilingual message templates with dynamic variable interpolation
            </p>
          </div>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={() => {
              setEditingTemplate(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create Template</span>
          </button>
        </div>

        <TemplateFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          clients={clients}
        />
      </div>

      {/* 3-Column Template Cards Grid */}
      {loading ? (
        <div className="templates-cards-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="wa-template-card skeleton-card">
              <div className="skeleton-line w-32 h-4 mb-2" />
              <div className="skeleton-line w-48 h-5 mb-3" />
              <div className="skeleton-line w-full h-16 mb-3" />
              <div className="skeleton-line w-full h-8" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="wa-empty-conversations-box">
          <Inbox size={40} className="text-dim mb-2" />
          <strong className="text-white text-base block">No Templates Found</strong>
          <p className="text-xs text-muted max-w-[280px]">
            No message templates match your current filter and search criteria.
          </p>
          <button
            type="button"
            className="btn-saas-secondary mt-3"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="templates-cards-grid">
          {templates.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              onOpenDetails={handleOpenDetails}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TemplateDetailModal
        template={selectedTemplate}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onUseTemplate={handleUseTemplate}
      />

      <CreateTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitTemplate={handleSaveTemplate}
        editingTemplate={editingTemplate}
        clients={clients}
      />

      <UseTemplateModal
        template={selectedTemplate}
        isOpen={isUseOpen}
        onClose={() => setIsUseOpen(false)}
        onTemplateSent={handleTemplateSent}
      />
    </div>
  );
}

export default TemplatesTab;
