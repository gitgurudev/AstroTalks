// File: src/components/Chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';

/**
 * Controlled textarea input for composing messages.
 * - Auto-grows with content (up to a max height).
 * - Submit on Enter (Shift+Enter for newline).
 * - Disabled while AI is loading.
 *
 * @param {{ onSend: (text: string) => void, isLoading: boolean }} props
 */
function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  function handleKeyDown(e) {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the stars…"
          disabled={isLoading}
          rows={1}
          aria-label="Message input"
        />

        <button
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <span className={styles.sendIcon} aria-hidden="true">▲</span>
          )}
        </button>
      </div>

      <p className={styles.hint}>Enter to send · Shift + Enter for new line</p>
    </div>
  );
}

export default ChatInput;
