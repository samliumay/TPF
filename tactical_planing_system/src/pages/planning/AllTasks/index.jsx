/**
 * AllTasks - View all tasks in the system
 * 
 * Displays all tasks without date filtering, organized by importance level.
 * Features:
 * - View all tasks with their properties (RT, IDL, IL)
 * - Edit and delete tasks
 * - View subtasks
 * - Filter by importance level
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../../features/planing/PlanningContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { IMPORTANCE } from '../../../config/constants';
import { filterTasksByImportance, filterRootTasks } from '../../../config/functions/taskFilters';
import { calculateTotalRT } from '../../../config/functions/rtCalculations';
import { sortTasksByPriority } from '../../../config/functions/taskSorting';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import SummaryGrid from '../../../components/ui/SummaryGrid';
import FilterBar from '../../../components/ui/FilterBar';
import TaskList from '../../../components/tasks/TaskList';
import EmptyState from '../../../components/ui/EmptyState';
import './AllTasks.scss';

export default function AllTasks() {
  const { tasks, deleteTask } = usePlanning();
  const navigate = useNavigate();
  const [selectedIL, setSelectedIL] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = filterRootTasks(tasks);
    
    if (selectedIL !== null) {
      filtered = filterTasksByImportance(filtered, selectedIL);
    }

    // Filter out completed tasks if showCompleted is false
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    return sortTasksByPriority(filtered);
  }, [tasks, selectedIL, showCompleted]);

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? All subtasks will also be deleted.')) {
      deleteTask(taskId);
    }
  };

  // Calculate total RT
  const totalRT = useMemo(() => {
    return calculateTotalRT(filteredTasks);
  }, [filteredTasks]);

  const summaryStats = [
    { label: 'Total Tasks', value: filteredTasks.length },
    { label: 'Total Required Time (RT)', value: `${totalRT.toFixed(1)}h` },
    { label: 'Average RT per Task', value: `${filteredTasks.length > 0 ? (totalRT / filteredTasks.length).toFixed(1) : 0}h` },
  ];

  const taskActions = (task) => (
    <>
      <button
        onClick={() => navigate(`${ROUTES.PLANNING.DAILY_TASKS}?task=${task.id}`)}
        className="task-list__action-btn"
        title="Edit task"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(task.id)}
        className="task-list__action-btn task-list__action-btn--danger"
        title="Delete task"
      >
        🗑️
      </button>
    </>
  );

  return (
    <div className="page">
      <PageHeader
        title="All Tasks"
        subtitle="View and manage all your tasks"
        action={
          <button 
            onClick={() => navigate(ROUTES.PLANNING.ADD_TASK)}
            className="btn btn--primary"
          >
            ➕ Add New Task
          </button>
        }
      />

      <Card className="mb-6">
        <FilterBar>
          <label className="form__label mb-0">Filter by Importance:</label>
          <select
            value={selectedIL === null ? '' : selectedIL}
            onChange={(e) => setSelectedIL(e.target.value === '' ? null : parseInt(e.target.value))}
            className="form__select"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="">All Levels</option>
            <option value={IMPORTANCE.MUST}>Level 1 - Must</option>
            <option value={IMPORTANCE.HIGH}>Level 2 - High</option>
            <option value={IMPORTANCE.MEDIUM}>Level 3 - Medium</option>
            <option value={IMPORTANCE.OPTIONAL}>Level 4 - Optional</option>
          </select>
          
          <label className="form__label mb-0 flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="form__checkbox"
            />
            <span>Show completed tasks</span>
          </label>
        </FilterBar>
      </Card>

      <Card className="mb-6">
        <SummaryGrid stats={summaryStats} columns={3} />
      </Card>

      <Card>
        <TaskList
          tasks={filteredTasks}
          actions={taskActions}
          emptyMessage={selectedIL === null ? 'No tasks yet' : 'No tasks with selected importance level'}
          emptyAction={
            <button
              onClick={() => navigate(ROUTES.PLANNING.ADD_TASK)}
              className="text--primary-600 hover--text-primary-800 font-medium"
            >
              Create your first task →
            </button>
          }
        />
      </Card>
    </div>
  );
}

