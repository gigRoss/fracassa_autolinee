/**
 * Ticket Utility Functions
 * Story 7.1.4 - Ticket Generation and Unique Number Assignment
 * 
 * Format: YYYYMMDD-CCC-HH-I
 * - YYYYMMDD: departure date (chosen by user)
 * - CCC: ride code (3 alphanumeric chars)
 * - HH: departure hour (2 digits)
 * - I: incremental index for same day/ride/hour
 */

import { getDb } from './db';
import { tickets } from './schema';
import { eq, and, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * Generate a 3-character alphanumeric code from a ride ID
 * This creates a compact, readable representation
 */
export function generateRideCode(rideId: string): string {
  // Take first 3 characters of ride ID, or pad if shorter
  let code = rideId.substring(0, 3).toUpperCase();
  
  // Replace non-alphanumeric characters with numbers
  code = code.replace(/[^A-Z0-9]/g, '0');
  
  // Pad with zeros if needed
  while (code.length < 3) {
    code += '0';
  }
  
  return code;
}

/**
 * Format date as YYYYMMDD
 */
export function formatDateForTicket(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Extract hour from time string (HH:MM format)
 */
export function extractHour(timeString: string): string {
  const hour = timeString.split(':')[0];
  return hour.padStart(2, '0');
}

/**
 * Generate ticket number with atomic increment
 * Format: YYYYMMDD-CCC-HH-I
 * 
 * This function must be called within a database transaction to ensure atomicity
 */
export async function generateTicketNumber(
  rideId: string,
  departureTime: string,
  departureDate: string // YYYY-MM-DD format
): Promise<string> {
  const db = getDb();
  
  // Validate departure date format
  if (!departureDate || departureDate.trim() === '') {
    throw new Error('Departure date is required for ticket number generation');
  }
  
  // Parse the departure date string (YYYY-MM-DD) as local date
  // Split and parse to avoid timezone issues
  const dateParts = departureDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error(`Invalid departure date format: ${departureDate}. Expected YYYY-MM-DD format.`);
  }
  
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  
  // Create date in local timezone (month is 0-indexed in JavaScript)
  const departureDateObj = new Date(year, month - 1, day);
  
  // Check if date is valid
  if (isNaN(departureDateObj.getTime()) || 
      departureDateObj.getFullYear() !== year ||
      departureDateObj.getMonth() !== month - 1 ||
      departureDateObj.getDate() !== day) {
    throw new Error(`Invalid departure date format: ${departureDate}. Expected YYYY-MM-DD format.`);
  }
  
  const dateStr = formatDateForTicket(departureDateObj);
  const rideCode = generateRideCode(rideId);
  const hour = extractHour(departureTime);
  
  // Create the prefix for searching existing tickets
  const prefix = `${dateStr}-${rideCode}-${hour}-`;
  
  // Find all tickets with the same prefix (same day, ride, hour)
  const existingTickets = await db
    .select({ ticketNumber: tickets.ticketNumber })
    .from(tickets)
    .where(like(tickets.ticketNumber, `${prefix}%`));
  
  // Find the highest index
  let maxIndex = 0;
  for (const ticket of existingTickets) {
    const parts = ticket.ticketNumber.split('-');
    if (parts.length === 4) {
      const index = parseInt(parts[3], 10);
      if (!isNaN(index) && index > maxIndex) {
        maxIndex = index;
      }
    }
  }
  
  // Increment for new ticket
  const newIndex = maxIndex + 1;
  
  return `${prefix}${newIndex}`;
}

/**
 * Create ticket data for database insertion
 */
export interface CreateTicketData {
  passengerName: string;
  passengerSurname: string;
  passengerEmail: string;
  rideId: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  originStopId: string;
  destinationStopId: string;
  amountPaid: number; // in cents
  passengerCount: number;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

/**
 * Create a new ticket with unique ticket number
 * This function handles the atomic ticket generation
 */
export async function createTicket(data: CreateTicketData) {
  const db = getDb();
  const ticketId = randomUUID();
  const purchaseTimestamp = new Date();
  
  // Log ticket creation attempt
  console.log('[TICKET] Creating ticket with data:', {
    rideId: data.rideId,
    departureDate: data.departureDate,
    departureTime: data.departureTime,
    passengerEmail: data.passengerEmail,
  });
  
  // Generate unique ticket number using the departure date chosen by the user
  const ticketNumber = await generateTicketNumber(
    data.rideId,
    data.departureTime,
    data.departureDate // Use the departure date instead of purchase date
  );
  
  console.log('[TICKET] Generated ticket number:', ticketNumber);
  
  // Insert ticket into database
  const ticket = await db.insert(tickets).values({
    id: ticketId,
    ticketNumber,
    passengerName: data.passengerName,
    passengerSurname: data.passengerSurname,
    passengerEmail: data.passengerEmail,
    rideId: data.rideId,
    departureDate: data.departureDate,
    departureTime: data.departureTime,
    originStopId: data.originStopId,
    destinationStopId: data.destinationStopId,
    purchaseTimestamp,
    paymentStatus: data.paymentStatus,
    stripePaymentIntentId: data.stripePaymentIntentId,
    stripeSessionId: data.stripeSessionId,
    amountPaid: data.amountPaid,
    passengerCount: data.passengerCount,
    createdAt: purchaseTimestamp,
    updatedAt: purchaseTimestamp,
  }).returning();
  
  return ticket[0];
}

/**
 * Get ticket by ticket number
 */
export async function getTicketByNumber(ticketNumber: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.ticketNumber, ticketNumber))
    .limit(1);
  
  return result[0];
}

