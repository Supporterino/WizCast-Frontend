export type SessionRole = 'host' | 'contestant';

export interface SessionCredentials {
  joinCode: string;
  sessionToken: string;
}

const STORAGE_KEY_PREFIX = 'wizcast.session';

function storageKey(role: SessionRole): string {
  return `${STORAGE_KEY_PREFIX}.${role}`;
}

function isCredentials(value: unknown): value is SessionCredentials {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SessionCredentials>;
  return typeof candidate.joinCode === 'string' && typeof candidate.sessionToken === 'string';
}

export function getSessionCredentials(role: SessionRole): SessionCredentials | null {
  try {
    const raw = localStorage.getItem(storageKey(role));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isCredentials(parsed)) return null;
    return { joinCode: parsed.joinCode, sessionToken: parsed.sessionToken };
  } catch {
    return null;
  }
}

export function setSessionCredentials(role: SessionRole, credentials: SessionCredentials): void {
  try {
    localStorage.setItem(storageKey(role), JSON.stringify(credentials));
  } catch {
    // storage unavailable (private mode) — session stays in-memory only
  }
}

export function clearSessionCredentials(role: SessionRole): void {
  try {
    localStorage.removeItem(storageKey(role));
  } catch {
    // storage unavailable — nothing to clear
  }
}
