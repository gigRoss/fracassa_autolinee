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


