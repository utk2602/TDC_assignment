import { initialNotes } from './data.js';

const KEY = 'tdc-workspace-v1';
export const SESSION_KEY = 'tdc-demo-session';
export const DEMO_LOGIN = { username: 'priya', password: 'Tdc@2026' };
export const emptyWorkspace = () => ({ statuses: {}, notes: structuredClone(initialNotes), sent: [], shortlist: [] });

export function readWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved || saved.version !== 1) return emptyWorkspace();
    return {
      statuses: saved.statuses && typeof saved.statuses === 'object' ? saved.statuses : {},
      notes: saved.notes && typeof saved.notes === 'object' ? saved.notes : structuredClone(initialNotes),
      sent: Array.isArray(saved.sent) ? saved.sent : [],
      shortlist: Array.isArray(saved.shortlist) ? saved.shortlist : [],
    };
  } catch {
    return emptyWorkspace();
  }
}

export function saveWorkspace(workspace) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, ...workspace }));
    return true;
  } catch {
    return false;
  }
}

export function readSession() {
  try { return sessionStorage.getItem(SESSION_KEY) === 'priya'; } catch { return false; }
}

export function saveSession(signedIn) {
  try {
    if (signedIn) sessionStorage.setItem(SESSION_KEY, 'priya');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* The current tab can still work when browser storage is unavailable. */ }
}
