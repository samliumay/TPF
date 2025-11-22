/**
 * Dashboard - Main planning dashboard with Realism Point (RP) calculation
 * 
 * Displays:
 * - Realism Point (RP) metric: Load factor to determine if daily plan is feasible
 * - Today's tasks sorted by Importance Level (IL) and Ideal Deadline (IDL)
 * - Quick actions: Add Observation, CWA (Catastrophic Wipe Out)
 * 
 * Realism Point Formula: RP = Total Required Time (RT) / Available Free Time
 * - Safe Zone (RP < 0.8): Plan is realistic with good buffer
 * - Risky Zone (0.8 ≤ RP < 1.0): Tight schedule, requires focus
 * - Overload (RP ≥ 1.0): Impossible, immediate action required
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlanning } from '../features/planing/PlanningContext';
import { ROUTES } from '../config/routes';
import { RP_LIMITS, IMPORTANCE } from '../config/constants';

export default function Dashboard() {
  // Get planning context functions and state
  const { tasks, availableTime, setAvailableTime, getTodayTasks, catastrophicWipeOut } = usePlanning();
  
  // Get today's tasks - memoized to avoid recalculation on every render
  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks]);

  /**
   * Calculate Realism Point (RP)
   * 
   * RP is a Load Factor metric that determines if the daily plan is feasible.
   * Formula: RP = Total Required Time (RT) of Daily Tasks / Available Free Time
   * 
   * @returns {number} Realism Point value (0 to infinity)
   * 
   * - RP < 0.8: Safe Zone (green) - Plan is realistic with good buffer
   * - 0.8 ≤ RP < 1.0: Risky Zone (yellow) - Tight schedule, requires focus
   * - RP ≥ 1.0: Overload (red) - Impossible, immediate action required
   */
  const realismPoint = useMemo(() => {
    // Sum all Required Time (RT) from today's tasks
    const totalRT = todayTasks.reduce((sum, task) => sum + task.rt, 0);
    // Calculate RP: total time needed / time available
    // Return 0 if no available time to avoid division by zero
    return availableTime > 0 ? totalRT / availableTime : 0;
  }, [todayTasks, availableTime]);

  /**
   * Get Realism Point status and styling
   * 
   * @returns {Object} Status object with label, emoji, and SCSS CSS classes
   * 
   * Determines the RP zone (Safe/Risky/Overload) and returns appropriate
   * visual styling (colors, emoji) for UI display.
   */
  const getRPStatus = () => {
    // Safe Zone: RP < 0.8 - Plan is realistic with good buffer
    if (realismPoint < RP_LIMITS.SAFE) {
      return { 
        label: 'Safe Zone', 
        emoji: '🟢',
        statusClass: 'status--safe',
        textColor: 'text--green-600',
        bgColor: 'bg--green-50',
        borderColor: 'border--green-200',
        statusTextColor: 'text--green-800',
        messageColor: 'text--green-700'
      };
    }
    // Risky Zone: 0.8 ≤ RP < 1.0 - Tight schedule, requires focus
    else if (realismPoint < RP_LIMITS.RISKY) {
      return { 
        label: 'Risky Zone', 
        emoji: '🟡',
        statusClass: 'status--risky',
        textColor: 'text--yellow-600',
        bgColor: 'bg--yellow-50',
        borderColor: 'border--yellow-200',
        statusTextColor: 'text--yellow-800',
        messageColor: 'text--yellow-700'
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
        messageColor: 'text--red-700'
      };
    }
  };

  /**
   * Sort tasks by Importance Level (IL) ASC, then Ideal Deadline (IDL) ASC
   * 
   * Sorting Priority (per PF-D documentation):
   * 1. First by IL (Importance Level) - ascending (1=Must, 2=High, 3=Medium, 4=Optional)
   * 2. Then by IDL (Ideal Deadline) - ascending (earliest deadline first)
   * 
   * @returns {Array} Sorted array of today's tasks
   */
  const sortedTasks = useMemo(() => {
    return [...todayTasks].sort((a, b) => {
      // Primary sort: by Importance Level (ascending)
      if (a.il !== b.il) return a.il - b.il;
      // Secondary sort: by Ideal Deadline (ascending - earliest first)
      return new Date(a.idl) - new Date(b.idl);
    });
  }, [todayTasks]);

  /**
   * Get human-readable label for Importance Level
   * 
   * @param {number} il - Importance Level (1-4)
   * @returns {string} Label string ('Must', 'High', 'Medium', 'Optional')
   */
  const getImportanceLabel = (il) => {
    const labels = {
      [IMPORTANCE.MUST]: 'Must',      // Level 1: Emergencies, Finals, Interviews
      [IMPORTANCE.HIGH]: 'High',      // Level 2: Long-term goals, Projects
      [IMPORTANCE.MEDIUM]: 'Medium',  // Level 3: Side missions, Hobbies
      [IMPORTANCE.OPTIONAL]: 'Optional', // Level 4: Optional, mood-dependent
    };
    return labels[il] || 'Unknown';
  };

  /**
   * Get Tailwind CSS classes for Importance Level badge styling
   * 
   * @param {number} il - Importance Level (1-4)
   * @returns {string} Tailwind CSS classes for background and text colors
   */
  const getImportanceColor = (il) => {
    const colors = {
      [IMPORTANCE.MUST]: 'badge badge--red',      // Red for critical
      [IMPORTANCE.HIGH]: 'badge badge--orange', // Orange for high priority
      [IMPORTANCE.MEDIUM]: 'badge badge--yellow', // Yellow for medium
      [IMPORTANCE.OPTIONAL]: 'badge badge--gray',   // Gray for optional
    };
    return colors[il] || 'badge badge--gray';
  };

  const rpStatus = getRPStatus();
  const totalRT = todayTasks.reduce((sum, task) => sum + task.rt, 0);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Planning Dashboard</h1>
        <p className="page__subtitle">Monitor your daily plan feasibility with Realism Point (RP)</p>
      </div>

      {/* Realism Point Card */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Realism Point (RP)</h2>
          <span className="text-3xl">{rpStatus.emoji}</span>
        </div>
        
        <div className="grid grid--cols-1 grid--md-cols-3 grid--gap-4 mb-4">
          <div className="bg--gray-50 p-4 rounded-lg">
            <p className="text-sm text--gray-600 mb-1">Total Required Time</p>
            <p className="text-2xl font-bold text--gray-900">{totalRT.toFixed(1)}h</p>
          </div>
          <div className="bg--gray-50 p-4 rounded-lg">
            <p className="text-sm text--gray-600 mb-1">Available Time</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={availableTime}
                onChange={(e) => setAvailableTime(parseFloat(e.target.value) || 0)}
                className="form__input"
                style={{ width: '80px', fontSize: '1.125rem', fontWeight: '700' }}
                min="0"
                step="0.5"
              />
              <span className="text--gray-600">hours</span>
            </div>
          </div>
          <div className="bg--gray-50 p-4 rounded-lg">
            <p className="text-sm text--gray-600 mb-1">Realism Point</p>
            <p className={`text-2xl font-bold ${rpStatus.textColor}`}>
              {realismPoint.toFixed(2)}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${rpStatus.bgColor} border border--2 ${rpStatus.borderColor}`}>
          <p className={`font-semibold ${rpStatus.statusTextColor}`}>
            Status: {rpStatus.label}
          </p>
          {realismPoint >= RP_LIMITS.OVERLOAD && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ⚠️ Immediate action required: Consider CWA (Catastrophic Wipe Out) or postpone tasks.
            </p>
          )}
          {realismPoint >= RP_LIMITS.SAFE && realismPoint < RP_LIMITS.RISKY && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ⚠️ Tight schedule. Requires focus and minimal distractions.
            </p>
          )}
          {realismPoint < RP_LIMITS.SAFE && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ✓ Plan is realistic with good buffer time.
            </p>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Today's Tasks</h2>
          <Link
            to={ROUTES.DAILY_PLAN}
            className="text--primary-600 hover--text-primary-800 font-medium"
          >
            Manage Tasks →
          </Link>
        </div>

        {sortedTasks.length === 0 ? (
          <p className="text--gray-500 text-center py-8">No tasks scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="border border--gray-200 rounded-lg p-4 hover--shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text--gray-900 mb-2">{task.title}</h3>
                    <div className="flex gap-4 text-sm text--gray-600">
                      <span>⏱️ RT: {task.rt}h</span>
                      <span>📅 Deadline: {new Date(task.idl).toLocaleDateString()} {new Date(task.idl).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className={getImportanceColor(task.il)}>
                    {getImportanceLabel(task.il)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid--cols-1 grid--md-cols-2 grid--gap-4">
        <Link
          to={ROUTES.OBSERVATION_INPUT}
          className="btn btn--primary btn--full"
        >
          ➕ Add Observation
        </Link>
        {/* CWA (Catastrophic Wipe Out) - Emergency task removal */}
        <button
          className="btn btn--danger btn--full"
          onClick={() => {
            // Count non-critical tasks (IL > MUST) that will be removed
            const nonCriticalTasks = tasks.filter((task) => task.il !== IMPORTANCE.MUST);
            
            // Prevent execution if there are no non-critical tasks
            if (nonCriticalTasks.length === 0) {
              alert('No non-critical tasks to wipe. All tasks are marked as MUST (Level 1).');
              return;
            }
            
            // Confirm before executing CWA (destructive action)
            if (
              window.confirm(
                `Are you sure you want to trigger CWA?\n\nThis will permanently delete ${nonCriticalTasks.length} non-critical task(s) and keep only MUST (Level 1) tasks.\n\nThis action cannot be undone!`
              )
            ) {
              // Execute CWA: remove all non-critical tasks
              catastrophicWipeOut();
              alert(`CWA executed. ${nonCriticalTasks.length} non-critical task(s) removed. Only critical tasks remain.`);
            }
          }}
        >
          🚨 CWA (Catastrophic Wipe Out)
        </button>
      </div>
    </div>
  );
}

