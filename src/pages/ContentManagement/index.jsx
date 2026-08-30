import React, { useState, useEffect, useMemo } from 'react';
import {
  ContentHeader,
  ContentCalendarView,
  ContentListView,
  ContentGridView,
  PostComposerModal,
  PostDetailModal,
} from '../../components/content/index.js';
import { contentService } from '../../services/contentService.js';
import { CalendarDays, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function ContentManagementPage({ activeClient = 'all' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [currentStage, setCurrentStage] = useState('all');
  const [currentFormat, setCurrentFormat] = useState('All Formats');
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list' | 'grid'

  // Modal States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectedPost, setInspectedPost] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [selectedClientFilter]);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadPosts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await contentService.getPosts(selectedClientFilter);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts from PostgreSQL:', err);
      setError(
        err.message || 'Unable to retrieve content items from database. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreatePost = async (newPostData) => {
    const created = await contentService.createPost(newPostData);
    await loadPosts(true);
    showToast(`🚀 Scheduled new post "${created.title}"!`);
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      const updated = await contentService.updatePostStatus(postId, newStatus);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      if (inspectedPost && inspectedPost.id === postId) {
        setInspectedPost(updated);
      }
      showToast(`✓ Post status updated to "${newStatus}".`);
    } catch (err) {
      console.error('Failed to update post status:', err);
      alert(err.message || 'Failed to update post status.');
    }
  };

  const handleDeletePost = async (postId) => {
    const target = posts.find((p) => p.id === postId);
    const confirm = window.confirm(
      `Are you sure you want to archive post "${target?.title || 'this post'}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    try {
      await contentService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (inspectedPost && inspectedPost.id === postId) {
        setInspectedPost(null);
      }
      showToast('Post archived successfully.');
    } catch (err) {
      console.error('Failed to archive post:', err);
      alert(err.message || 'Failed to archive post.');
    }
  };

  const handleSelectDateFromCalendar = (dateStr) => {
    setPreselectedDate(dateStr);
    setIsComposerOpen(true);
  };

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : p.clientId === selectedClientFilter;

      const matchesStage =
        currentStage === 'all'
          ? true
          : (p.status || '').toLowerCase() === currentStage.toLowerCase() ||
            (p.statusRaw || '').toLowerCase() === currentStage.toLowerCase();

      const matchesFormat =
        currentFormat === 'All Formats'
          ? true
          : (p.type || p.format || '').toLowerCase() === currentFormat.toLowerCase() ||
            (p.format || '').toLowerCase() === currentFormat.toLowerCase();

      return matchesClient && matchesStage && matchesFormat;
    });
  }, [posts, selectedClientFilter, currentStage, currentFormat]);

  // Stage counters calculation
  const stageCounts = useMemo(() => {
    const relevant =
      selectedClientFilter === 'all'
        ? posts
        : posts.filter((p) => p.clientId === selectedClientFilter);
    return contentService.calculateStageCounts(relevant);
  }, [posts, selectedClientFilter]);

  return (
    <div className="content-hub-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <ContentHeader
        stageCounts={stageCounts}
        currentStage={currentStage}
        onStageChange={setCurrentStage}
        currentFormat={currentFormat}
        onFormatChange={setCurrentFormat}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenComposer={() => {
          setPreselectedDate(new Date().toISOString().split('T')[0]);
          setIsComposerOpen(true);
        }}
        onRefresh={() => loadPosts(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main View Area: Loading, Error, Calendar, List, or Grid */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">
            Loading editorial calendar & social assets from PostgreSQL...
          </p>
          <span className="clients-state-sub">
            Attributing media assets, scheduling timestamps & approval stages
          </span>
        </div>
      ) : error ? (
        <div className="clients-state-box error" role="alert">
          <div className="state-icon-badge error">
            <AlertCircle size={28} />
          </div>
          <h3 className="clients-state-title">Database Connection Error</h3>
          <p className="clients-state-desc">{error}</p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => loadPosts(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredPosts.length === 0 && viewMode !== 'calendar' ? (
        <div className="clients-empty-state-card">
          <div className="empty-state-icon">
            <CalendarDays size={32} />
          </div>
          <h3>No posts found</h3>
          <p>No content matches your current stage or format filter.</p>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => {
              setCurrentStage('all');
              setCurrentFormat('All Formats');
              setSelectedClientFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        <ContentCalendarView
          posts={filteredPosts}
          onSelectPost={(post) => setInspectedPost(post)}
          onSelectDate={handleSelectDateFromCalendar}
        />
      ) : viewMode === 'list' ? (
        <ContentListView
          posts={filteredPosts}
          onSelectPost={(post) => setInspectedPost(post)}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <ContentGridView
          posts={filteredPosts}
          onSelectPost={(post) => setInspectedPost(post)}
        />
      )}

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialDate={preselectedDate}
        initialClient={selectedClientFilter !== 'all' ? selectedClientFilter : ''}
        onCreatePost={handleCreatePost}
      />

      {/* Inspect Post Detail Modal */}
      <PostDetailModal
        post={inspectedPost}
        isOpen={Boolean(inspectedPost)}
        onClose={() => setInspectedPost(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}

export default ContentManagementPage;
