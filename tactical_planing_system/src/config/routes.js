export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    
    // Diamond System ile ilgili yollar
    DIAMOND_VIEW: '/diamond-system',
    ENTITY_DETAIL: (id) => `/diamond-system/entity/${id}`, // Dinamik ID için fonksiyon
    
    // Planning
    DAILY_PLAN: '/planning/daily',
    OBSERVATION_INPUT: '/planning/observations',
    
    // Settings
    SETTINGS: '/settings',
  };