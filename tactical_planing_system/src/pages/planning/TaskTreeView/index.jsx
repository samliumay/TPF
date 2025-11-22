/**
 * TaskTreeView - Visual tree diagram showing task relationships and dependencies
 * 
 * Displays tasks in a hierarchical tree structure showing:
 * - Parent-child relationships (subtasks)
 * - Task links (directional connections)
 * 
 * Features:
 * - Expandable/collapsible nodes
 * - Visual indicators for links
 * - Click to navigate/edit tasks
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../../features/planing/PlanningContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { getImportanceLabel, getImportanceColor } from '../../../config/functions/importanceLevel';
import './TaskTreeView.scss';

export default function TaskTreeView() {
  const { tasks, getTaskTree, getTaskById } = usePlanning();
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const taskTree = useMemo(() => getTaskTree(), [getTaskTree]);

  const toggleNode = (taskId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    navigate(ROUTES.PLANNING.ALL_TASKS);
  };


  const TreeNode = ({ task, level = 0 }) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedNodes.has(task.id);
    const isSelected = selectedTaskId === task.id;
    const hasLinks = (task.linksTo && task.linksTo.length > 0) || 
                     (task.linkedFrom && task.linkedFrom.length > 0);

    return (
      <div className="task-tree-node" style={{ marginLeft: `${level * 24}px` }}>
        <div
          className={`task-tree-node__content ${isSelected ? 'task-tree-node__content--selected' : ''}`}
          onClick={() => handleTaskClick(task.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(task.id);
                }}
                className="task-tree-node__toggle"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <span className="task-tree-node__spacer" />}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text--gray-900">{task.title}</span>
                <span className={getImportanceColor(task.il)}>
                  {getImportanceLabel(task.il)}
                </span>
                {hasLinks && (
                  <span className="text-xs text--primary-600" title="Has links">
                    🔗
                  </span>
                )}
              </div>
              <div className="text-xs text--gray-600 mt-1">
                ⏱️ {task.rt}h | 📅 {new Date(task.idl).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Render links */}
        {task.linksTo && task.linksTo.length > 0 && (
          <div className="task-tree-node__links" style={{ marginLeft: `${(level + 1) * 24}px` }}>
            {task.linksTo.map((linkedTaskId) => {
              const linkedTask = getTaskById(linkedTaskId);
              if (!linkedTask) return null;
              return (
                <div
                  key={linkedTaskId}
                  className="task-tree-node__link"
                  onClick={() => handleTaskClick(linkedTaskId)}
                >
                  → {linkedTask.title}
                </div>
              );
            })}
          </div>
        )}

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="task-tree-node__children">
            {task.children.map((child) => (
              <TreeNode key={child.id} task={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Task Tree View</h1>
        <p className="page__subtitle">Visual tree diagram showing task relationships and dependencies</p>
      </div>

      <div className="card">
        {taskTree.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No tasks yet</p>
            <p className="empty-state__subtitle">Create your first task to see the tree structure</p>
            <button
              onClick={() => navigate(ROUTES.PLANNING.ADD_TASK)}
              className="btn btn--primary mt-4"
            >
              Add Task
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text--gray-900 mb-2">Task Dependencies</h3>
              <p className="text-sm text--gray-600">
                Click on tasks to view details. Expand/collapse nodes to view subtasks. 
                Links (🔗) indicate task relationships.
              </p>
            </div>
            <div className="task-tree-view__container">
              {taskTree.map((rootTask) => (
                <TreeNode key={rootTask.id} task={rootTask} level={0} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

