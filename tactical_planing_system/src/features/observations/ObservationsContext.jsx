/**
 * ObservationsContext - Global state management for observations
 * 
 * Implements the 2-day buffer system for impulse control (ADHD optimization).
 * 
 * Workflow:
 * 1. OB Catch: User logs an observation
 * 2. Buffer Period: System holds observation for 2 days
 * 3. Analysis: After 2 days, user reviews and decides:
 *    - Valuable? -> Add Tags, LI (Lesson Identified), EP (Evaluation Point), or convert to Task
 *    - Not Valuable? -> Delete (DEL)
 * 
 * Status Flow:
 * 'buffer' -> 'ready_for_analysis' -> 'analyzed' or 'deleted'
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { OBSERVATION_BUFFER_DAYS } from '../../config/constants';
import exampleObservations from '../../examples/exampleObservations.json';

const ObservationsContext = createContext(null);

/**
 * ObservationsProvider - Context provider for observation management
 * 
 * @param {Object} props - React props
 * @param {ReactNode} props.children - Child components
 * 
 * Manages the complete observation lifecycle with 2-day buffer enforcement.
 */
export function ObservationsProvider({ children }) {
  // State: Array of all observations
  const [observations, setObservations] = useState([]);

  // Track if example data has been initialized
  const initializedRef = useRef(false);

  // Initialize with example data (for development/testing)
  useEffect(() => {
    // Only initialize once on mount
    if (!initializedRef.current) {
      // Convert example observations from JSON format to proper format
      const formattedObservations = exampleObservations.map(obs => ({
        ...obs,
        createdAt: new Date(obs.createdAt), // Convert ISO string to Date object
        tags: obs.tags || [],
        lessonIdentified: obs.lessonIdentified || null,
        ep: obs.ep !== null && obs.ep !== undefined ? parseFloat(obs.ep) : null,
        convertedToTask: obs.convertedToTask || false,
        taskId: obs.taskId || null,
      }));
      setObservations(formattedObservations);
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  /**
   * Add a new observation (OB Catch)
   * 
   * Creates a new observation and sets it to 'buffer' status.
   * The observation will be held for 2 days before it can be analyzed.
   * 
   * @param {Object} observation - Observation data
   * @param {string} observation.content - The observation text/idea/event
   * @returns {Object} The newly created observation with generated ID
   */
  const addObservation = useCallback((observation) => {
    const newObservation = {
      id: Date.now(), // Simple ID generation (will be replaced with backend)
      content: observation.content.trim(), // Remove leading/trailing whitespace
      createdAt: new Date(), // Track when observation was caught
      status: 'buffer', // Initial status: waiting for buffer period
      tags: [], // Will be populated during analysis
      lessonIdentified: null, // LI (Lesson Identified) - optional
      ep: null, // EP (Evaluation Point) for Diamond System - optional
      convertedToTask: false, // Track if observation was converted to a task
      taskId: null, // ID of task if converted
    };
    setObservations((prev) => [...prev, newObservation]);
    return newObservation;
  }, []);

  /**
   * Check if observation has completed its 2-day buffer period
   * 
   * @param {Object} observation - Observation to check
   * @param {Date|string} observation.createdAt - When observation was created
   * @returns {boolean} True if 2+ days have passed since creation
   * 
   * Calculates the difference between now and creation date.
   * Returns true if the difference is >= OBSERVATION_BUFFER_DAYS (2 days).
   */
  const isReadyForAnalysis = useCallback((observation) => {
    const now = new Date();
    const createdAt = new Date(observation.createdAt);
    // Calculate difference in days: (milliseconds) / (ms per day)
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
    return daysDiff >= OBSERVATION_BUFFER_DAYS;
  }, []);

  /**
   * Get all observations with a specific status
   * 
   * @param {string} status - Status to filter by ('buffer', 'analyzed', 'deleted')
   * @returns {Array} Array of observations with the specified status
   */
  const getObservationsByStatus = useCallback(
    (status) => {
      return observations.filter((obs) => obs.status === status);
    },
    [observations]
  );

  /**
   * Get observations that are ready for analysis
   * 
   * Returns observations that:
   * - Have status 'buffer'
   * - Have completed their 2-day buffer period
   * 
   * @returns {Array} Array of observations ready for user analysis
   */
  const getReadyForAnalysis = useCallback(() => {
    return observations.filter(
      (obs) => obs.status === 'buffer' && isReadyForAnalysis(obs)
    );
  }, [observations, isReadyForAnalysis]);

  /**
   * Get observations still in buffer period
   * 
   * Returns observations that:
   * - Have status 'buffer'
   * - Have NOT completed their 2-day buffer period yet
   * 
   * @returns {Array} Array of observations still waiting in buffer
   */
  const getInBuffer = useCallback(() => {
    return observations.filter(
      (obs) => obs.status === 'buffer' && !isReadyForAnalysis(obs)
    );
  }, [observations, isReadyForAnalysis]);

  /**
   * Calculate how many days remain in the buffer period
   * 
   * @param {Object} observation - Observation to check
   * @param {Date|string} observation.createdAt - When observation was created
   * @returns {number} Number of days remaining (0 if buffer period complete)
   * 
   * Returns the remaining days until the observation can be analyzed.
   * Returns 0 if the buffer period has already completed.
   */
  const getDaysRemaining = useCallback((observation) => {
    const now = new Date();
    const createdAt = new Date(observation.createdAt);
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
    const remaining = OBSERVATION_BUFFER_DAYS - daysDiff;
    // Ensure non-negative and round up to nearest day
    return Math.max(0, Math.ceil(remaining));
  }, []);

  /**
   * Analyze an observation - mark as analyzed and save analysis data
   * 
   * After the 2-day buffer, user can analyze the observation and add:
   * - Tags: Categorization labels
   * - LI (Lesson Identified): What was learned from this observation
   * - EP (Evaluation Point): Score for Diamond System (0-100)
   * 
   * @param {number} observationId - ID of observation to analyze
   * @param {Object} analysis - Analysis data
   * @param {Array<string>} [analysis.tags] - Array of tag strings
   * @param {string} [analysis.lessonIdentified] - Lesson learned text
   * @param {number} [analysis.ep] - Evaluation Point (0-100)
   * 
   * Changes status from 'buffer' to 'analyzed'.
   */
  const analyzeObservation = useCallback((observationId, analysis) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === observationId
          ? {
              ...obs,
              status: 'analyzed', // Mark as analyzed
              tags: analysis.tags || obs.tags, // Update tags if provided
              lessonIdentified: analysis.lessonIdentified || obs.lessonIdentified, // Update LI if provided
              ep: analysis.ep !== undefined ? analysis.ep : obs.ep, // Update EP if provided
            }
          : obs
      )
    );
  }, []);

  /**
   * Convert an observation to a task
   * 
   * When an observation is valuable and actionable, it can be converted
   * to a task in the planning system. This links the observation to the task.
   * 
   * @param {number} observationId - ID of observation to convert
   * @param {number} taskId - ID of the task created from this observation
   * 
   * Marks the observation as analyzed and sets convertedToTask flag.
   */
  const convertToTask = useCallback((observationId, taskId) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === observationId
          ? {
              ...obs,
              status: 'analyzed', // Mark as analyzed
              convertedToTask: true, // Flag that it was converted
              taskId: taskId, // Link to the created task
            }
          : obs
      )
    );
  }, []);

  /**
   * Delete an observation (DEL)
   * 
   * Soft delete - marks observation as 'deleted' status.
   * The observation is not removed from the array, just marked.
   * Use permanentlyDelete() to actually remove it.
   * 
   * @param {number} observationId - ID of observation to delete
   * 
   * This is the "DEL" action from the workflow when observation is not valuable.
   */
  const deleteObservation = useCallback((observationId) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === observationId ? { ...obs, status: 'deleted' } : obs
      )
    );
  }, []);

  /**
   * Permanently remove a deleted observation from the system
   * 
   * @param {number} observationId - ID of observation to permanently delete
   * 
   * Actually removes the observation from the array (hard delete).
   * Use this to clean up observations marked as 'deleted'.
   */
  const permanentlyDelete = useCallback((observationId) => {
    setObservations((prev) => prev.filter((obs) => obs.id !== observationId));
  }, []);

  const value = {
    observations,
    addObservation,
    isReadyForAnalysis,
    getObservationsByStatus,
    getReadyForAnalysis,
    getInBuffer,
    getDaysRemaining,
    analyzeObservation,
    convertToTask,
    deleteObservation,
    permanentlyDelete,
  };

  return (
    <ObservationsContext.Provider value={value}>
      {children}
    </ObservationsContext.Provider>
  );
}

/**
 * useObservations - Hook to access ObservationsContext
 * 
 * @returns {Object} Observations context with all observations and management functions
 * @throws {Error} If used outside of ObservationsProvider
 * 
 * Usage:
 * const { observations, addObservation, getReadyForAnalysis } = useObservations();
 */
export function useObservations() {
  const context = useContext(ObservationsContext);
  if (!context) {
    throw new Error('useObservations must be used within an ObservationsProvider');
  }
  return context;
}