/**
 * Get tickets by email
 */
export async function getTicketsByEmail(email: string) {
  const db = getDb();
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.passengerEmail, email))
    .orderBy(tickets.purchaseTimestamp);
}

/**
 * Get ticket by Stripe session ID
 */
export async function getTicketBySessionId(sessionId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.stripeSessionId, sessionId))
    .limit(1);
  
  return result[0];
}

/**
 * Update ticket payment status
 */
export async function updateTicketPaymentStatus(
  ticketId: string,
  status: 'pending' | 'completed' | 'failed'
) {
  const db = getDb();
  return db
    .update(tickets)
    .set({
      paymentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));
}

/**
 * Get all tickets (for admin dashboard)
 */
export async function getAllTickets() {
  const db = getDb();
  return db
    .select()
    .from(tickets)
    .orderBy(tickets.purchaseTimestamp);
}

/**
 * Get tickets by ride ID for a specific date (for driver view)
 * Only returns completed tickets
 */
export async function getTicketsByRideId(rideId: string, departureDate?: string) {
  const db = getDb();
  
  // Build the query
  if (departureDate) {
    return db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.rideId, rideId),
          eq(tickets.departureDate, departureDate),
          eq(tickets.paymentStatus, 'completed')
        )
      )
      .orderBy(tickets.purchaseTimestamp);
  }
  
  // If no date specified, return all completed tickets for the ride
  return db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.rideId, rideId),
        eq(tickets.paymentStatus, 'completed')
      )
    )
    .orderBy(tickets.purchaseTimestamp);
}

/**
 * Get upcoming tickets by ride ID (for driver view)
 * Returns tickets for today and future dates
 */
export async function getUpcomingTicketsByRideId(rideId: string) {
  const db = getDb();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Get all completed tickets for this ride from today onwards
  const allTickets = await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.rideId, rideId),
        eq(tickets.paymentStatus, 'completed')
      )
    )
    .orderBy(tickets.departureDate, tickets.purchaseTimestamp);
  
  // Filter to only include today and future dates
  return allTickets.filter(ticket => ticket.departureDate >= todayStr);
}

/**
 * Get all ride IDs that have upcoming tickets (for driver rides list)
 * Returns unique ride IDs that have at least one completed ticket for today or future dates
 */
export async function getRideIdsWithUpcomingTickets(): Promise<string[]> {
  const db = getDb();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Get all completed tickets
  const allTickets = await db
    .select({ rideId: tickets.rideId, departureDate: tickets.departureDate })
    .from(tickets)
    .where(eq(tickets.paymentStatus, 'completed'));
  
  // Filter to today and future, then get unique ride IDs
  const upcomingRideIds = new Set<string>();
  for (const ticket of allTickets) {
    if (ticket.departureDate >= todayStr) {
      upcomingRideIds.add(ticket.rideId);
    }
  }
  
  return Array.from(upcomingRideIds);
}

/**
 * Validate (or unvalidate) a ticket
 * Called by driver when checking passenger ticket
 */
export async function validateTicket(ticketId: string, validated: boolean = true) {
  const db = getDb();
  return db
    .update(tickets)
    .set({
      validated,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));
}

