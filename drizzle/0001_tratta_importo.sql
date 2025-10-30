
-- Migration: create tratta_importo and link intermediate_stops via FK

-- 1) Create table tratta_importo
CREATE TABLE "TRATTA_IMPORTO" (
  "FASCIA" INTEGER PRIMARY KEY,
  "IMPORTO" INTEGER NOT NULL CHECK ("IMPORTO" >= 0),
  "CURRENCY" TEXT NOT NULL DEFAULT 'EUR'
);

-- Seed example tiers (IMPORTO stored in cents)
INSERT INTO "TRATTA_IMPORTO" ("FASCIA", "IMPORTO", "CURRENCY") VALUES (1, 140, 'EUR');
INSERT INTO "TRATTA_IMPORTO" ("FASCIA", "IMPORTO", "CURRENCY") VALUES (2, 230, 'EUR');
INSERT INTO "TRATTA_IMPORTO" ("FASCIA", "IMPORTO", "CURRENCY") VALUES (3, 360, 'EUR');
INSERT INTO "TRATTA_IMPORTO" ("FASCIA", "IMPORTO", "CURRENCY") VALUES (4, 430, 'EUR');

-- 2) Add FK column to intermediate_stops
ALTER TABLE "intermediate_stops"
ADD COLUMN "FASCIA" INTEGER  NULL 
REFERENCES "TRATTA_IMPORTO"("FASCIA") ON UPDATE CASCADE ON DELETE SET NULL;

-- 3) Index for fast lookup
CREATE INDEX "idx_intermediate_stops_tratta_importo_id"
  ON "intermediate_stops" ("FASCIA");



