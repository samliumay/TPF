/**
 * TaskItem - Hierarchical task item component with checkbox (TickTick-style)
 * 
 * Displays a task with:
 * - Clickable checkbox to mark as completed
 * - Hierarchical indentation for subtasks
 * - Strikethrough for completed tasks
 * - Task metadata (RT, deadline, importance)
 */

import { usePlanning } from '../../../features/planing/PlanningContext';
import { getImportanceLabel, getImportanceColor } from '../../../config/functions/importanceLevel';
import './TaskItem.scss';

export default function TaskItem({ task, level = 0, showSubtasks = true }) {
  const { toggleTaskCompletion, getSubtasks } = usePlanning();
  const subtasks = showSubtasks ? getSubtasks(task.id) : [];

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`task-item task-item--level-${level} ${task.completed ? 'task-item--completed' : ''}`}>
      <div className="task-item__content">
        {/* Checkbox - positioned absolutely like TickTick */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`task-item__checkbox ${task.completed ? 'task-item__checkbox--checked' : ''}`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <span className="task-item__checkbox-wrapper">
            {/* Default checkbox icon */}
            <svg className="task-item__checkbox-icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {/* Hover checkbox icon */}
            <svg className="task-item__checkbox-icon task-item__checkbox-icon--hover" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {/* Checkmark icon (shown when checked) */}
            <svg className="task-item__checkbox-checkmark" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="15" height="15" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 8.5L7 11.5L13 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {/* Task Info */}
        <div className="task-item__info">
          <div className="task-item__header">
            <h3 className={`task-item__title ${task.completed ? 'task-item__title--completed' : ''}`}>
              {task.title}
            </h3>
            <span className={getImportanceColor(task.il)}>
              {getImportanceLabel(task.il)}
            </span>
          </div>
          
          <div className="task-item__meta">
            <span className="task-item__meta-item">⏱️ {task.rt}h</span>
            <span className="task-item__meta-item">📅 {formatDate(task.idl)}</span>
            {subtasks.length > 0 && (
              <span className="task-item__meta-item">📋 {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks (hierarchical) */}
      {subtasks.length > 0 && (
        <div className="task-item__subtasks">
          {subtasks.map((subtask) => (
            <TaskItem 
              key={subtask.id} 
              task={subtask} 
              level={level + 1}
              showSubtasks={showSubtasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

