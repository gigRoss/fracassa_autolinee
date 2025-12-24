import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ============================================================================
// STOPS TABLE
// ============================================================================
export const stops = sqliteTable('stops', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ============================================================================
// RIDES TABLE
// ============================================================================
export const rides = sqliteTable('rides', {
  id: text('id').primaryKey(),
  lineName: text('line_name').notNull(),
  originStopId: text('origin_stop_id').notNull().references(() => stops.id),
  destinationStopId: text('destination_stop_id').notNull().references(() => stops.id),
  departureTime: text('departure_time').notNull(), // formato HH:MM
  arrivalTime: text('arrival_time').notNull(), // formato HH:MM
  archived: integer('archived', { mode: 'boolean' }).default(false),
  availableSaturday: integer('available_saturday', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, (table) => ({
  originIdx: index('idx_rides_origin').on(table.originStopId),
  destinationIdx: index('idx_rides_destination').on(table.destinationStopId),
  activeIdx: index('idx_rides_active').on(table.archived),
}));

// ============================================================================
// INTERMEDIATE_STOPS TABLE
// ============================================================================
export const intermediateStops = sqliteTable('intermediate_stops', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  rideId: text('ride_id').notNull().references(() => rides.id, { onDelete: 'cascade' }),
  stopId: text('stop_id').notNull().references(() => stops.id),
  arrivalTime: text('arrival_time').notNull(), // formato HH:MM
  stopOrder: integer('stop_order').notNull(),
  // Matches migration column name (uppercase) that references TRATTA_IMPORTO.FASCIA
  fascia: integer('FASCIA'),
}, (table) => ({
  rideIdx: index('idx_intermediate_ride').on(table.rideId),
}));

// ============================================================================
// ADMIN_USERS TABLE
// ============================================================================
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(true),
  lastAccess: integer('last_access', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

// ============================================================================
// AUDIT_EVENTS TABLE
// ============================================================================
export const auditEvents = sqliteTable('audit_events', {
  id: text('id').primaryKey(),
  actor: text('actor').notNull(), // email o id admin
  eventType: text('event_type').notNull(), // es: 'ride.created'
  rideId: text('ride_id').references(() => rides.id),
  description: text('description').notNull(),
  changes: text('changes'), // JSON serializzato
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  timestampIdx: index('idx_audit_timestamp').on(table.timestamp),
  rideIdx: index('idx_audit_ride').on(table.rideId),
}));

// ============================================================================
// ANALYTICS_EVENTS TABLE (Livello 1: Dati aggregati anonimi - NO consent needed)
// ============================================================================
export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  hour: integer('hour').notNull(), // 0-23
  eventType: text('event_type').notNull(), // 'search', 'view_ride', 'view_stop', 'pageview'
  eventData: text('event_data'), // JSON leggero: { route: 'Teramo-Guazzano' } o { rideId: '...' }
  count: integer('count').notNull().default(1), // Aggregato: numero occorrenze
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, (table) => ({
  dateHourIdx: index('idx_analytics_date_hour').on(table.date, table.hour),
  typeIdx: index('idx_analytics_type').on(table.eventType),
  dateTypeIdx: index('idx_analytics_date_type').on(table.date, table.eventType),
}));

// ============================================================================
// USER_SESSIONS TABLE (Livello 2: Session tracking - REQUIRES consent)
// ============================================================================
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(), // UUID generato client-side
  firstSeen: integer('first_seen', { mode: 'timestamp' }).notNull(),
  lastSeen: integer('last_seen', { mode: 'timestamp' }).notNull(),
  pageviews: integer('pageviews').notNull().default(1),
  events: text('events'), // JSON array di eventi: [{ type, data, timestamp }]
  // Dati tecnici (solo se consenso dato)
  userAgent: text('user_agent'),
  language: text('language'),
  timezone: text('timezone'),
  screenResolution: text('screen_resolution'),
  isPWA: integer('is_pwa', { mode: 'boolean' }).default(false),
  // Privacy: NO IP address, NO fingerprinting aggressivo
}, (table) => ({
  firstSeenIdx: index('idx_sessions_first_seen').on(table.firstSeen),
  lastSeenIdx: index('idx_sessions_last_seen').on(table.lastSeen),
}));

