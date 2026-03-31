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

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

function getUTCDateValue(date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0
  );
}

/**
 * Check if a date is in the future (ignores time, compares date only)
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is today or in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const todayValue = getUTCDateValue(new Date());
  const eventValue = getUTCDateValue(dateObj);
  return eventValue >= todayValue;
}

/**
 * Check if a date is in the past (ignores time, compares date only)
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is before today
 */
export function isPastDate(date) {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const todayValue = getUTCDateValue(new Date());
  const eventValue = getUTCDateValue(dateObj);
  return eventValue < todayValue;
}