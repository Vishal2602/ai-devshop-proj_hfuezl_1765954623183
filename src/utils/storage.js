/**
 * localStorage wrapper with CRUD operations
 *
 * Provides a defensive, type-safe interface for localStorage operations
 * with built-in error handling, validation, and data integrity checks.
 *
 * Note: While the API is stateless (no file/reading persistence), this
 * storage layer handles client-side preferences and optional reading cache.
 */

// Storage keys - centralized to prevent typos and ensure consistency
export const STORAGE_KEYS = {
  LAST_READING: 'pdf_tarot_last_reading',
  USER_PREFERENCES: 'pdf_tarot_preferences',
  READING_HISTORY: 'pdf_tarot_history',
  UPLOAD_STATS: 'pdf_tarot_upload_stats',
};

// Maximum items in reading history (prevent unbounded growth)
const MAX_HISTORY_ITEMS = 10;

// Maximum storage size per key (5KB - defensive against large payloads)
const MAX_ITEM_SIZE = 5 * 1024;

/**
 * Check if localStorage is available and functional
 * Some browsers disable it in private mode or when storage quota is exceeded
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely get an item from localStorage with JSON parsing
 * Returns null if key doesn't exist or parsing fails
 *
 * @param {string} key - Storage key
 * @returns {any|null} - Parsed value or null
 */
export function getItem(key) {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage not available');
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }

    const parsed = JSON.parse(raw);

    // Validate stored data has expected structure
    if (parsed && typeof parsed === 'object' && parsed._storageVersion) {
      return parsed.data;
    }

    // Legacy data without version wrapper - return as-is
    return parsed;
  } catch (e) {
    console.error(`[Storage] Failed to parse item for key "${key}":`, e);
    // Remove corrupted data
    removeItem(key);
    return null;
  }
}

/**
 * Safely set an item in localStorage with JSON serialization
 * Includes size validation and version metadata
 *
 * @param {string} key - Storage key
 * @param {any} value - Value to store (must be JSON-serializable)
 * @returns {boolean} - Success status
 */
export function setItem(key, value) {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage not available');
    return false;
  }

  try {
    // Wrap with metadata for data integrity
    const wrapped = {
      _storageVersion: 1,
      _timestamp: Date.now(),
      data: value,
    };

    const serialized = JSON.stringify(wrapped);

    // Defensive size check - prevent storing massive payloads
    if (serialized.length > MAX_ITEM_SIZE) {
      console.warn(`[Storage] Item too large for key "${key}" (${serialized.length} bytes)`);
      return false;
    }

    window.localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    // Handle quota exceeded error specifically
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('[Storage] Quota exceeded - clearing old data');
      clearOldReadings();
      // Retry once after cleanup
      try {
        const wrapped = {
          _storageVersion: 1,
          _timestamp: Date.now(),
          data: value,
        };
        window.localStorage.setItem(key, JSON.stringify(wrapped));
        return true;
      } catch (retryError) {
        console.error('[Storage] Failed even after cleanup:', retryError);
        return false;
      }
    }
    console.error(`[Storage] Failed to set item for key "${key}":`, e);
    return false;
  }
}

/**
 * Remove an item from localStorage
 *
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export function removeItem(key) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`[Storage] Failed to remove item for key "${key}":`, e);
    return false;
  }
}

/**
 * Clear all PDF Tarot Reader storage
 * Only removes keys belonging to this app
 *
 * @returns {boolean} - Success status
 */
export function clearAll() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    return true;
  } catch (e) {
    console.error('[Storage] Failed to clear storage:', e);
    return false;
  }
}

// ============================================
// Domain-Specific Operations
// ============================================

/**
 * Reading data structure for type safety
 * @typedef {Object} TarotReading
 * @property {string} id - Unique reading ID
 * @property {string} filename - Original PDF filename
 * @property {string} title - Extracted document title
 * @property {string[]} keywords - Extracted keywords
 * @property {string} aura - Document aura type
 * @property {Array<{position: string, name: string, meaning: string}>} cards - Tarot cards
 * @property {number} timestamp - When reading was created
 */

/**
 * Save the most recent reading for quick access
 * This allows users to return and re-export without re-uploading
 *
 * @param {TarotReading} reading - Reading data to save
 * @returns {boolean} - Success status
 */
export function saveLastReading(reading) {
  if (!reading || typeof reading !== 'object') {
    console.warn('[Storage] Invalid reading data');
    return false;
  }

  // Ensure required fields exist
  const requiredFields = ['title', 'aura', 'cards'];
  for (const field of requiredFields) {
    if (!(field in reading)) {
      console.warn(`[Storage] Reading missing required field: ${field}`);
      return false;
    }
  }

  // Add metadata
  const enrichedReading = {
    ...reading,
    id: reading.id || generateReadingId(),
    timestamp: Date.now(),
  };

  return setItem(STORAGE_KEYS.LAST_READING, enrichedReading);
}

/**
 * Get the last saved reading
 *
 * @returns {TarotReading|null}
 */
export function getLastReading() {
  const reading = getItem(STORAGE_KEYS.LAST_READING);

  // Validate reading structure before returning
  if (reading && reading.cards && Array.isArray(reading.cards)) {
    return reading;
  }

  return null;
}

