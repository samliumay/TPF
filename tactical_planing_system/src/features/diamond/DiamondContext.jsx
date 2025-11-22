/**
 * DiamondContext - Global state management for entity evaluation
 * 
 * The Diamond System evaluates entities (people, institutions) in the user's life.
 * Each entity has an EP (Evaluation Point) score (0-100) that determines its Level.
 * 
 * Level Hierarchy:
 * - Level 1 (90-100): Critical (Family, Life-savers) - Almost never drops below 90
 * - Level 2 (75-90): Very Important (Close friends, Partner) - Can drop to L3, never rise to L1
 * - Level 3 (50-75): Positive (Good colleagues, acquaintances) - Standard entry point
 * - Level 4 (20-50): Neutral/Negative (Indifferent, minor conflicts)
 * - Level 5 (<20): Hostile (Enemies, irreversible damage) - Blacklisted
 * 
 * Level Transition Rules:
 * - Level 2 entities can drop to Level 3 but CANNOT rise to Level 1
 * - Level 1 entities should rarely drop below 90
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ENTITY_LEVELS } from '../../config/constants';
import exampleEntities from '../../examples/exampleEntities.json';

const DiamondContext = createContext(null);

/**
 * Calculate entity level based on EP (Evaluation Point) score
 * 
 * @param {number} ep - Evaluation Point score (0-100)
 * @returns {number} Level ID (1-5) based on EP range
 * 
 * Determines which level an entity belongs to based on its EP score.
 * Uses the EP ranges defined in ENTITY_LEVELS constants.
 */
const calculateLevel = (ep) => {
  // Level 1: Critical entities (90-100)
  if (ep >= ENTITY_LEVELS.LEVEL_1.min && ep <= ENTITY_LEVELS.LEVEL_1.max) {
    return ENTITY_LEVELS.LEVEL_1.id;
  }
  // Level 2: Very Important (75-90)
  else if (ep >= ENTITY_LEVELS.LEVEL_2.min && ep < ENTITY_LEVELS.LEVEL_2.max) {
    return ENTITY_LEVELS.LEVEL_2.id;
  }
  // Level 3: Positive (50-75) - Standard entry point
  else if (ep >= ENTITY_LEVELS.LEVEL_3.min && ep < ENTITY_LEVELS.LEVEL_3.max) {
    return ENTITY_LEVELS.LEVEL_3.id;
  }
  // Level 4: Neutral/Negative (20-50)
  else if (ep >= ENTITY_LEVELS.LEVEL_4.min && ep < ENTITY_LEVELS.LEVEL_4.max) {
    return ENTITY_LEVELS.LEVEL_4.id;
  }
  // Level 5: Hostile (<20)
  else {
    return ENTITY_LEVELS.LEVEL_5.id;
  }
};

/**
 * Get level information object by level ID
 * 
 * @param {number} levelId - Level ID (1-5)
 * @returns {Object} Level info object with id, min, max, label
 * 
 * Returns the level configuration object for a given level ID.
 * Falls back to Level 5 if levelId is invalid.
 */
const getLevelInfo = (levelId) => {
  const levels = [
    ENTITY_LEVELS.LEVEL_1,
    ENTITY_LEVELS.LEVEL_2,
    ENTITY_LEVELS.LEVEL_3,
    ENTITY_LEVELS.LEVEL_4,
    ENTITY_LEVELS.LEVEL_5,
  ];
  return levels.find((l) => l.id === levelId) || ENTITY_LEVELS.LEVEL_5;
};

/**
 * DiamondProvider - Context provider for entity management
 * 
 * @param {Object} props - React props
 * @param {ReactNode} props.children - Child components
 * 
 * Manages all entities with EP scoring and enforces level transition rules.
 */
