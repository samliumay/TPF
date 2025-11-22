/**
 * TaskLinkManager - Component for managing task links
 * 
 * Allows users to:
 * - View all task links
 * - Create new links between tasks
 * - Remove existing links
 * 
 * Shows both directional links (linksTo) and reverse links (linkedFrom)
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../features/planing/PlanningContext';
import { getImportanceLabel } from '../../config/functions/importanceLevel';
import { filterTasksWithLinks } from '../../config/functions/taskFilters';

export default function TaskLinkManager() {
  const { tasks, linkTask, unlinkTask, getTaskById } = usePlanning();
  const [fromTaskId, setFromTaskId] = useState('');
  const [toTaskId, setToTaskId] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);

  // Get all tasks with links
  const tasksWithLinks = useMemo(() => {
    return filterTasksWithLinks(tasks);
  }, [tasks]);

  const handleCreateLink = () => {
    if (!fromTaskId || !toTaskId) {
      alert('Please select both tasks');
      return;
    }
    if (fromTaskId === toTaskId) {
      alert('A task cannot link to itself');
      return;
    }
    linkTask(parseFloat(fromTaskId), parseFloat(toTaskId));
    setFromTaskId('');
    setToTaskId('');
    setShowLinkForm(false);
  };

  const handleRemoveLink = (fromId, toId) => {
    if (window.confirm('Are you sure you want to remove this link?')) {
      unlinkTask(fromId, toId);
    }
  };

  return (
    <div className="task-link-manager">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text--gray-900 mb-2">Task Links</h3>
          <p className="text-sm text--gray-600">
            Manage directional relationships between tasks
          </p>
        </div>
        <button
          onClick={() => setShowLinkForm(!showLinkForm)}
          className="btn btn--primary"
        >
          {showLinkForm ? 'Cancel' : '+ Create Link'}
        </button>
      </div>

      {/* Link Creation Form */}
      {showLinkForm && (
        <div className="card mb-6">
          <h4 className="font-semibold text--gray-900 mb-4">Create New Link</h4>
          <div className="grid grid--cols-1 grid--md-cols-2 grid--gap-4 mb-4">
            <div className="form__group">
              <label className="form__label">From Task</label>
              <select
                value={fromTaskId}
                onChange={(e) => setFromTaskId(e.target.value)}
                className="form__select"
              >
                <option value="">Select a task...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({getImportanceLabel(task.il)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form__group">
              <label className="form__label">To Task</label>
              <select
                value={toTaskId}
                onChange={(e) => setToTaskId(e.target.value)}
                className="form__select"
              >
                <option value="">Select a task...</option>
                {tasks
                  .filter((task) => task.id.toString() !== fromTaskId)
                  .map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({getImportanceLabel(task.il)})
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button onClick={handleCreateLink} className="btn btn--primary">
            Create Link
          </button>
        </div>
      )}

      {/* Links List */}
      {tasksWithLinks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No task links yet</p>
          <p className="empty-state__subtitle">
            Create links to show relationships between tasks
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasksWithLinks.map((task) => (
            <div key={task.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text--gray-900">{task.title}</h4>
                  <p className="text-sm text--gray-600">
                    ⏱️ {task.rt}h | 📅 {new Date(task.idl).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Links To */}
              {task.linksTo && task.linksTo.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text--gray-700 mb-2">
                    Links to:
                  </p>
                  <div className="space-y-2">
                    {task.linksTo.map((linkedTaskId) => {
                      const linkedTask = getTaskById(linkedTaskId);
                      if (!linkedTask) return null;
                      return (
                        <div
                          key={linkedTaskId}
                          className="flex justify-between items-center p-2 bg--gray-50 rounded"
                        >
                          <span className="text-sm">
                            → {linkedTask.title} ({getImportanceLabel(linkedTask.il)})
                          </span>
                          <button
                            onClick={() => handleRemoveLink(task.id, linkedTaskId)}
                            className="text-xs text--red-600 hover--text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linked From */}
              {task.linkedFrom && task.linkedFrom.length > 0 && (
                <div>
                  <p className="text-sm font-medium text--gray-700 mb-2">
                    Linked from:
                  </p>
                  <div className="space-y-2">
                    {task.linkedFrom.map((linkedTaskId) => {
                      const linkedTask = getTaskById(linkedTaskId);
                      if (!linkedTask) return null;
                      return (
                        <div
                          key={linkedTaskId}
                          className="flex justify-between items-center p-2 bg--gray-50 rounded"
                        >
                          <span className="text-sm">
                            ← {linkedTask.title} ({getImportanceLabel(linkedTask.il)})
                          </span>
                          <button
                            onClick={() => handleRemoveLink(linkedTaskId, task.id)}
                            className="text-xs text--red-600 hover--text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

