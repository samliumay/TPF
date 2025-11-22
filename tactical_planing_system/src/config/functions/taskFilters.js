/**
 * Task Filtering Functions - Task filtering utility functions
 * 
 * Provides utility functions for filtering tasks by various criteria.
 */

/**
 * Filter tasks for a specific date
 * 
 * @param {Array} tasks - Array of task objects
 * @param {string|Date} date - Date string (YYYY-MM-DD) or Date object
 * @param {boolean} includeSubtasks - Whether to include subtasks (default: false)
 * @returns {Array} Filtered array of tasks for the specified date
 */
export function filterTasksByDate(tasks, date, includeSubtasks = false) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return tasks.filter((task) => {
    const taskDate = new Date(task.idl);
    const isInDateRange = taskDate >= targetDate && taskDate < nextDay;
    
    if (includeSubtasks) {
      return isInDateRange;
    }
    
    // Exclude subtasks when includeSubtasks is false
    return isInDateRange && !task.parentTaskId;
  });
}

/**
 * Filter tasks that have links (either linksTo or linkedFrom)
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Filtered array of tasks that have links
 */
export function filterTasksWithLinks(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter(
    (task) =>
      (task.linksTo && task.linksTo.length > 0) ||
      (task.linkedFrom && task.linkedFrom.length > 0)
  );
}

/**
 * Filter tasks by Importance Level
 * 
 * @param {Array} tasks - Array of task objects
 * @param {number} il - Importance Level (1-4)
 * @returns {Array} Filtered array of tasks with the specified IL
 */
export function filterTasksByImportance(tasks, il) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter((task) => task.il === il);
}

/**
 * Filter root tasks (tasks without a parent)
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Filtered array of root tasks
 */
export function filterRootTasks(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter((task) => !task.parentTaskId);
}

/**
 * Filter subtasks (tasks with a parent)
 * 
 * @param {Array} tasks - Array of task objects
 * @param {number} [parentTaskId] - Optional parent task ID to filter by
 * @returns {Array} Filtered array of subtasks
 */
export function filterSubtasks(tasks, parentTaskId = null) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter((task) => {
    if (!task.parentTaskId) {
      return false;
    }
    if (parentTaskId !== null) {
      return task.parentTaskId === parentTaskId;
    }
    return true;
  });
}

