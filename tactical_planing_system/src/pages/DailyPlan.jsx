/**
 * DailyPlan - Task management page with tabs for different views
 * 
 * Features:
 * - Tab 1: Task Management - Create, Read, Update, Delete tasks with subtask support
 * - Tab 2: Task Tree View - Visual tree diagram showing task relationships
 * - Tab 3: Task Links - Manage directional links between tasks
 * 
 * Task Properties:
 * - Title, RT (Required Time), IDL (Ideal Deadline), IL (Importance Level)
 * - Parent Task (for subtasks)
 * - Links to other tasks
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../features/planing/PlanningContext';
import { IMPORTANCE } from '../config/constants';
import TaskTreeView from '../components/tasks/TaskTreeView';
import TaskLinkManager from '../components/tasks/TaskLinkManager';

const TABS = {
  MANAGEMENT: 'management',
  TREE: 'tree',
  LINKS: 'links',
};

export default function DailyPlan() {
  const { tasks, addTask, updateTask, deleteTask, getRootTasks, getSubtasks } = usePlanning();
  const [activeTab, setActiveTab] = useState(TABS.MANAGEMENT);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    rt: '',
    idl: '',
    il: IMPORTANCE.MEDIUM,
    parentTaskId: '',
  });

  // Get tasks for selected date (only root tasks for date view)
  const filteredTasks = useMemo(() => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return tasks
      .filter((task) => {
        const taskDate = new Date(task.idl);
        return taskDate >= targetDate && taskDate < nextDay && !task.parentTaskId;
      })
      .sort((a, b) => {
        // Sort by IL ASC, then IDL ASC
        if (a.il !== b.il) return a.il - b.il;
        return new Date(a.idl) - new Date(b.idl);
      });
  }, [tasks, selectedDate]);

  const getImportanceLabel = (il) => {
    const labels = {
      [IMPORTANCE.MUST]: 'Must',
      [IMPORTANCE.HIGH]: 'High',
      [IMPORTANCE.MEDIUM]: 'Medium',
      [IMPORTANCE.OPTIONAL]: 'Optional',
    };
    return labels[il] || 'Unknown';
  };

  const getImportanceColor = (il) => {
    const colors = {
      [IMPORTANCE.MUST]: 'badge badge--red',
      [IMPORTANCE.HIGH]: 'badge badge--orange',
      [IMPORTANCE.MEDIUM]: 'badge badge--yellow',
      [IMPORTANCE.OPTIONAL]: 'badge badge--gray',
    };
    return colors[il] || 'badge badge--gray';
  };

  const handleOpenForm = (task = null, parentTaskId = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        rt: task.rt.toString(),
        idl: new Date(task.idl).toISOString().slice(0, 16),
        il: task.il,
        parentTaskId: task.parentTaskId ? task.parentTaskId.toString() : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        rt: '',
        idl: new Date(selectedDate).toISOString().slice(0, 16),
        il: IMPORTANCE.MEDIUM,
        parentTaskId: parentTaskId ? parentTaskId.toString() : '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setSelectedTaskForSubtask(null);
    setFormData({
      title: '',
      rt: '',
      idl: '',
      il: IMPORTANCE.MEDIUM,
      parentTaskId: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.rt || !formData.idl) {
      alert('Please fill in all required fields');
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      rt: parseFloat(formData.rt),
      idl: new Date(formData.idl),
      il: parseInt(formData.il),
      parentTaskId: formData.parentTaskId ? parseFloat(formData.parentTaskId) : null,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    handleCloseForm();
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? All subtasks will also be deleted.')) {
      deleteTask(taskId);
    }
  };

  const totalRT = filteredTasks.reduce((sum, task) => sum + task.rt, 0);

  // Get root tasks for parent selection (exclude current task if editing)
  const availableParentTasks = useMemo(() => {
    return tasks.filter(
      (task) => !task.parentTaskId && (!editingTask || task.id !== editingTask.id)
    );
  }, [tasks, editingTask]);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Daily Plan</h1>
        <p className="page__subtitle">Manage your tasks, view relationships, and create links</p>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2 border-b border--gray-200">
          <button
            onClick={() => setActiveTab(TABS.MANAGEMENT)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.MANAGEMENT
                ? 'text--primary-600 border-b-2 border--primary-600'
                : 'text--gray-600 hover--text-primary-600'
            }`}
          >
            Task Management
          </button>
          <button
            onClick={() => setActiveTab(TABS.TREE)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.TREE
                ? 'text--primary-600 border-b-2 border--primary-600'
                : 'text--gray-600 hover--text-primary-600'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setActiveTab(TABS.LINKS)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.LINKS
                ? 'text--primary-600 border-b-2 border--primary-600'
                : 'text--gray-600 hover--text-primary-600'
            }`}
          >
            Task Links
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === TABS.MANAGEMENT && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text--gray-900">Task Management</h2>
            </div>
            <button onClick={() => handleOpenForm()} className="btn btn--primary">
              ➕ Add Task
            </button>
          </div>

          {/* Date Selector */}
          <div className="card mb-6" style={{ padding: '1rem' }}>
            <label htmlFor="date-selector" className="form__label">
              Select Date
            </label>
            <input
              type="date"
              id="date-selector"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form__input"
            />
          </div>

          {/* Summary */}
          <div className="card mb-6" style={{ padding: '1rem' }}>
            <div className="grid grid--cols-1 grid--md-cols-3 grid--gap-4">
              <div>
                <p className="text-sm text--gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text--gray-900">{filteredTasks.length}</p>
              </div>
              <div>
                <p className="text-sm text--gray-600">Total Required Time (RT)</p>
                <p className="text-2xl font-bold text--gray-900">{totalRT.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-sm text--gray-600">Average RT per Task</p>
                <p className="text-2xl font-bold text--gray-900">
                  {filteredTasks.length > 0 ? (totalRT / filteredTasks.length).toFixed(1) : 0}h
                </p>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="card">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state__title">No tasks for this date</p>
                <button
                  onClick={() => handleOpenForm()}
                  className="text--primary-600 hover--text-primary-800 font-medium"
                >
                  Create your first task →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const subtasks = getSubtasks(task.id);
                  return (
                    <div key={task.id} className="border border--gray-200 rounded-lg p-4 hover--shadow-md">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text--gray-900 mb-2" style={{ fontSize: '1.125rem' }}>
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text--gray-600">
                            <span className="flex items-center gap-1">
                              ⏱️ <strong>RT:</strong> {task.rt}h
                            </span>
                            <span className="flex items-center gap-1">
                              📅 <strong>Deadline:</strong>{' '}
                              {new Date(task.idl).toLocaleDateString()}{' '}
                              {new Date(task.idl).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {subtasks.length > 0 && (
                              <span className="flex items-center gap-1">
                                📋 <strong>Subtasks:</strong> {subtasks.length}
                              </span>
                            )}
                          </div>
                          {/* Show subtasks */}
                          {subtasks.length > 0 && (
                            <div className="mt-3 ml-4 border-l-2 border--primary-200 pl-3">
                              <p className="text-xs font-medium text--gray-600 mb-2">Subtasks:</p>
                              {subtasks.map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="text-sm text--gray-700 mb-1 flex items-center gap-2"
                                >
                                  <span>• {subtask.title}</span>
                                  <span className={getImportanceColor(subtask.il)}>
                                    {getImportanceLabel(subtask.il)}
                                  </span>
                                  <span className="text-xs">({subtask.rt}h)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={getImportanceColor(task.il)}>
                            {getImportanceLabel(task.il)}
                          </span>
                          <button
                            onClick={() => handleOpenForm(null, task.id)}
                            className="text-xs text--primary-600 hover--text-primary-800 px-2 py-1"
                            title="Add subtask"
                          >
                            ➕ Sub
                          </button>
                          <button
                            onClick={() => handleOpenForm(task)}
                            className="text--primary-600 hover--text-primary-800 px-2 py-1 text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text--red-600 hover--text-red-800 px-2 py-1 text-sm font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === TABS.TREE && (
        <div className="card">
          <TaskTreeView
            onTaskSelect={(task) => {
              if (task) {
                handleOpenForm(task);
                setActiveTab(TABS.MANAGEMENT);
              }
            }}
          />
        </div>
      )}

      {activeTab === TABS.LINKS && (
        <div className="card">
          <TaskLinkManager />
        </div>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="modal">
          <div className="modal__content">
            <h2 className="modal__title">
              {editingTask ? 'Edit Task' : selectedTaskForSubtask ? 'Add Subtask' : 'Add New Task'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="form__group">
                  <label htmlFor="title" className="form__label">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form__input"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="rt" className="form__label">
                    Required Time (RT) in hours *
                  </label>
                  <input
                    type="number"
                    id="rt"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    className="form__input"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="idl" className="form__label">
                    Ideal Deadline (IDL) *
                  </label>
                  <input
                    type="datetime-local"
                    id="idl"
                    value={formData.idl}
                    onChange={(e) => setFormData({ ...formData, idl: e.target.value })}
                    className="form__input"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="il" className="form__label">
                    Importance Level (IL) *
                  </label>
                  <select
                    id="il"
                    value={formData.il}
                    onChange={(e) => setFormData({ ...formData, il: parseInt(e.target.value) })}
                    className="form__select"
                    required
                  >
                    <option value={IMPORTANCE.MUST}>Level 1 - Must (Emergencies, Finals)</option>
                    <option value={IMPORTANCE.HIGH}>Level 2 - High (Long-term goals, Projects)</option>
                    <option value={IMPORTANCE.MEDIUM}>Level 3 - Medium (Side missions, Hobbies)</option>
                    <option value={IMPORTANCE.OPTIONAL}>Level 4 - Optional (Mood-dependent)</option>
                  </select>
                </div>

                <div className="form__group">
                  <label htmlFor="parentTaskId" className="form__label">
                    Parent Task (Optional - for subtasks)
                  </label>
                  <select
                    id="parentTaskId"
                    value={formData.parentTaskId}
                    onChange={(e) => setFormData({ ...formData, parentTaskId: e.target.value })}
                    className="form__select"
                  >
                    <option value="">None (Root Task)</option>
                    {availableParentTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({getImportanceLabel(task.il)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn btn--secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
