import { parseISO } from "date-fns";

/**
 * Format a date in a human-readable format
 * Fixes the "Day Rollover" issue by forcing UTC timezone display.
 * @param {Date|string} date The date to format
 * @param {string} formatStr Note: Native Intl is used here, formatStr is kept for compatibility
 * @returns {string} The formatted date (e.g., "January 18, 2026")
 */
export function formatDate(date) {
  if (!date) return "";

  // 1. Convert everything to a Date object
  // Astro Content Collections usually pass a Date object, 
  // but we handle strings just in case.
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  // 2. Use the Internationalization API to force UTC.
  // This prevents the system from subtracting hours based on local timezones.
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', 
  }).format(dateObj);
}

/**
 * Check if a date is in the future
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateObj > new Date();
}

/**
 * Check if a date is in the past
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is in the past
 */
export function isPastDate(date) {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateObj < new Date();
}