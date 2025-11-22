/**
 * RT Calculations - Required Time (RT) calculation functions
 * 
 * Provides utility functions for calculating RT statistics from tasks.
 * All RT calculations should use functions from this file.
 */

/**
 * Calculate total RT (Required Time) from an array of tasks
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @returns {number} Total RT in hours
 */
export function calculateTotalRT(tasks) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }
  return tasks.reduce((sum, task) => sum + (task.rt || 0), 0);
}

/**
 * Calculate average RT (Required Time) from an array of tasks
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @returns {number} Average RT in hours
 */
export function calculateAverageRT(tasks) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }
  const totalRT = calculateTotalRT(tasks);
  return totalRT / tasks.length;
}

/**
 * Calculate maximum RT (Required Time) from an array of tasks
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @returns {number} Maximum RT in hours
 */
export function calculateMaxRT(tasks) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }
  return Math.max(...tasks.map(task => task.rt || 0));
}

/**
 * Calculate minimum RT (Required Time) from an array of tasks
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @returns {number} Minimum RT in hours
 */
export function calculateMinRT(tasks) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }
  return Math.min(...tasks.map(task => task.rt || 0));
}

/**
 * Calculate comprehensive RT statistics from tasks
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @returns {Object} RT statistics object containing:
 *   - totalRT: Total RT in hours
 *   - avgRT: Average RT in hours
 *   - maxRT: Maximum RT in hours
 *   - minRT: Minimum RT in hours
 *   - taskCount: Number of tasks
 */
export function calculateRTStats(tasks) {
  return {
    totalRT: calculateTotalRT(tasks),
    avgRT: calculateAverageRT(tasks),
    maxRT: calculateMaxRT(tasks),
    minRT: calculateMinRT(tasks),
    taskCount: tasks && Array.isArray(tasks) ? tasks.length : 0,
  };
}

