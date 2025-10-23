/**
 * Utility functions for text manipulation
 */

/**
 * Truncates text to a maximum length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Truncates stop names specifically for mobile display
 * Takes into account the available space before the "Acquista" button
 * @param stopName - The stop name to truncate
 * @returns Truncated stop name
 */
export function truncateStopName(stopName: string): string {
  // Based on the mobile layout, we have limited space before the "Acquista" button
  // With 14px font size, we limit to 20 characters to ensure no overlap
  const maxLength = 20;
  return truncateText(stopName, maxLength);
}
