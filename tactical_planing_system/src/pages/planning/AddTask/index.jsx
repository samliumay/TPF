/**
 * AddTask - Dedicated page for adding new tasks
 * 
 * Features:
 * - Form to add new tasks with all properties
 * - Support for creating root tasks or subtasks
 * - Automatic redirect after successful creation
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../../features/planing/PlanningContext';
import { useNavigate } from 'react-router-dom';
import { IMPORTANCE } from '../../../config/constants';
import { ROUTES } from '../../../config/routes';
import { getImportanceLabel } from '../../../config/functions/importanceLevel';
import { filterRootTasks } from '../../../config/functions/taskFilters';
import './AddTask.scss';

export default function AddTask() {
  const { tasks, addTask } = usePlanning();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    rt: '',
    idl: new Date().toISOString().slice(0, 16),
    il: IMPORTANCE.MEDIUM,
    parentTaskId: '',
  });

  // Get root tasks for parent selection
  const availableParentTasks = useMemo(() => {
    return filterRootTasks(tasks);
  }, [tasks]);

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

    addTask(taskData);
    alert('Task added successfully!');
    
    // Redirect based on whether it's a subtask or root task
    if (formData.parentTaskId) {
      navigate(ROUTES.PLANNING.ALL_TASKS);
    } else {
      navigate(ROUTES.PLANNING.DAILY_TASKS);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Add New Task</h1>
        <p className="page__subtitle">Create a new task with its properties</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                placeholder="Enter task title..."
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
                placeholder="e.g., 2.5"
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
              Add Task
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.PLANNING.ALL_TASKS)}
              className="btn btn--secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

