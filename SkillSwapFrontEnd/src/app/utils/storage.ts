/**
 * Safe localStorage wrapper with error handling
 */

/**
 * Safely sets an item in localStorage
 * @param key - The key to store the value under
 * @param value - The value to store (will be JSON.stringified)
 * @returns true if successful, false if failed
 */
export function safeSetItem(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage for key "${key}":`, error);
    return false;
  }
}

/**
 * Safely gets an item from localStorage
 * @param key - The key to retrieve
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns The parsed value or defaultValue
 */
export function safeGetItem<T = any>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to read from localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely removes an item from localStorage
 * @param key - The key to remove
 * @returns true if successful, false if failed
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from localStorage for key "${key}":`, error);
    return false;
  }
}

/**
 * Safely clears all localStorage
 * @returns true if successful, false if failed
 */
export function safeClear(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
    return false;
  }
}
