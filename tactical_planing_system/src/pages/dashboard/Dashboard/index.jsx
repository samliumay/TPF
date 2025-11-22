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
import { usePlanning } from '../../../features/planing/PlanningContext';
import { ROUTES } from '../../../config/routes';
import { RP_LIMITS, IMPORTANCE } from '../../../config/constants';
import { calculateRealismPoint, getRPStatus } from '../../../config/functions/realismPoint';
import { calculateTotalRT } from '../../../config/functions/rtCalculations';
import { getImportanceLabel, getImportanceColor } from '../../../config/functions/importanceLevel';
import { sortTasksByPriority } from '../../../config/functions/taskSorting';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import SummaryGrid from '../../../components/ui/SummaryGrid';
import TaskList from '../../../components/tasks/TaskList';
import './Dashboard.scss';

export default function Dashboard() {
  // Get planning context functions and state
  const { tasks, availableTime, setAvailableTime, getTodayTasks, catastrophicWipeOut } = usePlanning();
  
  // Get today's tasks - memoized to avoid recalculation on every render
  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks]);

  // Calculate Realism Point (RP)
  const realismPoint = useMemo(() => {
    return calculateRealismPoint(todayTasks, availableTime);
  }, [todayTasks, availableTime]);

  // Get RP status
  const rpStatus = useMemo(() => {
    return getRPStatus(realismPoint);
  }, [realismPoint]);

  // Sort tasks by Priority
  const sortedTasks = useMemo(() => {
    return sortTasksByPriority(todayTasks);
  }, [todayTasks]);

  // Calculate total RT
  const totalRT = useMemo(() => {
    return calculateTotalRT(todayTasks);
  }, [todayTasks]);

  const rpStats = [
    { label: 'Total Required Time', value: `${totalRT.toFixed(1)}h` },
    { 
      label: 'Available Time', 
      value: (
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
      )
    },
    { 
      label: 'Realism Point', 
      value: <span className={rpStatus.textColor}>{realismPoint.toFixed(2)}</span>
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Planning Dashboard"
        subtitle="Monitor your daily plan feasibility with Realism Point (RP)"
      />

      {/* Realism Point Card */}
      <Card
        header={
          <div className="card__header">
            <h2 className="card__title">Realism Point (RP)</h2>
            <span className="text-3xl">{rpStatus.emoji}</span>
          </div>
        }
      >
        <div className="mb-4">
          <SummaryGrid stats={rpStats} columns={3} />
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
      </Card>

      {/* Tasks List */}
      <Card
        header={
          <div className="card__header">
            <h2 className="card__title">Today's Tasks</h2>
            <Link
              to={ROUTES.DAILY_PLAN}
              className="text--primary-600 hover--text-primary-800 font-medium"
            >
              Manage Tasks →
            </Link>
          </div>
        }
      >
        <TaskList
          tasks={sortedTasks}
          emptyMessage="No tasks scheduled for today."
        />
      </Card>

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

