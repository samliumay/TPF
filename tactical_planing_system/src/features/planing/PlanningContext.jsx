/**
 * PlanningContext - Global state management for tasks and planning
 * 
 * Manages all tasks with their properties (RT, IDL, IL) and provides
 * functions for CRUD operations, CWA, and task filtering.
 * 
 * Task Properties:
 * - RT (Required Time): Estimated hours to complete (float)
 * - IDL (Ideal Deadline): Target date/time
 * - IL (Importance Level): Priority score (1-4)
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { IMPORTANCE } from '../../config/constants';

const PlanningContext = createContext(null);

/**
 * PlanningProvider - Context provider for task management
 * 
 * @param {Object} props - React props
 * @param {ReactNode} props.children - Child components that need access to planning context
 * 
 * Provides global state and functions for:
 * - Task CRUD operations
 * - Available time management
 * - CWA (Catastrophic Wipe Out) functionality
 * - Task filtering by date
 */
export function PlanningProvider({ children }) {
  // State: Array of all tasks in the system
  const [tasks, setTasks] = useState([]);
  
  // State: Available free time in hours (default 8 hours)
  // Used for Realism Point (RP) calculation: RP = Total RT / Available Time
  const [availableTime, setAvailableTime] = useState(8);

  /**
   * Add a new task to the system
   * 
   * @param {Object} task - Task object with required properties
   * @param {string} task.title - Task title/description
   * @param {number|string} task.rt - Required Time in hours
   * @param {Date|string} task.idl - Ideal Deadline (date/time)
   * @param {number|string} task.il - Importance Level (1-4)
   * @returns {Object} The newly created task with generated ID
   */
  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now(), // Simple ID generation (will be replaced with backend UUID)
      title: task.title,
      rt: parseFloat(task.rt), // Convert to float for decimal hours (e.g., 1.5 hours)
      idl: new Date(task.idl), // Convert to Date object
      il: parseInt(task.il), // Convert to integer (1-4)
      createdAt: new Date(), // Track when task was created
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  /**
   * Update an existing task
   * 
   * @param {number} taskId - ID of the task to update
   * @param {Object} updates - Partial task object with fields to update
   * @param {string} [updates.title] - New task title
   * @param {number|string} [updates.rt] - New Required Time
   * @param {Date|string} [updates.idl] - New Ideal Deadline
   * @param {number|string} [updates.il] - New Importance Level
   * 
   * Automatically converts RT to float, IDL to Date, and IL to integer
   */
  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              // Ensure proper type conversion for updated fields
              rt: updates.rt !== undefined ? parseFloat(updates.rt) : task.rt,
              idl: updates.idl !== undefined ? new Date(updates.idl) : task.idl,
              il: updates.il !== undefined ? parseInt(updates.il) : task.il,
            }
          : task
      )
    );
  }, []);

  /**
   * Delete a task from the system
   * 
   * @param {number} taskId - ID of the task to delete
   */
  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  /**
   * CWA (Catastrophic Wipe Out) - Emergency task removal
   * 
   * Removes all non-critical tasks (IL > MUST) to create a clean slate.
   * Only keeps tasks with IL = MUST (Level 1 - emergencies, finals, interviews).
   * 
   * This is a fail-safe protocol for when the user is overwhelmed.
   * Forces a Manual Analysis (MA) by wiping everything except critical tasks.
   */
  const catastrophicWipeOut = useCallback(() => {
    setTasks((prev) => prev.filter((task) => task.il === IMPORTANCE.MUST));
  }, []);

  /**
   * Get all tasks scheduled for a specific date
   * 
   * @param {Date|string} date - Target date to filter tasks
   * @returns {Array} Array of tasks with IDL on the specified date
   * 
   * Filters tasks where the Ideal Deadline (IDL) falls on the given date.
   * Uses date comparison (ignoring time) to match tasks for the entire day.
   */
  const getTasksForDate = useCallback((date) => {
    // Normalize target date to start of day (00:00:00)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Calculate next day for range comparison
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter tasks where IDL falls within the target date range
    return tasks.filter((task) => {
      const taskDate = new Date(task.idl);
      return taskDate >= targetDate && taskDate < nextDay;
    });
  }, [tasks]);

  /**
   * Get all tasks scheduled for today
   * 
   * @returns {Array} Array of tasks with IDL set to today's date
   * 
   * Convenience function that calls getTasksForDate with current date.
   */
  const getTodayTasks = useCallback(() => {
    return getTasksForDate(new Date());
  }, [getTasksForDate]);

  // Context value object - all state and functions exposed to consumers
  const value = {
    tasks, // Array of all tasks
    availableTime, // Available free time in hours
    setAvailableTime, // Function to update available time
    addTask, // Function to add new task
    updateTask, // Function to update existing task
    deleteTask, // Function to delete task
    catastrophicWipeOut, // Function to execute CWA
    getTasksForDate, // Function to filter tasks by date
    getTodayTasks, // Function to get today's tasks
  };

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
}

/**
 * usePlanning - Hook to access PlanningContext
 * 
 * @returns {Object} Planning context with tasks, availableTime, and all task management functions
 * @throws {Error} If used outside of PlanningProvider
 * 
 * Usage:
 * const { tasks, addTask, updateTask } = usePlanning();
 */
export function usePlanning() {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
}

