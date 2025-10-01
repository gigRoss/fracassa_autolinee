-- Migration: Initial schema with 5 tables
-- Generated from schema.ts

CREATE TABLE `stops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);

CREATE TABLE `rides` (
	`id` text PRIMARY KEY NOT NULL,
	`line_name` text NOT NULL,
	`origin_stop_id` text NOT NULL,
	`destination_stop_id` text NOT NULL,
	`departure_time` text NOT NULL,
	`arrival_time` text NOT NULL,
	`archived` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`origin_stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `intermediate_stops` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ride_id` text NOT NULL,
	`stop_id` text NOT NULL,
	`arrival_time` text NOT NULL,
	`stop_order` integer NOT NULL,
	FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`last_access` integer,
	`created_at` integer
);

CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`event_type` text NOT NULL,
	`ride_id` text,
	`description` text NOT NULL,
	`changes` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON UPDATE no action ON DELETE no action
);

-- Indexes for performance
CREATE INDEX `idx_rides_origin` ON `rides` (`origin_stop_id`);
CREATE INDEX `idx_rides_destination` ON `rides` (`destination_stop_id`);
CREATE INDEX `idx_rides_active` ON `rides` (`archived`);
CREATE INDEX `idx_intermediate_ride` ON `intermediate_stops` (`ride_id`);
CREATE INDEX `idx_audit_timestamp` ON `audit_events` (`timestamp`);
CREATE INDEX `idx_audit_ride` ON `audit_events` (`ride_id`);

-- Unique constraint for admin_users email
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);


