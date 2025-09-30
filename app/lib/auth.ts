import { scryptSync, timingSafeEqual, randomBytes, createHmac } from "crypto";

type AdminUser = {
  email: string;
  passwordSalt: string;
  passwordHash: string; // hex
};

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h
const SESSION_COOKIE = "admin_session";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function hashPassword(password: string, salt: string): string {
  const buf = scryptSync(password, salt, 32);
  return buf.toString("hex");
}

// Demo admin user (DO NOT use in production)
const DEMO_SALT = "demo-salt";
const DEMO_PASSWORD = "admin123";
const demoUser: AdminUser = {
  email: "admin@example.com",
  passwordSalt: DEMO_SALT,
  passwordHash: hashPassword(DEMO_PASSWORD, DEMO_SALT),
};

export function findAdminByEmail(email: string): AdminUser | null {
  return email.toLowerCase() === demoUser.email ? demoUser : null;
}

export function verifyPassword(password: string, user: AdminUser): boolean {
  const candidate = Buffer.from(hashPassword(password, user.passwordSalt), "hex");
  const stored = Buffer.from(user.passwordHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
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

export { SESSION_COOKIE };


