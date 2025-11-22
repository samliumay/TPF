/**
 * TaskConfiguration - Task configuration and management page
 * 
 * Features:
 * - Task Links management (create, view, remove links between tasks)
 * - RT (Required Time) calculations and statistics
 * - Overview of task relationships
 */

import { useState, useMemo } from 'react';
import { usePlanning } from '../../../features/planing/PlanningContext';
import TaskLinkManager from '../../../components/tasks/TaskLinkManager';
import { filterTasksByDate, filterTasksWithLinks } from '../../../config/functions/taskFilters';
import { calculateRTStats, calculateTotalRT } from '../../../config/functions/rtCalculations';
import { calculateRealismPoint, getRPStatus } from '../../../config/functions/realismPoint';
import './TaskConfiguration.scss';

export default function TaskConfiguration() {
  const { tasks, availableTime } = usePlanning();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Get tasks for selected date
  const tasksForDate = useMemo(() => {
    return filterTasksByDate(tasks, selectedDate, false);
  }, [tasks, selectedDate]);

  // Calculate RT statistics
  const rtStats = useMemo(() => {
    const stats = calculateRTStats(tasksForDate);
    const totalRT = stats.totalRT;
    
    // Calculate Realism Point (RP)
    const rp = calculateRealismPoint(tasksForDate, availableTime);
    const rpStatus = getRPStatus(rp);

    return {
      ...stats,
      rp,
      rpStatus: rpStatus.status,
      rpColor: rpStatus.color,
    };
  }, [tasksForDate, availableTime]);

  // Get tasks with links
  const tasksWithLinks = useMemo(() => {
    return filterTasksWithLinks(tasks);
  }, [tasks]);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Task Configuration</h1>
        <p className="page__subtitle">Manage task links and view RT calculations</p>
      </div>

      {/* RT Calculations Section */}
      <div className="card mb-6">
        <h2 className="card__title mb-4">RT (Required Time) Calculations</h2>
        
        {/* Date Selector for RT calculations */}
        <div className="mb-4">
          <label htmlFor="rt-date-selector" className="form__label">
            Calculate RT for Date
          </label>
          <input
            type="date"
            id="rt-date-selector"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form__input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {/* RT Statistics */}
        <div className="grid grid--cols-1 grid--md-cols-2 grid--lg-cols-3 grid--gap-4 mb-6">
          <div className="rt-stat-card border border--gray-700 rounded-lg p-4">
            <p className="text-sm text--gray-400 mb-1">Total RT</p>
            <p className="text-2xl font-bold text--gray-100">{rtStats.totalRT.toFixed(1)}h</p>
            <p className="text-xs text--gray-500 mt-1">{rtStats.taskCount} tasks</p>
          </div>
          <div className="rt-stat-card border border--gray-700 rounded-lg p-4">
            <p className="text-sm text--gray-400 mb-1">Average RT</p>
            <p className="text-2xl font-bold text--gray-100">{rtStats.avgRT.toFixed(1)}h</p>
            <p className="text-xs text--gray-500 mt-1">Per task</p>
          </div>
          <div className="rt-stat-card border border--gray-700 rounded-lg p-4">
            <p className="text-sm text--gray-400 mb-1">RT Range</p>
            <p className="text-lg font-bold text--gray-100">
              {rtStats.minRT.toFixed(1)}h - {rtStats.maxRT.toFixed(1)}h
            </p>
            <p className="text-xs text--gray-500 mt-1">Min to Max</p>
          </div>
        </div>

        {/* Realism Point (RP) */}
        <div className="rp-card border border--primary-700 rounded-lg p-4 bg--primary-900">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm text--gray-400 mb-1">Realism Point (RP)</p>
              <p className="text-3xl font-bold text--gray-100">{rtStats.rp.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text--gray-400 mb-1">Status</p>
              <p className={`text-xl font-bold ${rtStats.rpColor}`}>
                {rtStats.rpStatus}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border--primary-700">
            <div className="grid grid--cols-2 grid--gap-4 text-sm">
              <div>
                <span className="text--gray-400">Available Time: </span>
                <span className="font-semibold text--gray-100">{availableTime}h</span>
              </div>
              <div>
                <span className="text--gray-400">Total RT: </span>
                <span className="font-semibold text--gray-100">{rtStats.totalRT.toFixed(1)}h</span>
              </div>
            </div>
            <p className="text-xs text--gray-400 mt-2">
              RP = Total RT / Available Time. 
              {rtStats.rp < 0.8 && ' ✓ Plan is realistic with good buffer.'}
              {rtStats.rp >= 0.8 && rtStats.rp < 1.0 && ' ⚠️ Tight schedule, requires focus.'}
              {rtStats.rp >= 1.0 && ' ✗ Impossible, immediate action required.'}
            </p>
          </div>
        </div>
      </div>

      {/* Task Links Section */}
      <div className="card">
        <TaskLinkManager />
      </div>
    </div>
  );
}

