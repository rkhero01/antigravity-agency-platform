import React, { useState, useEffect } from 'react';
import {
  PortalHeader,
  PortalKpiCards,
  PortalTabNavigation,
  PortalContentReviewTab,
  PortalPerformanceTab,
  PortalBrandAssetsTab,
  RevisionRequestModal,
} from '../../components/clientPortal/index.js';
import { clientPortalService } from '../../services/clientPortalService.js';
import { CheckCircle2 } from 'lucide-react';

export function ClientPortalPage({
  activeClient = 'c1',
  onNavigate,
}) {
  const [selectedClientId, setSelectedClientId] = useState(
    activeClient && activeClient !== 'all' ? activeClient : 'c1'
  );
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review');
  const [isPublicPreview, setIsPublicPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [revisionPost, setRevisionPost] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientId(activeClient);
    }
  }, [activeClient]);

  useEffect(() => {
    loadPortal(selectedClientId);
  }, [selectedClientId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadPortal = async (clientId) => {
    setLoading(true);
    const data = await clientPortalService.getPortalData(clientId);
    setPortalData(data);
    setLoading(false);
  };

  const handleApprovePost = async (postId) => {
    const updated = await clientPortalService.approvePost(selectedClientId, postId);
    setPortalData(updated);
    showToast('🎉 Post approved and scheduled for automated multi-channel publishing!');
  };

  const handleRequestRevision = (post) => {
    setRevisionPost(post);
  };

  const handleSubmitRevision = async (postId, feedbackText) => {
    const updated = await clientPortalService.requestRevision(selectedClientId, postId, feedbackText);
    setPortalData(updated);
    showToast('📝 Feedback submitted! Agency creative team notified to apply changes.');
  };

  const handleCopyLink = () => {
    const link = clientPortalService.generatePublicShareableLink(selectedClientId);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopiedLink(true);
    showToast(`🔗 Copied secure client review link: ${link}`);
    setTimeout(() => {
      setCopiedLink(false);
    }, 3000);
  };

  const handleDownloadAsset = (asset) => {
    showToast(`📥 Downloading "${asset.name}" (${asset.size})...`);
  };

  if (loading || !portalData) return null;

  return (
    <div className={`client-portal-page-container ${isPublicPreview ? 'public-view-active' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Branded Header */}
      <PortalHeader
        clientData={portalData}
        selectedClient={selectedClientId}
        onClientChange={setSelectedClientId}
        isPublicPreview={isPublicPreview}
        onTogglePublicPreview={() => setIsPublicPreview(!isPublicPreview)}
        onCopyLink={handleCopyLink}
        copiedLink={copiedLink}
      />

      {/* 4 Client-Facing Key Metrics */}
      <PortalKpiCards stats={portalData.stats} />

      {/* Tabs Navigation */}
      <PortalTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={portalData.stats?.pendingApproval || 0}
      />

      {/* Tab Panels */}
      {activeTab === 'review' && (
        <PortalContentReviewTab
          posts={portalData.posts || []}
          onApprovePost={handleApprovePost}
          onRequestRevision={handleRequestRevision}
        />
      )}

      {activeTab === 'performance' && (
        <PortalPerformanceTab
          stats={portalData.stats}
          client={portalData.client}
        />
      )}

      {activeTab === 'brand-assets' && (
        <PortalBrandAssetsTab
          brandAssets={portalData.brandAssets || []}
          client={portalData.client}
          onDownloadAsset={handleDownloadAsset}
        />
      )}

      {/* Revision Request Modal */}
      <RevisionRequestModal
        post={revisionPost}
        isOpen={Boolean(revisionPost)}
        onClose={() => setRevisionPost(null)}
        onSubmitRevision={handleSubmitRevision}
      />
    </div>
  );
}

export default ClientPortalPage;
