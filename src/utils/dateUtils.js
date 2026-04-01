import { parseISO } from "date-fns";

function parseDate(date) {
  return typeof date === "string" ? parseISO(date) : date;
}

/**
 * Format a date in a human-readable format
 * Fixes the "Day Rollover" issue by forcing UTC timezone display.
 * @param {Date|string} date The date to format
 * @returns {string} The formatted date (e.g., "January 18, 2026")
 */
export function formatDate(date) {
  if (!date) return "";

  const dateObj = parseDate(date);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

/**
 * Format a date range for events with both date and endDate.
 * Example: "March 25, 2026" or "March 25–27, 2026" or "March 31 – April 2, 2026"
 */
export function formatEventDate(startDate, endDate) {
  if (!startDate) return "";
  const start = parseDate(startDate);
  if (!endDate) {
    return formatDate(start);
  }

  const end = parseDate(endDate);
  const sameDay = start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();

  if (sameDay) {
    return formatDate(start);
  }

  const sameMonth = start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(start)}–${new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'UTC' }).format(end)}, ${start.getUTCFullYear()}`;
  }

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  if (sameYear) {
    return `${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(start)} – ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(end)}, ${start.getUTCFullYear()}`;
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
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
  const dateObj = parseDate(date);
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
  const dateObj = parseDate(date);
  const todayValue = getUTCDateValue(new Date());
  const eventValue = getUTCDateValue(dateObj);
  return eventValue < todayValue;
}