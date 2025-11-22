/**
 * constants.js - System constants and configuration
 * 
 * Centralized configuration for all system constants.
 * Per PF-D documentation: "Do not hardcode magic numbers."
 * All constants must be imported from this file.
 */

// --- DIAMOND SYSTEM RULES ---
/**
 * ENTITY_LEVELS - Diamond System level definitions
 * 
 * Each level defines the EP (Evaluation Point) range and label.
 * Used to categorize entities (people, institutions) in the user's life.
 * 
 * Level Rules:
 * - Level 1: Almost never drops below 90
 * - Level 2: Can drop to L3 but never rise to L1
 * - Level 3: Standard entry point for good entities
 */
export const ENTITY_LEVELS = {
    LEVEL_1: { id: 1, min: 90, max: 100, label: "Critical" },        // Family, Life-savers
    LEVEL_2: { id: 2, min: 75, max: 90,  label: "Very Important" }, // Close friends, Partner
    LEVEL_3: { id: 3, min: 50, max: 75,  label: "Positive" },      // Good colleagues, acquaintances
    LEVEL_4: { id: 4, min: 20, max: 50,  label: "Neutral" },       // Indifferent, minor conflicts
    LEVEL_5: { id: 5, min: 0,  max: 20,  label: "Hostile" },       // Enemies, irreversible damage
  };
  
  // --- IMPORTANCE LEVELS (IL) ---
  /**
   * IMPORTANCE - Task Importance Level definitions
   * 
   * Used for task prioritization. Tasks are sorted by IL ASC, then IDL ASC.
   * 
   * Levels:
   * - MUST (1): Emergencies, Finals, Interviews - Non-negotiable
   * - HIGH (2): Long-term goals, sub-tasks of big projects
   * - MEDIUM (3): Side missions, hobbies, books
   * - OPTIONAL (4): Optional, mood-dependent tasks
   */
  export const IMPORTANCE = {
    MUST: 1,      // Level 1 - Emergencies, Finals, Interviews
    HIGH: 2,      // Level 2 - Long-term goals, Projects
    MEDIUM: 3,    // Level 3 - Side missions, Hobbies
    OPTIONAL: 4,  // Level 4 - Optional, mood-dependent
  };
  
  // --- REALISM POINT (RP) THRESHOLDS ---
  /**
   * RP_LIMITS - Realism Point threshold values
   * 
   * Used to determine if a daily plan is feasible.
   * RP = Total Required Time (RT) / Available Free Time
   * 
   * Zones:
   * - Safe: RP < 0.8 (Green) - Plan is realistic with good buffer
   * - Risky: 0.8 ≤ RP < 1.0 (Yellow) - Tight schedule, requires focus
   * - Overload: RP ≥ 1.0 (Red) - Impossible, immediate action required
   */
  export const RP_LIMITS = {
    SAFE: 0.8,    // < 0.8 (Green) - Safe zone
    RISKY: 1.0,   // 0.8 - 1.0 (Yellow) - Risky zone
    OVERLOAD: 1.0 // ≥ 1.0 (Red) - Overload zone
  };
  
  // --- SYSTEM SETTINGS ---
  /**
   * OBSERVATION_BUFFER_DAYS - Buffer period for observations
   * 
   * Number of days an observation must wait before it can be analyzed.
   * This implements the impulse control mechanism for ADHD optimization.
   * 
   * Workflow:
   * 1. OB Catch: User logs observation
   * 2. Buffer Period: System holds for OBSERVATION_BUFFER_DAYS (2 days)
   * 3. Analysis: After buffer, user reviews and decides value
   */
  export const OBSERVATION_BUFFER_DAYS = 2; // 2-day buffer rule