export function DiamondProvider({ children }) {
  // State: Array of all entities (people, institutions)
  const [entities, setEntities] = useState([]);

  // Track if example data has been initialized
  const initializedRef = useRef(false);

  // Initialize with example data (for development/testing)
  useEffect(() => {
    // Only initialize once on mount
    if (!initializedRef.current) {
      // Convert example entities from JSON format to proper format
      const formattedEntities = exampleEntities.map(entity => ({
        ...entity,
        createdAt: new Date(entity.createdAt), // Convert ISO string to Date object
        updatedAt: new Date(entity.updatedAt), // Convert ISO string to Date object
        ep: parseFloat(entity.ep), // Ensure EP is a number
        level: parseInt(entity.level), // Ensure level is an integer
        notes: entity.notes || '',
      }));
      setEntities(formattedEntities);
      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  /**
   * Add a new entity to the Diamond System
   * 
   * @param {Object} entity - Entity data
   * @param {string} entity.name - Entity name
   * @param {string} [entity.type='person'] - Entity type ('person' or 'institution')
   * @param {number|string} [entity.ep=50] - Evaluation Point (0-100), defaults to 50 (Level 3)
   * @param {string} [entity.notes=''] - Optional notes about the entity
   * @returns {Object} The newly created entity with calculated level
   * 
   * Automatically calculates the entity's level based on EP.
   * Default EP is 50 (Level 3 - standard entry point for good entities).
   */
  const addEntity = useCallback((entity) => {
    const ep = parseFloat(entity.ep) || 50; // Default to 50 (Level 3 entry point)
    const level = calculateLevel(ep); // Calculate level from EP

    const newEntity = {
      id: Date.now(), // Simple ID generation (will be replaced with backend)
      name: entity.name.trim(), // Remove whitespace
      type: entity.type || 'person', // Default to 'person' if not specified
      ep: ep, // Evaluation Point score
      level: level, // Calculated level (1-5)
      notes: entity.notes || '', // Optional notes
      createdAt: new Date(), // Track creation time
      updatedAt: new Date(), // Track last update time
    };

    setEntities((prev) => [...prev, newEntity]);
    return newEntity;
  }, []);

  /**
   * Update entity EP and recalculate level with rule enforcement
   * 
   * @param {number} entityId - ID of entity to update
   * @param {number|string} newEP - New Evaluation Point score (0-100)
   * @param {number} currentLevel - Current level of the entity (for rule checking)
   * @throws {Error} If EP is invalid or violates level transition rules
   * 
   * Updates the entity's EP and recalculates its level.
   * Enforces level transition rules:
   * - Level 2 cannot rise to Level 1 (max EP is 89)
   * - Level 1 should rarely drop below 90 (warns if dropping below 85)
   * 
   * Throws an error if the update would violate these rules.
   */
  const updateEntityEP = useCallback((entityId, newEP, currentLevel) => {
    const ep = parseFloat(newEP);
    
    // Validate EP range
    if (isNaN(ep) || ep < 0 || ep > 100) {
      throw new Error('EP must be between 0 and 100');
    }

    // Calculate what the new level would be
    let calculatedLevel = calculateLevel(ep);
    const currentLevelInfo = getLevelInfo(currentLevel);

    // Enforce level transition rules
    // Rule: Level 2 can drop to L3 but never rise to L1
    if (currentLevel === ENTITY_LEVELS.LEVEL_2.id && calculatedLevel === ENTITY_LEVELS.LEVEL_1.id) {
      // Prevent Level 2 from rising to Level 1
      calculatedLevel = ENTITY_LEVELS.LEVEL_2.id; // Keep at Level 2
      if (ep > ENTITY_LEVELS.LEVEL_2.max) {
        throw new Error('Level 2 entities cannot rise to Level 1. Maximum EP is 89.');
      }
    }

    // Rule: Level 1 almost never drops below 90
    if (currentLevel === ENTITY_LEVELS.LEVEL_1.id && ep < ENTITY_LEVELS.LEVEL_1.min) {
      // Warn if dropping significantly below 90
      if (ep < 85) {
        throw new Error('Level 1 entities should rarely drop below 90. Are you sure?');
      }
    }

    // Update entity with new EP and calculated level
    setEntities((prev) =>
      prev.map((entity) =>
        entity.id === entityId
          ? {
              ...entity,
              ep: ep, // New EP score
              level: calculatedLevel, // Recalculated level
              updatedAt: new Date(), // Update timestamp
            }
          : entity
      )
    );
  }, []);

  /**
   * Update entity details (name, notes, type) without changing EP
   * 
   * @param {number} entityId - ID of entity to update
   * @param {Object} updates - Partial entity object with fields to update
   * @param {string} [updates.name] - New entity name
   * @param {string} [updates.type] - New entity type
   * @param {string} [updates.notes] - New notes
   * 
   * Updates entity metadata without recalculating level.
   * Use updateEntityEP() if you need to change the EP score.
   */
  const updateEntity = useCallback((entityId, updates) => {
    setEntities((prev) =>
      prev.map((entity) =>
        entity.id === entityId
          ? {
              ...entity,
              ...updates, // Merge updates
              updatedAt: new Date(), // Update timestamp
            }
          : entity
      )
    );
  }, []);

  /**
   * Delete an entity from the system
   * 
   * @param {number} entityId - ID of entity to delete
   * 
   * Permanently removes the entity from the array.
   */
  const deleteEntity = useCallback((entityId) => {
    setEntities((prev) => prev.filter((entity) => entity.id !== entityId));
  }, []);

  /**
   * Get all entities in a specific level
   * 
   * @param {number} levelId - Level ID (1-5)
   * @returns {Array} Array of entities in the specified level
   */
  const getEntitiesByLevel = useCallback(
    (levelId) => {
      return entities.filter((entity) => entity.level === levelId);
    },
    [entities]
  );

  /**
   * Get all entities grouped by level
   * 
   * @returns {Object} Object with level IDs as keys and arrays of entities as values
   * 
   * Returns an object like:
   * {
   *   1: [entity1, entity2],
   *   2: [entity3],
   *   ...
   * }
   * 
   * Useful for displaying entities organized by level.
   */
  const entitiesByLevel = useMemo(() => {
    const grouped = {};
    // Initialize groups for all 5 levels
    [1, 2, 3, 4, 5].forEach((levelId) => {
      grouped[levelId] = entities.filter((e) => e.level === levelId);
    });
    return grouped;
  }, [entities]);

  /**
   * Calculate entity statistics
   * 
   * @returns {Object} Statistics object with:
   * - total: Total number of entities
   * - byLevel: Object with count of entities per level
   * - averageEP: Average Evaluation Point across all entities
   * 
   * Provides overview statistics for the Diamond System.
   */
  const getStatistics = useMemo(() => {
    const stats = {
      total: entities.length, // Total entity count
      byLevel: {}, // Count per level
      averageEP: 0, // Average EP score
    };

    // Count entities in each level
    [1, 2, 3, 4, 5].forEach((levelId) => {
      const levelEntities = entities.filter((e) => e.level === levelId);
      stats.byLevel[levelId] = levelEntities.length;
    });

    // Calculate average EP if there are entities
    if (entities.length > 0) {
      const totalEP = entities.reduce((sum, e) => sum + e.ep, 0);
      stats.averageEP = totalEP / entities.length;
    }

    return stats;
  }, [entities]);

  const value = {
    entities,
    addEntity,
    updateEntityEP,
    updateEntity,
    deleteEntity,
    getEntitiesByLevel,
    entitiesByLevel,
    getStatistics,
    calculateLevel,
    getLevelInfo,
  };

  return (
    <DiamondContext.Provider value={value}>
      {children}
    </DiamondContext.Provider>
  );
}

/**
 * useDiamond - Hook to access DiamondContext
 * 
 * @returns {Object} Diamond context with entities, statistics, and management functions
 * @throws {Error} If used outside of DiamondProvider
 * 
 * Usage:
 * const { entities, addEntity, updateEntityEP, getStatistics } = useDiamond();
 */
export function useDiamond() {
  const context = useContext(DiamondContext);
  if (!context) {
    throw new Error('useDiamond must be used within a DiamondProvider');
  }
  return context;
}

