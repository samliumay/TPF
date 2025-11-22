/**
 * TaskList - Reusable task list component with actions
 * 
 * Displays a list of tasks with optional action buttons
 */

import TaskItem from '../TaskItem';
import './TaskList.scss';

export default function TaskList({ tasks, actions, emptyMessage, emptyAction }) {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p className="task-list-empty__message">{emptyMessage || 'No tasks found'}</p>
        {emptyAction && (
          <div className="task-list-empty__action">
            {emptyAction}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-list__item">
          <TaskItem task={task} level={0} />
          {actions && (
            <div className="task-list__actions">
              {typeof actions === 'function' ? actions(task) : actions}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