/**
 * Clear the last reading (e.g., after user starts new upload)
 *
 * @returns {boolean}
 */
export function clearLastReading() {
  return removeItem(STORAGE_KEYS.LAST_READING);
}

/**
 * Add a reading to history (keeps last N readings)
 * History is stored oldest-first, newest-last
 *
 * @param {TarotReading} reading - Reading to add
 * @returns {boolean}
 */
export function addToHistory(reading) {
  if (!reading || typeof reading !== 'object') {
    return false;
  }

  const history = getReadingHistory();

  const historyEntry = {
    id: reading.id || generateReadingId(),
    filename: reading.filename || 'Unknown document',
    title: reading.title,
    aura: reading.aura,
    cardNames: reading.cards?.map((c) => c.name) || [],
    timestamp: Date.now(),
  };

  // Add new entry and trim to max size
  const updated = [...history, historyEntry].slice(-MAX_HISTORY_ITEMS);

  return setItem(STORAGE_KEYS.READING_HISTORY, updated);
}

/**
 * Get reading history
 *
 * @returns {Array} - Array of history entries (newest last)
 */
export function getReadingHistory() {
  const history = getItem(STORAGE_KEYS.READING_HISTORY);
  return Array.isArray(history) ? history : [];
}

/**
 * Clear reading history
 *
 * @returns {boolean}
 */
export function clearHistory() {
  return removeItem(STORAGE_KEYS.READING_HISTORY);
}

/**
 * Clear old readings when storage is full
 * Removes history entries older than 7 days
 */
function clearOldReadings() {
  const history = getReadingHistory();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filtered = history.filter((entry) => entry.timestamp > sevenDaysAgo);
  setItem(STORAGE_KEYS.READING_HISTORY, filtered);
}

// ============================================
// User Preferences
// ============================================

/**
 * User preferences structure
 * @typedef {Object} UserPreferences
 * @property {boolean} showConfetti - Whether to show success confetti
 * @property {boolean} autoExport - Auto-download after reading
 * @property {boolean} soundEnabled - Sound effects
 */

const DEFAULT_PREFERENCES = {
  showConfetti: true,
  autoExport: false,
  soundEnabled: false,
};

/**
 * Get user preferences with defaults
 *
 * @returns {UserPreferences}
 */
export function getPreferences() {
  const stored = getItem(STORAGE_KEYS.USER_PREFERENCES);
  return { ...DEFAULT_PREFERENCES, ...stored };
}

/**
 * Update user preferences (partial update supported)
 *
 * @param {Partial<UserPreferences>} updates - Preference updates
 * @returns {boolean}
 */
export function updatePreferences(updates) {
  if (!updates || typeof updates !== 'object') {
    return false;
  }

  const current = getPreferences();
  const merged = { ...current, ...updates };

  return setItem(STORAGE_KEYS.USER_PREFERENCES, merged);
}

/**
 * Reset preferences to defaults
 *
 * @returns {boolean}
 */
export function resetPreferences() {
  return setItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
}

// ============================================
// Upload Statistics (for fun metrics)
// ============================================

/**
 * Track upload statistics
 *
 * @param {Object} uploadData - Upload metadata
 * @param {number} uploadData.fileSize - File size in bytes
 * @param {number} uploadData.pageCount - Number of pages
 */
export function trackUpload(uploadData) {
  const stats = getUploadStats();

  const updated = {
    totalUploads: stats.totalUploads + 1,
    totalBytes: stats.totalBytes + (uploadData.fileSize || 0),
    totalPages: stats.totalPages + (uploadData.pageCount || 0),
    lastUpload: Date.now(),
  };

  setItem(STORAGE_KEYS.UPLOAD_STATS, updated);
}

/**
 * Get upload statistics
 *
 * @returns {Object} - Upload stats
 */
export function getUploadStats() {
  const stats = getItem(STORAGE_KEYS.UPLOAD_STATS);
  return {
    totalUploads: 0,
    totalBytes: 0,
    totalPages: 0,
    lastUpload: null,
    ...stats,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for readings
 * Uses timestamp + random string for uniqueness
 *
 * @returns {string}
 */
function generateReadingId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `reading_${timestamp}_${random}`;
}

/**
 * Get total storage usage for this app
 * Useful for debugging and monitoring
 *
 * @returns {number} - Total bytes used
 */
export function getStorageUsage() {
  if (!isStorageAvailable()) {
    return 0;
  }

  let total = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value) {
      total += value.length * 2; // UTF-16 encoding = 2 bytes per char
    }
  });

  return total;
}

// Default export for convenience
export default {
  // Core CRUD
  getItem,
  setItem,
  removeItem,
  clearAll,
  isStorageAvailable,

  // Reading operations
  saveLastReading,
  getLastReading,
  clearLastReading,
  addToHistory,
  getReadingHistory,
  clearHistory,

  // Preferences
  getPreferences,
  updatePreferences,
  resetPreferences,

  // Stats
  trackUpload,
  getUploadStats,
  getStorageUsage,

  // Constants
  STORAGE_KEYS,
};
