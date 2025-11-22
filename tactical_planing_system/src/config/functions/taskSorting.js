/**
 * Task Sorting Functions - Task sorting utility functions
 * 
 * Provides utility functions for sorting tasks by various criteria.
 */

/**
 * Sort tasks by Priority (IL ASC, then IDL ASC)
 * 
 * Sorting Priority (per PF-D documentation):
 * 1. First by IL (Importance Level) - ascending (1=Must, 2=High, 3=Medium, 4=Optional)
 * 2. Then by IDL (Ideal Deadline) - ascending (earliest deadline first)
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted array of tasks (does not modify original array)
 */
export function sortTasksByPriority(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return [...tasks].sort((a, b) => {
    // Primary sort: by Importance Level (ascending)
    if (a.il !== b.il) {
      return (a.il || 0) - (b.il || 0);
    }
    // Secondary sort: by Ideal Deadline (ascending - earliest first)
    const dateA = new Date(a.idl || 0);
    const dateB = new Date(b.idl || 0);
    return dateA - dateB;
  });
}

/**
 * Sort tasks by deadline (IDL) - earliest first
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted array of tasks (does not modify original array)
 */
export function sortTasksByDeadline(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.idl || 0);
    const dateB = new Date(b.idl || 0);
    return dateA - dateB;
  });
}

/**
 * Sort tasks by RT (Required Time) - ascending
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted array of tasks (does not modify original array)
 */
export function sortTasksByRT(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return [...tasks].sort((a, b) => {
    return (a.rt || 0) - (b.rt || 0);
  });
}

/**
 * Sort tasks by RT (Required Time) - descending
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted array of tasks (does not modify original array)
 */
export function sortTasksByRTDesc(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  return [...tasks].sort((a, b) => {
    return (b.rt || 0) - (a.rt || 0);
  });
}

