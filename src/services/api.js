// File: src/services/api.js
// All requests go to our Express backend — API key never reaches the browser.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/** Register a new user (or return existing) */
export async function registerUser(name, dob) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, dob }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to register user.');
  }
  return res.json();   // { _id, name, dob, sunSign, nakshatra, ... }
}

/** Start a new chat session for a user */
export async function createSession(userId) {
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create session.');
  }
  return res.json();   // { _id, userId, messages: [] }
}

/** Send a user message → get AI reply (both saved in DB) */
export async function sendMessage(sessionId, content, userId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message.');
  }
  const data = await res.json();
  return data.reply;   // string
}

/** Fetch all past sessions (with preview) for a user */
export async function getUserSessions(userId) {
  const res = await fetch(`${BASE_URL}/api/sessions/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch sessions.');
  return res.json();   // [{ _id, createdAt, preview, messageCount }]
}

/** Load a full session by ID (messages included) */
export async function getSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load session.');
  return res.json();   // { _id, userId, messages: [...] }
}

/** Delete a session by ID */
export async function deleteSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete session.');
  return res.json();
}
