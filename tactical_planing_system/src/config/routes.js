/**
 * ROUTES - Centralized route configuration
 * 
 * All route paths MUST be defined here (per PF-D documentation).
 * Never use hardcoded route strings in components.
 * 
 * Usage:
 * import { ROUTES } from '../config/routes';
 * <Link to={ROUTES.DAILY_PLAN}>Daily Plan</Link>
 * 
 * This ensures single source of truth for all routes and makes
 * refactoring easier.
 */

export const ROUTES = {
    // Auth routes
    LOGIN: '/login',
    
    // Home/Dashboard routes
    HOME: '/',
    DASHBOARD: '/dashboard',
    
    // Planning routes
    PLANNING: {
      ALL_TASKS: '/planning/all-tasks',
      DAILY_TASKS: '/planning/daily-tasks',
      ADD_TASK: '/planning/add-task',
      TASK_TREE: '/planning/task-tree',
      TASK_CONFIGURATION: '/planning/task-configuration',
    },
    
    // Observations routes
    OBSERVATIONS: {
      CURRENT: '/observations/current',
      WAITING_FOR_ANALYSIS: '/observations/waiting',
      ALL: '/observations/all',
      ANALYSIS: '/observations/analysis',
    },
    
    // Diamond System routes
    DIAMOND: {
      DIAGRAM: '/diamond/diagram',
      ADD_ENTITY: '/diamond/add-entity',
      ALL_ENTITIES: '/diamond/all-entities',
    },
    ENTITY_DETAIL: (id) => `/diamond/entity/${id}`, // Dynamic route for entity detail pages
    
    // Settings routes
    SETTINGS: {
      COLOR: '/settings/color',
      EMERGENCY: '/settings/emergency',
    },
    
    // Legacy routes (for backward compatibility)
    DAILY_PLAN: '/planning/daily-tasks',
    OBSERVATION_INPUT: '/observations/current',
    DIAMOND_VIEW: '/diamond/diagram',
  };