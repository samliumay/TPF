/**
 * Importance Level Functions - IL (Importance Level) utility functions
 * 
 * Provides utility functions for working with Importance Levels (1-4).
 * Used for displaying and styling importance levels across the application.
 */

import { IMPORTANCE } from '../constants';

/**
 * Get human-readable label for Importance Level
 * 
 * @param {number} il - Importance Level (1-4)
 * @returns {string} Label string ('Must', 'High', 'Medium', 'Optional')
 */
export function getImportanceLabel(il) {
  const labels = {
    [IMPORTANCE.MUST]: 'Must',      // Level 1: Emergencies, Finals, Interviews
    [IMPORTANCE.HIGH]: 'High',      // Level 2: Long-term goals, Projects
    [IMPORTANCE.MEDIUM]: 'Medium',  // Level 3: Side missions, Hobbies
    [IMPORTANCE.OPTIONAL]: 'Optional', // Level 4: Optional, mood-dependent
  };
  return labels[il] || 'Unknown';
}

/**
 * Get CSS class for Importance Level badge styling
 * 
 * @param {number} il - Importance Level (1-4)
 * @returns {string} CSS class string for badge styling
 */
export function getImportanceColor(il) {
  const colors = {
    [IMPORTANCE.MUST]: 'badge badge--red',      // Red for critical
    [IMPORTANCE.HIGH]: 'badge badge--orange',   // Orange for high priority
    [IMPORTANCE.MEDIUM]: 'badge badge--yellow', // Yellow for medium
    [IMPORTANCE.OPTIONAL]: 'badge badge--gray', // Gray for optional
  };
  return colors[il] || 'badge badge--gray';
}

/**
 * Get all importance level information
 * 
 * @param {number} il - Importance Level (1-4)
 * @returns {Object} Object containing label and color class
 */
export function getImportanceInfo(il) {
  return {
    label: getImportanceLabel(il),
    color: getImportanceColor(il),
    value: il,
  };
}

