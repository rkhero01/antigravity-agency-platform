import React, { useState, useEffect, useMemo } from 'react';
import {
  TasksHeader,
  TasksKanbanBoard,
  TasksListView,
  TaskDetailModal,
  CreateTaskModal,
} from '../../components/tasks/index.js';
import { tasksService } from '../../services/tasksService.js';
import { CheckCircle2 } from 'lucide-react';

export function TasksWorkflowPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // View & Filter States
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Dialogs
  const [inspectedTask, setInspectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStage, setCreateInitialStage] = useState('To Do');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

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

  const loadTasks = async () => {
    setLoading(true);
    const data = await tasksService.getTasks();
    setTasks(data);
    setLoading(false);
  };

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : t.clientId === selectedClientFilter;
      const matchesPriority =
        selectedPriority === 'all'
          ? true
          : t.priority.toLowerCase() === selectedPriority.toLowerCase();
      const matchesAssignee =
        selectedAssignee === 'all'
          ? true
          : t.assignee.toLowerCase() === selectedAssignee.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPriority && matchesAssignee && matchesSearch;
    });
  }, [tasks, selectedClientFilter, selectedPriority, selectedAssignee, searchQuery]);

  // Dynamic Summary Metrics
  const calculatedMetrics = useMemo(() => {
    return tasksService.calculateTaskMetrics(filteredTasks);
  }, [filteredTasks]);

  // Handlers
  const handleMoveStage = async (id, newStatus) => {
    const updated = await tasksService.updateTaskStatus(id, newStatus);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    if (inspectedTask && inspectedTask.id === id) {
      setInspectedTask(updated);
    }
    showToast(`Task moved to "${newStatus}"`);
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    const updated = await tasksService.toggleSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (inspectedTask && inspectedTask.id === taskId) {
      setInspectedTask(updated);
    }
  };

  const handleDeleteTask = async (id) => {
    await tasksService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted successfully');
  };

  const handleCreateTask = async (newTaskData) => {
    const created = await tasksService.createTask(newTaskData);
    setTasks((prev) => [created, ...prev]);
    showToast(`🎉 Created task: "${created.title}"`);
  };

  const handleQuickAdd = (stageName) => {
    setCreateInitialStage(stageName);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="tasks-workflow-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <TasksHeader
        metrics={calculatedMetrics}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setCreateInitialStage('To Do');
          setIsCreateModalOpen(true);
        }}
      />

      {/* Main View Area: Kanban Board or Table View */}
      {viewMode === 'kanban' ? (
        <TasksKanbanBoard
          tasks={filteredTasks}
          onSelectTask={(task) => setInspectedTask(task)}
          onMoveStage={handleMoveStage}
          onQuickAddTask={handleQuickAdd}
        />
      ) : (
        <TasksListView
          tasks={filteredTasks}
          onSelectTask={(task) => setInspectedTask(task)}
          onMoveStage={handleMoveStage}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Task Detail & Subtasks Modal */}
      <TaskDetailModal
        task={inspectedTask}
        isOpen={Boolean(inspectedTask)}
        onClose={() => setInspectedTask(null)}
        onMoveStage={handleMoveStage}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialStage={createInitialStage}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}

export default TasksWorkflowPage;
