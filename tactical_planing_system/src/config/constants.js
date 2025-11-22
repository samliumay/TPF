// src/config/constants.js

// --- DIAMOND SYSTEM RULES ---
export const ENTITY_LEVELS = {
    LEVEL_1: { id: 1, min: 90, max: 100, label: "Critical" },
    LEVEL_2: { id: 2, min: 75, max: 90,  label: "Very Important" },
    LEVEL_3: { id: 3, min: 50, max: 75,  label: "Positive" },
    LEVEL_4: { id: 4, min: 20, max: 50,  label: "Neutral" },
    LEVEL_5: { id: 5, min: 0,  max: 20,  label: "Hostile" },
  };
  
  // --- IMPORTANCE LEVELS (IL) ---
  export const IMPORTANCE = {
    MUST: 1,      // Level 1
    HIGH: 2,      // Level 2
    MEDIUM: 3,    // Level 3
    OPTIONAL: 4,  // Level 4
  };
  
  // --- REALISM POINT (RP) THRESHOLDS ---
  export const RP_LIMITS = {
    SAFE: 0.8,    // < 0.8 (Yeşil)
    RISKY: 1.0,   // 0.8 - 1.0 (Sarı)
    OVERLOAD: 1.0 // > 1.0 (Kırmızı)
  };
  
  // --- SYSTEM SETTINGS ---
  export const OBSERVATION_BUFFER_DAYS = 2; // 2 Gün bekleme kuralı