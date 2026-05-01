// File: src/hooks/useChat.js
import { useState, useCallback, useEffect } from 'react';
import {
  registerUser, createSession, sendMessage,
  getUserSessions, getSession, deleteSession,
} from '../services/api.js';

function loadPersistedState() {
  try {
    const user      = JSON.parse(sessionStorage.getItem('at_user') || 'null');
    const sessionId = sessionStorage.getItem('at_session') || null;
    return { user, sessionId };
  } catch {
    return { user: null, sessionId: null };
  }
}

function useChat() {
  const persisted = loadPersistedState();
  const [user, setUser]               = useState(persisted.user);
  const [sessionId, setSessionId]     = useState(persisted.sessionId);
  const [messages, setMessages]       = useState([]);
  const [pastSessions, setPastSessions] = useState([]);   // sidebar list
  const [isLoading, setIsLoading]         = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [error, setError]             = useState(null);

  // Refresh past sessions list from DB
  const refreshSessions = useCallback(async (userId) => {
    setIsSidebarLoading(true);
    try {
      const list = await getUserSessions(userId);
      setPastSessions(list);
    } catch { /* silent fail — sidebar is non-critical */ }
    finally { setIsSidebarLoading(false); }
  }, []);

  // Persist user + sessionId across page refreshes (within the same browser tab)
  useEffect(() => {
    if (user) sessionStorage.setItem('at_user', JSON.stringify(user));
    else sessionStorage.removeItem('at_user');
  }, [user]);

  useEffect(() => {
    if (sessionId) sessionStorage.setItem('at_session', sessionId);
    else sessionStorage.removeItem('at_session');
  }, [sessionId]);

  // On first mount, restore messages for the persisted session
  useEffect(() => {
    if (!persisted.user || !persisted.sessionId) return;
    getSession(persisted.sessionId)
      .then((session) => {
        setMessages(
          session.messages.map((m, i) => ({
            id: i,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
          }))
        );
        refreshSessions(persisted.user._id);
      })
      .catch(() => {
        // Session no longer valid — clear persisted state and show registration
        sessionStorage.removeItem('at_user');
        sessionStorage.removeItem('at_session');
        setUser(null);
        setSessionId(null);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register user + open a fresh session
  const registerAndStart = useCallback(async (name, dob) => {
    setIsRegistering(true);
    setError(null);
    try {
      const savedUser = await registerUser(name, dob);
      const session   = await createSession(savedUser._id);
      setUser(savedUser);
      setSessionId(session._id);
      setMessages([]);
      await refreshSessions(savedUser._id);
    } catch (err) {
      setError(err.message || 'Could not start session. Is the server running?');
    } finally {
      setIsRegistering(false);
    }
  }, [refreshSessions]);

  // Start a brand-new chat session (user already registered)
  const startNewSession = useCallback(async () => {
    if (!user) return;
    // If current session is already empty, don't create another one
    if (messages.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const session = await createSession(user._id);
      setSessionId(session._id);
      setMessages([]);
      await refreshSessions(user._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, messages.length, refreshSessions]);

  // Load an old session from DB into the chat window
  const loadSession = useCallback(async (id) => {
    if (id === sessionId) return;   // already active
    setIsLoading(true);
    setError(null);
    try {
      const session = await getSession(id);
      setSessionId(session._id);
      // Map DB messages to local shape (add a local id for React key)
      setMessages(
        session.messages.map((m, i) => ({
          id: i,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt),
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Send a message in the active session
  const sendUserMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !sessionId) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const replyText = await sendMessage(sessionId, trimmed, user?._id);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Update sidebar preview after each reply
      await refreshSessions(user._id);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user, isLoading, refreshSessions]);

  // Delete a session; if it was active, start a fresh one
  const removeSession = useCallback(async (id) => {
    if (!user) return;
    try {
      await deleteSession(id);
      if (id === sessionId) {
        const session = await createSession(user._id);
        setSessionId(session._id);
        setMessages([]);
      }
      await refreshSessions(user._id);
    } catch (err) {
      setError(err.message);
    }
  }, [user, sessionId, refreshSessions]);

  const clearError = useCallback(() => setError(null), []);

  return {
    user, sessionId, messages, pastSessions,
    isLoading, isRegistering, isSidebarLoading, error,
    registerAndStart, startNewSession, loadSession,
    sendUserMessage, removeSession, clearError,
  };
}

export default useChat;
