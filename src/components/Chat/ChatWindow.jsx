// File: src/components/Chat/ChatWindow.jsx
import { useEffect, useRef, useState } from 'react';
import useChat from '../../hooks/useChat.js';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import Sidebar from './Sidebar.jsx';
import styles from './ChatWindow.module.css';

function ChatWindow({ onBack }) {
  const {
    user, sessionId, messages, pastSessions,
    isLoading, isRegistering, isSidebarLoading, error,
    registerAndStart, startNewSession, loadSession,
    sendUserMessage, removeSession, clearError,
  } = useChat();

  const bottomRef    = useRef(null);
  const [name, setName]       = useState('');
  const [dob, setDob]         = useState('');   // YYYY-MM-DD (native date input)
  const [dobError, setDobError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Today's date in YYYY-MM-DD for the max attribute
  const todayISO = new Date().toISOString().split('T')[0];
  // Minimum — 120 years ago
  const minISO = `${new Date().getFullYear() - 120}-01-01`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function validateDob(value) {
    if (!value) return 'Date of birth is required.';
    const picked = new Date(value);
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    if (picked >= today) return 'Date of birth cannot be today or in the future.';
    const minDate = new Date(minISO);
    if (picked < minDate) return 'Please enter a valid date of birth.';
    return '';
  }

  function handleDobChange(e) {
    setDob(e.target.value);
    setDobError(validateDob(e.target.value));
  }

  function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const err = validateDob(dob);
    if (err) { setDobError(err); return; }
    // Convert YYYY-MM-DD → DD/MM/YYYY for the backend
    const [y, m, d] = dob.split('-');
    registerAndStart(name.trim(), `${d}/${m}/${y}`);
  }

  // ── STEP 1: Registration screen ──
  if (!user || !sessionId) {
    return (
      <div className={styles.window}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>← Back</button>
          <div className={styles.headerCenter}>
            <span className={styles.headerIcon}>🔮</span>
            <h1 className={styles.headerTitle}>AstroTalks</h1>
          </div>
          <div className={styles.headerSpacer} />
        </header>

        <main className={styles.registerScreen}>
          <p className={styles.registerGlyph}>☽ ✦ ☾</p>
          <h2 className={styles.registerTitle}>Namaste</h2>
          <p className={styles.registerSubtext}>
            To offer you personalised cosmic guidance,<br />
            Jyotish Guruji needs to know you a little.
          </p>

          <form className={styles.registerForm} onSubmit={handleRegister} noValidate>
            <div className={styles.field}>
              <label htmlFor="reg-name">Your Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Yash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isRegistering}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="reg-dob">Date of Birth</label>
              <input
                id="reg-dob"
                type="date"
                value={dob}
                onChange={handleDobChange}
                min={minISO}
                max={todayISO}
                disabled={isRegistering}
                required
              />
              {dobError && <span className={styles.fieldError}>{dobError}</span>}
            </div>

            {error && (
              <div className={styles.registerError} role="alert">
                {error}
                <button type="button" onClick={clearError}>✕</button>
              </div>
            )}

            <button
              type="submit"
              className={styles.registerBtn}
              disabled={isRegistering || !name.trim() || !dob || !!dobError}
            >
              {isRegistering ? (
                <><span className={styles.btnSpinner} /> Connecting to the cosmos…</>
              ) : (
                '🔮 Begin My Reading'
              )}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ── STEP 2: Chat screen with sidebar ──
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar
        user={user}
        sessions={pastSessions}
        activeSessionId={sessionId}
        isLoading={isSidebarLoading}
        onNewChat={startNewSession}
        onSelectSession={loadSession}
        onDeleteSession={removeSession}
        onBack={onBack}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat panel */}
      <div className={styles.window}>
        <header className={styles.header}>
          {/* Mobile hamburger */}
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat history"
          >
            ☰
          </button>

          <div className={styles.headerCenter}>
            <span className={styles.headerIcon} aria-hidden="true">🔮</span>
            <div>
              <h1 className={styles.headerTitle}>AstroTalks</h1>
              <p className={styles.headerStatus}>
                {isLoading
                  ? <span className={styles.statusTyping}>Guruji is channeling…</span>
                  : <span className={styles.statusOnline}>✦ {user.name} · {user.sunSign?.split(' ')[0]}</span>
                }
              </p>
            </div>
          </div>

          <button
            className={styles.newChatHeaderBtn}
            onClick={startNewSession}
            disabled={isLoading}
            title="Start new chat"
          >
            ＋ New
          </button>
        </header>

        {/* Messages */}
        <main className={styles.messageList} aria-live="polite">
          {messages.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <p className={styles.emptyGlyph}>☽ ✦ ☾</p>
              <p className={styles.emptyText}>
                Dhanyavaad, <strong>{user.name}ji</strong>.<br />
                Sun sign: <strong>{user.sunSign}</strong><br />
                Nakshatra: <strong>{user.nakshatra}</strong><br /><br />
                The cosmos is listening. Ask your question.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className={styles.typingWrapper}>
              <div className={styles.typingAvatar}>🔮</div>
              <div className={styles.typingBubble}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorBanner} role="alert">
              <span>{error}</span>
              <button className={styles.errorDismiss} onClick={clearError}>✕</button>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <ChatInput onSend={sendUserMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default ChatWindow;
