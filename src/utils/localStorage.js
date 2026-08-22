/**
 * localStorage utility — safe read/write with JSON serialization.
 * Wraps access in try/catch for environments where localStorage is unavailable.
 */

export function getStoredData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function removeStoredData(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
}
