/**
 * DailyTasks - View tasks for a specific day
 * 
 * Simplified page showing only tasks scheduled for the selected date.
 * Tasks are sorted by Importance Level (IL) and Ideal Deadline (IDL).
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../../features/planing/PlanningContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { filterTasksByDate } from '../../../config/functions/taskFilters';
import { calculateTotalRT } from '../../../config/functions/rtCalculations';
import { sortTasksByPriority } from '../../../config/functions/taskSorting';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import SummaryGrid from '../../../components/ui/SummaryGrid';
import FilterBar from '../../../components/ui/FilterBar';
import TaskList from '../../../components/tasks/TaskList';
import './DailyTasks.scss';

export default function DailyTasks() {
  const { tasks, deleteTask } = usePlanning();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCompleted, setShowCompleted] = useState(true);

  // Get tasks for selected date (only root tasks for date view)
  const filteredTasks = useMemo(() => {
    let dateFiltered = filterTasksByDate(tasks, selectedDate, false);
    
    // Filter out completed tasks if showCompleted is false
    if (!showCompleted) {
      dateFiltered = dateFiltered.filter(task => !task.completed);
    }
    
    return sortTasksByPriority(dateFiltered);
  }, [tasks, selectedDate, showCompleted]);

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
        onClick={() => navigate(ROUTES.PLANNING.ALL_TASKS)}
        className="task-list__action-btn"
        title="View all tasks"
      >
        👁️
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
        title="Daily Tasks"
        subtitle="Tasks scheduled for the selected date"
        action={
          <button 
            onClick={() => navigate(ROUTES.PLANNING.ADD_TASK)}
            className="btn btn--primary"
          >
            ➕ Add Task
          </button>
        }
      />

      <Card className="mb-6">
        <FilterBar>
          <div>
            <label htmlFor="date-selector" className="form__label">
              Select Date
            </label>
            <input
              type="date"
              id="date-selector"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form__input"
              style={{ maxWidth: '300px' }}
            />
          </div>
          
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
          emptyMessage="No tasks for this date"
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

