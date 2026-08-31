import fs from "fs";
import path from "path";
import crypto from "crypto";

const sessionsPath = path.join(process.cwd(), "data", "sessions.json");

function readSessions() {
  try {
    if (fs.existsSync(sessionsPath)) {
      return JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    }
  } catch {}
  return {};
}

function writeSessions(sessions: Record<string, any>) {
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
}

export function createSession(userId: string, role: string, username: string, name: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = readSessions();
  sessions[token] = {
    userId,
    role,
    username,
    name,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  writeSessions(sessions);
  return token;
}

export function getSession(token: string | undefined): { userId: string; role: string; username: string; name: string } | null {
  if (!token) return null;
  const sessions = readSessions();
  const session = sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeSessions(sessions);
    return null;
  }
  return { userId: session.userId, role: session.role, username: session.username, name: session.name };
}

export function deleteSession(token: string | undefined): boolean {
  if (!token) return false;
  const sessions = readSessions();
  if (sessions[token]) {
    delete sessions[token];
    writeSessions(sessions);
    return true;
  }
  return false;
}

export function cleanupExpiredSessions() {
  const sessions = readSessions();
  let changed = false;
  for (const [token, session] of Object.entries(sessions)) {
    if (new Date((session as any).expiresAt) < new Date()) {
      delete sessions[token];
      changed = true;
    }
  }
  if (changed) writeSessions(sessions);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}