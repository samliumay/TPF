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
    // Home/Dashboard routes
    HOME: '/',
    DASHBOARD: '/dashboard',
    
    // Diamond System routes
    DIAMOND_VIEW: '/diamond-system',
    ENTITY_DETAIL: (id) => `/diamond-system/entity/${id}`, // Dynamic route for entity detail pages
    
    // Planning routes
    DAILY_PLAN: '/planning/daily',
    OBSERVATION_INPUT: '/planning/observations',
    
    // Settings route
    SETTINGS: '/settings',
  };