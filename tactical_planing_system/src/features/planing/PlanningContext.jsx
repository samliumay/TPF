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

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { IMPORTANCE } from '../../config/constants';
import exampleTasks from '../../examples/exampleTasks.json';

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

  // Track if example data has been initialized
  const initializedRef = useRef(false);

  // Initialize with example data (for development/testing)
  useEffect(() => {
    // Only initialize once on mount
    if (!initializedRef.current) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Convert example tasks from JSON format to proper format
      // Adjust dates to be relative to today so tasks appear in the dashboard
      const formattedTasks = exampleTasks.map((task, index) => {
        // Parse the original date from JSON
        const originalDate = new Date(task.idl);
        const originalCreatedAt = new Date(task.createdAt);
        
        // Calculate days offset from the original date (Dec 18, 2024)
        // We'll distribute tasks across today, tomorrow, and a few days ahead
        const baseDate = new Date('2024-12-18T00:00:00.000Z');
        const daysOffset = Math.floor((originalDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Create new dates relative to today
        const newIdl = new Date(today);
        newIdl.setDate(today.getDate() + daysOffset);
        newIdl.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
        
        const newCreatedAt = new Date(today);
        newCreatedAt.setDate(today.getDate() - 7 + (index % 7)); // Created dates spread over past week
        
        return {
          ...task,
          idl: newIdl, // Date relative to today
          createdAt: newCreatedAt, // Created date in past week
          rt: parseFloat(task.rt), // Ensure RT is a float
          il: parseInt(task.il), // Ensure IL is an integer
          parentTaskId: task.parentTaskId || null,
          subtasks: task.subtasks || [],
          linksTo: task.linksTo || [],
          linkedFrom: task.linkedFrom || [],
          completed: task.completed || false, // Task completion status
          completedAt: task.completedAt ? new Date(task.completedAt) : null, // Completion date
        };
      });
      setTasks(formattedTasks);
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  /**
   * Add a new task to the system
   * 
   * @param {Object} task - Task object with required properties
   * @param {string} task.title - Task title/description
   * @param {number|string} task.rt - Required Time in hours
   * @param {Date|string} task.idl - Ideal Deadline (date/time)
   * @param {number|string} task.il - Importance Level (1-4)
   * @param {number} [task.parentTaskId] - ID of parent task (for subtasks)
   * @returns {Object} The newly created task with generated ID
   */
  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now() + Math.random(), // Simple ID generation (will be replaced with backend UUID)
      title: task.title,
      rt: parseFloat(task.rt), // Convert to float for decimal hours (e.g., 1.5 hours)
      idl: new Date(task.idl), // Convert to Date object
      il: parseInt(task.il), // Convert to integer (1-4)
      createdAt: new Date(), // Track when task was created
      parentTaskId: task.parentTaskId || null, // Parent task ID for subtasks
      subtasks: [], // Array of subtask IDs
      linksTo: [], // Array of task IDs this task links to (directional)
      linkedFrom: [], // Array of task IDs that link to this task
      completed: false, // Task completion status
      completedAt: null, // Date when task was completed
    };
    setTasks((prev) => {
      const updated = [...prev, newTask];
      // If this is a subtask, add it to parent's subtasks array
      if (task.parentTaskId) {
        return updated.map((t) =>
          t.id === task.parentTaskId
            ? { ...t, subtasks: [...(t.subtasks || []), newTask.id] }
            : t
        );
      }
      return updated;
    });
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
   * Toggle task completion status
   * 
   * @param {number} taskId - ID of the task to toggle
   * 
   * When marking a task as completed, also marks all subtasks as completed.
   * When unmarking, does not affect subtasks (user can unmark individually).
   */
  const toggleTaskCompletion = useCallback((taskId) => {
    setTasks((prev) => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      const newCompleted = !task.completed;
      const completionDate = newCompleted ? new Date() : null;

      // Helper to recursively get all descendant task IDs
      const getDescendantIds = (parentId, allTasks) => {
        const descendants = [];
        const directChildren = allTasks.filter(t => t.parentTaskId === parentId);
        directChildren.forEach(child => {
          descendants.push(child.id);
          descendants.push(...getDescendantIds(child.id, allTasks));
        });
        return descendants;
      };

      return prev.map((t) => {
        // Update the clicked task
        if (t.id === taskId) {
          return {
            ...t,
            completed: newCompleted,
            completedAt: completionDate,
          };
        }
        
        // If marking as completed, also mark all subtasks
        if (newCompleted) {
          const descendantIds = getDescendantIds(taskId, prev);
          if (descendantIds.includes(t.id)) {
            return {
              ...t,
              completed: true,
              completedAt: completionDate,
            };
          }
        }
        
        return t;
      });
    });
  }, []);

  /**
   * Delete a task from the system
   * Also removes it from parent's subtasks and cleans up all links
   * 
   * @param {number} taskId - ID of the task to delete
   */
  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => {
      const taskToDelete = prev.find((t) => t.id === taskId);
      if (!taskToDelete) return prev;

      // Remove from parent's subtasks
      let updated = prev.map((task) => {
        if (task.id === taskToDelete.parentTaskId) {
          return {
            ...task,
            subtasks: (task.subtasks || []).filter((id) => id !== taskId),
          };
        }
        // Remove links to/from this task
        return {
          ...task,
          linksTo: (task.linksTo || []).filter((id) => id !== taskId),
          linkedFrom: (task.linkedFrom || []).filter((id) => id !== taskId),
        };
      });

      // Delete all subtasks recursively
      const deleteSubtasks = (parentId) => {
        const subtasks = updated.filter((t) => t.parentTaskId === parentId);
        subtasks.forEach((subtask) => {
          updated = updated.filter((t) => t.id !== subtask.id);
          deleteSubtasks(subtask.id);
        });
      };
      deleteSubtasks(taskId);

      // Remove the task itself
      return updated.filter((task) => task.id !== taskId);
    });
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

  /**
   * Link a task to another task (directional relationship)
   * 
   * @param {number} fromTaskId - ID of the task that links
   * @param {number} toTaskId - ID of the task being linked to
   */
  const linkTask = useCallback((fromTaskId, toTaskId) => {
    if (fromTaskId === toTaskId) return; // Prevent self-linking
    
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === fromTaskId) {
          // Add to linksTo if not already present
          const linksTo = task.linksTo || [];
          if (!linksTo.includes(toTaskId)) {
            return { ...task, linksTo: [...linksTo, toTaskId] };
          }
        }
        if (task.id === toTaskId) {
          // Add to linkedFrom if not already present
          const linkedFrom = task.linkedFrom || [];
          if (!linkedFrom.includes(fromTaskId)) {
            return { ...task, linkedFrom: [...linkedFrom, fromTaskId] };
          }
        }
        return task;
      })
    );
  }, []);

  /**
   * Unlink a task from another task
   * 
   * @param {number} fromTaskId - ID of the task that links
   * @param {number} toTaskId - ID of the task being unlinked from
   */
  const unlinkTask = useCallback((fromTaskId, toTaskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === fromTaskId) {
          return {
            ...task,
            linksTo: (task.linksTo || []).filter((id) => id !== toTaskId),
          };
        }
        if (task.id === toTaskId) {
          return {
            ...task,
            linkedFrom: (task.linkedFrom || []).filter((id) => id !== fromTaskId),
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Get a task by ID
   * 
   * @param {number} taskId - ID of the task
   * @returns {Object|null} The task object or null if not found
   */
  const getTaskById = useCallback(
    (taskId) => {
      return tasks.find((task) => task.id === taskId) || null;
    },
    [tasks]
  );

  /**
   * Get all root tasks (tasks without a parent)
   * 
   * @returns {Array} Array of root tasks
   */
  const getRootTasks = useCallback(() => {
    return tasks.filter((task) => !task.parentTaskId);
  }, [tasks]);

  /**
   * Get all subtasks of a task
   * 
   * @param {number} taskId - ID of the parent task
   * @returns {Array} Array of subtask objects
   */
  const getSubtasks = useCallback(
    (taskId) => {
      return tasks.filter((task) => task.parentTaskId === taskId);
    },
    [tasks]
  );

  /**
   * Build task tree structure for visualization
   * 
   * @returns {Array} Array of root tasks with nested subtasks
   */
  const getTaskTree = useCallback(() => {
    const rootTasks = getRootTasks();
    
    const buildTree = (task) => {
      const subtasks = getSubtasks(task.id);
      return {
        ...task,
        children: subtasks.map(buildTree),
      };
    };

    return rootTasks.map(buildTree);
  }, [getRootTasks, getSubtasks]);

  // Context value object - all state and functions exposed to consumers
  const value = {
    tasks, // Array of all tasks
    availableTime, // Available free time in hours
    setAvailableTime, // Function to update available time
    addTask, // Function to add new task
    updateTask, // Function to update existing task
    deleteTask, // Function to delete task
    toggleTaskCompletion, // Function to toggle task completion
    catastrophicWipeOut, // Function to execute CWA
    getTasksForDate, // Function to filter tasks by date
    getTodayTasks, // Function to get today's tasks
    linkTask, // Function to link tasks
    unlinkTask, // Function to unlink tasks
    getTaskById, // Function to get task by ID
    getRootTasks, // Function to get root tasks
    getSubtasks, // Function to get subtasks
    getTaskTree, // Function to get task tree structure
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

