import { initialMockTasks } from '../data/mockTasks.js';

let tasksState = [...initialMockTasks];

export const tasksService = {
  /**
   * Fetch all tasks with filtering
   */
  async getTasks(filters = {}) {
    const { clientId, priority, assignee, status, search } = filters;

    let filtered = [...tasksState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((t) => t.clientId === clientId);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    if (assignee && assignee !== 'all') {
      filtered = filtered.filter((t) => t.assignee.toLowerCase() === assignee.toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.clientName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single task by ID
   */
  async getTaskById(id) {
    const task = tasksState.find((t) => t.id === id);
    return Promise.resolve(task || null);
  },

  /**
   * Create task
   */
  async createTask(taskData) {
    const newTask = {
      id: `task-${Date.now()}`,
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || '2026-08-30',
      category: taskData.category || 'General Operations',
      assigneeAvatar: taskData.assignee
        ? taskData.assignee
            .split(' ')
            .map((n) => n[0])
            .join('')
        : 'AG',
      subtasks: taskData.subtasks || [
        { id: `sub-1`, title: 'Review task requirements', completed: false },
        { id: `sub-2`, title: 'Execute deliverable', completed: false },
      ],
      ...taskData,
    };

    tasksState = [newTask, ...tasksState];
    return Promise.resolve(newTask);
  },

  /**
   * Update task status (Kanban stage move)
   */
  async updateTaskStatus(id, newStatus) {
    tasksState = tasksState.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    const updated = tasksState.find((t) => t.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Toggle individual subtask checklist item
   */
  async toggleSubtask(taskId, subtaskId) {
    tasksState = tasksState.map((t) => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubs = t.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    });

    const updated = tasksState.find((t) => t.id === taskId);
    return Promise.resolve(updated);
  },

  /**
   * Update full task details
   */
  async updateTask(id, updatedFields) {
    tasksState = tasksState.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    const updated = tasksState.find((t) => t.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Delete task
   */
  async deleteTask(id) {
    tasksState = tasksState.filter((t) => t.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Calculate summary metrics
   */
  calculateTaskMetrics(tasksList) {
    const total = tasksList.length;
    const todoCount = tasksList.filter((t) => t.status === 'To Do').length;
    const inProgressCount = tasksList.filter((t) => t.status === 'In Progress').length;
    const pendingApprovalCount = tasksList.filter((t) => t.status === 'Pending Approval').length;
    const completedCount = tasksList.filter((t) => t.status === 'Completed').length;
    const urgentCount = tasksList.filter(
      (t) => t.priority === 'Urgent' && t.status !== 'Completed'
    ).length;

    return {
      total,
      todoCount,
      inProgressCount,
      pendingApprovalCount,
      completedCount,
      urgentCount,
    };
  },
};

export default tasksService;
