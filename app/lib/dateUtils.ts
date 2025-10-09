/**
 * Utility functions for handling dates with Italian timezone (Europe/Rome)
 */

const ITALIAN_TIMEZONE = "Europe/Rome";

/**
 * Get current date/time in Italian timezone
 * Returns a Date object that when saved to DB will represent Italian local time
 */
export function nowInItaly(): Date {
  const now = new Date();
  
  // Get the time string in Italian timezone (format: YYYY-MM-DD HH:MM:SS)
  const italianTimeString = now.toLocaleString('sv-SE', { 
    timeZone: ITALIAN_TIMEZONE 
  });
  
  // Parse as UTC by appending 'Z' - this creates a timestamp that represents Italian time
  return new Date(italianTimeString + 'Z');
}

/**
 * Convert any date to Italian timezone
 * Converts a UTC timestamp to Italian local time representation
 */
export function toItalianTime(date: Date | number | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const italianTimeString = d.toLocaleString('sv-SE', { 
    timeZone: ITALIAN_TIMEZONE 
  });
  
  // Parse as UTC by appending 'Z'
  return new Date(italianTimeString + 'Z');
}

/**
 * Format a date in Italian format
 * @param date - The date to format (already in Italian time if from DB)
 * @param includeTime - Whether to include time (default: true)
 * @returns Formatted string like "09/10/2025, 14:30" or "09/10/2025"
 */
export function formatItalianDate(
  date: Date | number | null | undefined,
  includeTime: boolean = true
): string {
  if (!date) return "Mai";
  
  const d = typeof date === 'number' ? new Date(date) : date;
  
  // Read UTC components (which represent Italian time)
  if (includeTime) {
    return d.toLocaleString("it-IT", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return d.toLocaleDateString("it-IT", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

/**
 * Format a date as ISO string (timestamps from DB are already in Italian time)
 */
export function toItalianISO(date: Date | number | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS
}

/**
 * Get a human-friendly relative time label in Italian
 * @param date - The date to format (already in Italian time if from DB)
 * @returns String like "oggi 14:30", "ieri 09:15", or full date
 */
export function formatRelativeItalian(date: Date | number | null | undefined): string {
  if (!date) return "Mai";
  
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = nowInItaly();
  
  // Set to midnight for date comparison (using UTC methods since times are stored as Italian time in UTC)
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  
  const dateOnly = new Date(d);
  dateOnly.setUTCHours(0, 0, 0, 0);
  
  const timeStr = d.toLocaleTimeString("it-IT", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  if (dateOnly.getTime() === today.getTime()) {
    return `oggi ${timeStr}`;
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return `ieri ${timeStr}`;
  } else {
    return formatItalianDate(d, true);
  }
}

