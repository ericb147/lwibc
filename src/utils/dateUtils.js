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

function parseCalendarTime(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return [9, 0];

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return [hours, minutes];
}

function getEventTime(event, end = false) {
  const explicitTime = end ? event.endTime : event.startTime;
  if (explicitTime) return explicitTime;
  const displayTime = event.time?.split("-")[end ? 1 : 0]?.trim();
  return displayTime || "09:00";
}

function formatCalendarDate(date, time) {
  const [hours, minutes] = parseCalendarTime(time);
  const value = new Date(date);
  value.setUTCHours(hours, minutes, 0, 0);
  const datePart = value.toISOString().slice(0, 10).replace(/-/g, "");
  const timePart = value.toISOString().slice(11, 16).replace(":", "");
  return `${datePart}T${timePart}00`;
}

function encodeCalendarEvent(event, siteUrl) {
  const startTime = getEventTime(event);
  const endTime = getEventTime(event, true);
  const start = formatCalendarDate(event.date, startTime);
  const end = formatCalendarDate(event.endDate || event.date, endTime);
  const details = [event.summary, siteUrl].filter(Boolean).join("\n\n");
  const location = [event.location, event.address].filter(Boolean).join(", ");

  return { start, end, details, location };
}

export function getGoogleCalendarUrl(event, siteUrl) {
  const calendarEvent = encodeCalendarEvent(event, siteUrl);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${calendarEvent.start}/${calendarEvent.end}`,
    ctz: "America/New_York",
    details: calendarEvent.details,
    location: calendarEvent.location,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

export function getOutlookCalendarUrl(event, siteUrl) {
  const calendarEvent = encodeCalendarEvent(event, siteUrl);
  const start = new Date(event.date);
  const [startHours, startMinutes] = parseCalendarTime(getEventTime(event));
  start.setUTCHours(startHours, startMinutes, 0, 0);
  const end = new Date(event.endDate || event.date);
  const [endHours, endMinutes] = parseCalendarTime(getEventTime(event, true));
  end.setUTCHours(endHours, endMinutes, 0, 0);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: start.toISOString().replace(".000Z", ""),
    enddt: end.toISOString().replace(".000Z", ""),
    body: calendarEvent.details,
    location: calendarEvent.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

function formatIcsDate(date, time) {
  const [hours, minutes] = parseCalendarTime(time);
  const value = new Date(date);
  value.setUTCHours(hours, minutes, 0, 0);
  return value.toISOString().replace(/[-:]/g, "").replace(".000Z", "");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function getAppleCalendarIcs(event, siteUrl) {
  const startTime = getEventTime(event);
  const endTime = getEventTime(event, true);
  const start = formatIcsDate(event.date, startTime);
  const end = formatIcsDate(event.endDate || event.date, endTime);
  const location = [event.location, event.address].filter(Boolean).join(", ");
  const description = [event.summary, siteUrl].filter(Boolean).join("\n\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Living Waters Independent Baptist Church//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.slug)}@lwibc.com`,
    `DTSTAMP:${formatIcsDate(new Date(), "00:00")}Z`,
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${escapeIcsText(siteUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}