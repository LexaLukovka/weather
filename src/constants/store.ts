export const STORE_CONFIG = {
  // History limits
  MAX_HISTORY_SIZE: 10,
  MAX_RECENTLY_REMOVED: 5,

  // Time limits
  CLEANUP_TIME: 24 * 60 * 60 * 1000, // 24 hours
  UNDO_TIMEOUT: 5 * 1000, // 5 seconds
} as const;

export const STORAGE_KEYS = {
  WEATHER_STATE: 'weather_app_state',
} as const;
