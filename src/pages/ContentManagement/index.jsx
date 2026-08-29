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
import { CalendarDays } from 'lucide-react';

export function ContentManagementPage({ activeClient = 'all' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState('all');
  const [currentFormat, setCurrentFormat] = useState('All Formats');
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list' | 'grid'

  // Modal States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState('2026-08-28');
  const [inspectedPost, setInspectedPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await contentService.getPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleCreatePost = async (newPostData) => {
    const created = await contentService.createPost(newPostData);
    setPosts((prev) => [created, ...prev]);
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    const updated = await contentService.updatePostStatus(postId, newStatus);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    if (inspectedPost && inspectedPost.id === postId) {
      setInspectedPost(updated);
    }
  };

  const handleDeletePost = async (postId) => {
    await contentService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
        currentStage === 'all' ? true : p.status.toLowerCase() === currentStage.toLowerCase();

      const matchesFormat =
        currentFormat === 'All Formats' ? true : p.type.toLowerCase() === currentFormat.toLowerCase();

      return matchesClient && matchesStage && matchesFormat;
    });
  }, [posts, selectedClientFilter, currentStage, currentFormat]);

  // Stage counters calculation
  const stageCounts = useMemo(() => {
    const relevant = selectedClientFilter === 'all' ? posts : posts.filter((p) => p.clientId === selectedClientFilter);
    return {
      total: relevant.length,
      scheduled: relevant.filter((p) => p.status === 'Scheduled').length,
      approved: relevant.filter((p) => p.status === 'Approved').length,
      inReview: relevant.filter((p) => p.status === 'In Review').length,
      draft: relevant.filter((p) => p.status === 'Draft').length,
      published: relevant.filter((p) => p.status === 'Published').length,
    };
  }, [posts, selectedClientFilter]);

  return (
    <div className="content-hub-page-container">
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
          setPreselectedDate('2026-08-28');
          setIsComposerOpen(true);
        }}
      />

      {/* Main View Area: Calendar, List, or Grid */}
      {filteredPosts.length === 0 && viewMode !== 'calendar' ? (
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
        initialClient={selectedClientFilter !== 'all' ? selectedClientFilter : 'c1'}
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
