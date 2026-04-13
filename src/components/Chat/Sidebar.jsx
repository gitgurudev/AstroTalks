// File: src/components/Chat/Sidebar.jsx
import styles from './Sidebar.module.css';

/**
 * Left sidebar showing past chat sessions.
 *
 * @param {{
 *   user: object,
 *   sessions: Array,
 *   activeSessionId: string,
 *   isLoading: boolean,
 *   onNewChat: () => void,
 *   onSelectSession: (id: string) => void,
 *   onBack: () => void,
 *   isOpen: boolean,
 *   onClose: () => void,
 * }} props
 */
function Sidebar({
  user, sessions, activeSessionId, isLoading,
  onNewChat, onSelectSession, onDeleteSession, onBack, isOpen, onClose,
}) {
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = now - date;
    const day  = 86400000;

    if (diff < day)      return 'Today';
    if (diff < 2 * day)  return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* User badge */}
        <div className={styles.userBadge}>
          <div className={styles.userAvatar}>☽</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userSign}>{user?.sunSign?.split(' ')[0]}</span>
          </div>
        </div>

        {/* New Chat button */}
        <button className={styles.newChatBtn} onClick={onNewChat} disabled={isLoading}>
          <span>＋</span> New Chat
        </button>

        {/* Sessions list */}
        <div className={styles.sessionList}>
          <p className={styles.sectionLabel}>Past Chats</p>

          {isLoading && sessions.length === 0 && (
            <p className={styles.emptyMsg}>Loading…</p>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className={styles.emptyMsg}>No past chats yet.</p>
          )}

          {sessions.map((s) => (
            <div key={s._id} className={styles.sessionRow}>
              <button
                className={`${styles.sessionItem} ${s._id === activeSessionId ? styles.active : ''}`}
                onClick={() => { onSelectSession(s._id); onClose(); }}
              >
                <span className={styles.sessionDate}>{formatDate(s.createdAt)}</span>
                <span className={styles.sessionPreview}>{s.preview}</span>
                <span className={styles.sessionCount}>{s.messageCount} msgs</span>
              </button>
              <button
                className={styles.deleteBtn}
                title="Delete chat"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s._id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <button className={styles.backBtn} onClick={onBack}>
          ← Landing Page
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
