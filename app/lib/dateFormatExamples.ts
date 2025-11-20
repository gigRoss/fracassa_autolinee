/**
 * Date Format Examples and Utilities
 * 
 * This file demonstrates the date format conversions used in the ticketing system.
 */

import { formatDateForTicket } from './ticketUtils';

/**
 * Convert YYYY-MM-DD format to YYYYMMDD format
 * Used for ticket number generation
 */
export function convertDepartureDateToTicketFormat(departureDateStr: string): string {
  // Input: "2025-11-20" (YYYY-MM-DD)
  // Output: "20251120" (YYYYMMDD)
  
  const dateObj = new Date(departureDateStr + 'T00:00:00Z');
  return formatDateForTicket(dateObj);
}

/**
 * Convert Date object to YYYY-MM-DD format
 * Used for database storage
 */
export function formatDepartureDateForDatabase(date: Date): string {
  // Output: "2025-11-20" (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
}

/**
 * Examples of date format usage
 */


/**
 * Validate that a date string is in YYYY-MM-DD format
 */
export function isValidDepartureDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(date.getTime());
}

/**
 * Validate that a ticket number date part is in YYYYMMDD format
 */
export function isValidTicketNumberDateFormat(dateStr: string): boolean {
  const regex = /^\d{8}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  
  // Extract year, month, day
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  
  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 2024 || year > 2100) return false;
  
  // Check if it forms a valid date
  const dateObj = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`);
  return !isNaN(dateObj.getTime());
}

/**
 * Extract date from ticket number
 * @param ticketNumber Format: YYYYMMDD-CCC-HH-I
 * @returns Date in YYYY-MM-DD format
 */
export function extractDateFromTicketNumber(ticketNumber: string): string | null {
  const parts = ticketNumber.split('-');
  if (parts.length < 4) return null;
  
  const datePart = parts[0];
  if (!isValidTicketNumberDateFormat(datePart)) return null;
  
  // Convert YYYYMMDD to YYYY-MM-DD
  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);
  
  return `${year}-${month}-${day}`;
}

// Example usage demonstration
if (require.main === module) {
  console.log('Date Format Examples for Ticketing System\n');
  console.log('===========================================\n');
  
  
  // Test conversion
  const testDate = '2025-11-20';
  console.log(`\nConversion Test:`);
  console.log(`  Input (YYYY-MM-DD):  ${testDate}`);
  console.log(`  Output (YYYYMMDD):   ${convertDepartureDateToTicketFormat(testDate)}`);
  
  // Test extraction
  const testTicketNumber = '20251120-TER-14-1';
  console.log(`\nExtraction Test:`);
  console.log(`  Ticket Number:       ${testTicketNumber}`);
  console.log(`  Extracted Date:      ${extractDateFromTicketNumber(testTicketNumber)}`);
}

