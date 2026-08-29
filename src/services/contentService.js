import { initialMockPosts } from '../data/mockContent.js';

let postsState = [...initialMockPosts];

export const contentService = {
  async getPosts(clientId = null) {
    if (clientId && clientId !== 'all') {
      return Promise.resolve(postsState.filter((p) => p.clientId === clientId));
    }
    return Promise.resolve([...postsState]);
  },

  async createPost(postData) {
    const newPost = {
      id: `post-${Date.now()}`,
      status: postData.status || 'Draft',
      author: 'Alex Morgan (You)',
      mediaPreview:
        postData.mediaPreview ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      likesCount: 0,
      commentsCount: 0,
      ...postData,
    };
    postsState = [newPost, ...postsState];
    return Promise.resolve(newPost);
  },

  async updatePostStatus(postId, newStatus) {
    postsState = postsState.map((p) => (p.id === postId ? { ...p, status: newStatus } : p));
    const updated = postsState.find((p) => p.id === postId);
    return Promise.resolve(updated);
  },

  async deletePost(postId) {
    postsState = postsState.filter((p) => p.id !== postId);
    return Promise.resolve(true);
  },
};
