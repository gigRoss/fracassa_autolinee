import { scryptSync, timingSafeEqual, randomBytes, createHmac } from "crypto";
import { getDb } from './db';
import { adminUsers, type AdminUser } from './schema';
import { eq } from 'drizzle-orm';
import { nowInItaly } from "./dateUtils";

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h
const SESSION_COOKIE = "admin_session";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

/**
 * Hash password with salt using scrypt
 * Returns combined format: salt:hash
 */
export function hashPassword(password: string, salt: string): string {
  const buf = scryptSync(password, salt, 32);
  return buf.toString("hex");
}

/**
 * Find admin user by email from database
 */
export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = getDb();
  const result = await db.select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  return result[0] || null;
}

/**
 * Verify password against stored hash
 * Expects passwordHash in format: salt:hash
 */
export function verifyPassword(password: string, user: AdminUser): boolean {
  const parts = user.passwordHash.split(':');
  if (parts.length !== 2) return false;
  
  const [storedSalt, storedHash] = parts;
  const candidateHash = hashPassword(password, storedSalt);
  
  const candidate = Buffer.from(candidateHash, "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/**
 * Update last access timestamp for admin user
 */
export async function updateLastAccess(email: string): Promise<void> {
  const db = getDb();
  await db.update(adminUsers)
    .set({ lastAccess: nowInItaly() })
    .where(eq(adminUsers.email, email.toLowerCase()));
}

export type SessionPayload = {
  sub: string; // email
  exp: number; // epoch ms
  nonce: string;
};

function sign(payload: SessionPayload, secret: string): string {
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(base).digest("base64url");
  return `${base}.${sig}`;
}

function verify(token: string, secret: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base, sig] = parts;
  const expected = createHmac("sha256", secret).update(base).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf8")) as SessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSession(email: string, ttlMs: number = DEFAULT_SESSION_TTL_MS): string {
  const payload: SessionPayload = {
    sub: email.toLowerCase(),
    exp: Date.now() + ttlMs,
    nonce: randomBytes(8).toString("hex"),
  };
  return sign(payload, getSessionSecret());
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  return verify(token, getSessionSecret());
}

/**
 * Create a new admin user
 * @param email - Admin email (will be lowercased)
 * @param password - Plain text password
 * @param name - Display name
 * @param isAdmin - Whether the user is an admin (true) or driver (false)
 * @returns Created admin user
 */
export async function createAdminUser(email: string, password: string, name: string, isAdmin: boolean = true): Promise<AdminUser> {
  const db = getDb();
  const id = `admin-${Date.now()}-${randomBytes(4).toString('hex')}`;
  const salt = randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  
  const [user] = await db.insert(adminUsers).values({
    id,
    email: email.toLowerCase(),
    passwordHash: `${salt}:${hash}`,
    name,
    isAdmin,
    createdAt: nowInItaly(),
  }).returning();
  
  return user;
}

/**
 * List all admin users (excludes password hash)
 */
export async function listAdminUsers() {
  const db = getDb();
  return await db.select({
    id: adminUsers.id,
    email: adminUsers.email,
    name: adminUsers.name,
    isAdmin: adminUsers.isAdmin,
    lastAccess: adminUsers.lastAccess,
    createdAt: adminUsers.createdAt,
  }).from(adminUsers);
}

/**
 * Delete an admin user by ID
 */
export async function deleteAdminUser(id: string): Promise<void> {
  const db = getDb();
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export { SESSION_COOKIE, DEFAULT_SESSION_TTL_MS };