// ============================================================================
// FESTIVITA TABLE
// ============================================================================
export const festivita = sqliteTable('festivita', {
  date: text('date').primaryKey(), // formato YYYY-MM-DD
  name: text('name').notNull(),
});

// ============================================================================
// EMAIL_LOGS TABLE (Story 7.1.5 - Email audit trail)
// ============================================================================
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').references(() => tickets.ticketNumber),
  recipientEmail: text('recipient_email').notNull(),
  emailType: text('email_type').notNull(), // 'ticket_confirmation', 'reminder', etc.
  status: text('status').notNull(), // 'sent', 'failed', 'retrying'
  messageId: text('message_id'), // External email service message ID
  errorMessage: text('error_message'),
  attemptCount: integer('attempt_count').notNull().default(1),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  ticketIdx: index('idx_email_logs_ticket').on(table.ticketNumber),
  emailIdx: index('idx_email_logs_email').on(table.recipientEmail),
  statusIdx: index('idx_email_logs_status').on(table.status),
  sentAtIdx: index('idx_email_logs_sent_at').on(table.sentAt),
}));

// ============================================================================
// TICKETS TABLE
// ============================================================================
export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(), // formato YYYYMMDD-CCC-HH-I
  passengerName: text('passenger_name').notNull(),
  passengerSurname: text('passenger_surname').notNull(),
  passengerEmail: text('passenger_email').notNull(),
  rideId: text('ride_id').notNull().references(() => rides.id),
  departureDate: text('departure_date').notNull(), // formato YYYY-MM-DD
  departureTime: text('departure_time').notNull(), // formato HH:MM
  originStopId: text('origin_stop_id').notNull().references(() => stops.id),
  destinationStopId: text('destination_stop_id').notNull().references(() => stops.id),
  purchaseTimestamp: integer('purchase_timestamp', { mode: 'timestamp' }).notNull(),
  paymentStatus: text('payment_status').notNull(), // 'pending', 'completed', 'failed'
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSessionId: text('stripe_session_id'),
  amountPaid: integer('amount_paid').notNull(), // in cents
  passengerCount: integer('passenger_count').notNull().default(1),
  validated: integer('validate', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, (table) => ({
  ticketNumberIdx: index('idx_tickets_ticket_number').on(table.ticketNumber),
  rideIdx: index('idx_tickets_ride').on(table.rideId),
  dateIdx: index('idx_tickets_date').on(table.departureDate),
  emailIdx: index('idx_tickets_email').on(table.passengerEmail),
  purchaseIdx: index('idx_tickets_purchase').on(table.purchaseTimestamp),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const ridesRelations = relations(rides, ({ one, many }) => ({
  originStop: one(stops, {
    fields: [rides.originStopId],
    references: [stops.id],
    relationName: 'origin',
  }),
  destinationStop: one(stops, {
    fields: [rides.destinationStopId],
    references: [stops.id],
    relationName: 'destination',
  }),
  intermediateStops: many(intermediateStops),
}));

export const stopsRelations = relations(stops, ({ many }) => ({
  ridesAsOrigin: many(rides, { relationName: 'origin' }),
  ridesAsDestination: many(rides, { relationName: 'destination' }),
  intermediateStops: many(intermediateStops),
}));

export const intermediateStopsRelations = relations(intermediateStops, ({ one }) => ({
  ride: one(rides, {
    fields: [intermediateStops.rideId],
    references: [rides.id],
  }),
  stop: one(stops, {
    fields: [intermediateStops.stopId],
    references: [stops.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  ride: one(rides, {
    fields: [tickets.rideId],
    references: [rides.id],
  }),
  originStop: one(stops, {
    fields: [tickets.originStopId],
    references: [stops.id],
    relationName: 'ticketOrigin',
  }),
  destinationStop: one(stops, {
    fields: [tickets.destinationStopId],
    references: [stops.id],
    relationName: 'ticketDestination',
  }),
}));

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Stop = typeof stops.$inferSelect;
export type NewStop = typeof stops.$inferInsert;

export type Ride = typeof rides.$inferSelect;
export type NewRide = typeof rides.$inferInsert;

export type IntermediateStop = typeof intermediateStops.$inferSelect;
export type NewIntermediateStop = typeof intermediateStops.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export type Festivita = typeof festivita.$inferSelect;
export type NewFestivita = typeof festivita.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;

