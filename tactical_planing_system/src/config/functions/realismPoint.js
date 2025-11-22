/**
 * Realism Point Calculations - RP (Realism Point) calculation functions
 * 
 * RP is a Load Factor metric that determines if the daily plan is feasible.
 * Formula: RP = Total Required Time (RT) / Available Free Time
 * 
 * Zones:
 * - Safe Zone (RP < 0.8): Plan is realistic with good buffer
 * - Risky Zone (0.8 ≤ RP < 1.0): Tight schedule, requires focus
 * - Overload (RP ≥ 1.0): Impossible, immediate action required
 */

import { RP_LIMITS } from '../constants';
import { calculateTotalRT } from './rtCalculations';

/**
 * Calculate Realism Point (RP) for given tasks and available time
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @param {number} availableTime - Available free time in hours
 * @returns {number} Realism Point value (0 to infinity)
 */
export function calculateRealismPoint(tasks, availableTime) {
  if (!availableTime || availableTime <= 0) {
    return 0;
  }
  const totalRT = calculateTotalRT(tasks);
  return totalRT / availableTime;
}

/**
 * Get RP status with styling information
 * 
 * @param {number} rp - Realism Point value
 * @returns {Object} Status object with:
 *   - label: Status label ('Safe Zone', 'Risky Zone', 'Overload')
 *   - emoji: Status emoji (🟢, 🟡, 🔴)
 *   - statusClass: CSS class for status styling
 *   - textColor: CSS class for text color
 *   - bgColor: CSS class for background color
 *   - borderColor: CSS class for border color
 *   - statusTextColor: CSS class for status text color
 *   - messageColor: CSS class for message text color
 */
export function getRPStatus(rp) {
  // Safe Zone: RP < 0.8 - Plan is realistic with good buffer
  if (rp < RP_LIMITS.SAFE) {
    return {
      label: 'Safe Zone',
      emoji: '🟢',
      statusClass: 'status--safe',
      textColor: 'text--green-600',
      bgColor: 'bg--green-50',
      borderColor: 'border--green-200',
      statusTextColor: 'text--green-800',
      messageColor: 'text--green-700',
      status: 'Safe',
      color: 'text--green-600',
    };
  }
  // Risky Zone: 0.8 ≤ RP < 1.0 - Tight schedule, requires focus
  else if (rp < RP_LIMITS.RISKY) {
    return {
      label: 'Risky Zone',
      emoji: '🟡',
      statusClass: 'status--risky',
      textColor: 'text--yellow-600',
      bgColor: 'bg--yellow-50',
      borderColor: 'border--yellow-200',
      statusTextColor: 'text--yellow-800',
      messageColor: 'text--yellow-700',
      status: 'Risky',
      color: 'text--yellow-600',
    };
  }
  // Overload: RP ≥ 1.0 - Impossible, immediate action required
  else {
    return {
      label: 'Overload',
      emoji: '🔴',
      statusClass: 'status--overload',
      textColor: 'text--red-600',
      bgColor: 'bg--red-50',
      borderColor: 'border--red-200',
      statusTextColor: 'text--red-800',
      messageColor: 'text--red-700',
      status: 'Overload',
      color: 'text--red-600',
    };
  }
}

/**
 * Calculate RP statistics with status
 * 
 * @param {Array} tasks - Array of task objects with 'rt' property
 * @param {number} availableTime - Available free time in hours
 * @returns {Object} RP statistics object containing:
 *   - rp: Realism Point value
 *   - totalRT: Total RT in hours
 *   - availableTime: Available time in hours
 *   - status: RP status object from getRPStatus()
 */
export function calculateRPStats(tasks, availableTime) {
  const rp = calculateRealismPoint(tasks, availableTime);
  const status = getRPStatus(rp);
  const totalRT = calculateTotalRT(tasks);

  return {
    rp,
    totalRT,
    availableTime,
    ...status,
  };
}

