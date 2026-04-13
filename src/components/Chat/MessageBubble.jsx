// File: src/components/Chat/MessageBubble.jsx
import styles from './MessageBubble.module.css';

/**
 * Renders a single chat message bubble.
 *
 * @param {{ message: { role: string, content: string, timestamp: Date } }} props
 */
function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  // Format HH:MM
  const timeLabel = message.timestamp
    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : styles.aiWrapper}`}>
      {/* Avatar */}
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          🔮
        </div>
      )}

      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
        {/* Role label */}
        <span className={styles.roleLabel}>
          {isUser ? 'You' : 'Jyotish Guruji'}
        </span>

        {/* Message text — split on newlines to preserve paragraph breaks */}
        <p className={styles.text}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>

        <time className={styles.timestamp} dateTime={message.timestamp?.toISOString()}>
          {timeLabel}
        </time>
      </div>

      {/* User avatar on the right */}
      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden="true">
          ☽
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
