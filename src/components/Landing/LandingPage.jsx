// File: src/components/Landing/LandingPage.jsx
import styles from './LandingPage.module.css';

/**
 * Hero landing page.
 * Displays the app name, tagline, and a CTA button.
 *
 * @param {{ onStartChat: () => void }} props
 */
function LandingPage({ onStartChat }) {
  return (
    <main className={styles.page}>
      {/* Decorative star field */}
      <div className={styles.stars} aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className={styles.star} />
        ))}
      </div>

      <div className={styles.content}>
        {/* Glyph accent */}
        <div className={styles.glyph} aria-hidden="true">✦ ☽ ✦</div>

        <h1 className={styles.title}>AstroTalks</h1>

        <p className={styles.tagline}>
          Whisper your questions to the cosmos.<br />
          Receive ancient wisdom, one star at a time.
        </p>

        <p className={styles.subtext}>
          Powered by Vedic Jyotish · Guided by the Navagrahas
        </p>

        <button
          className={styles.ctaButton}
          onClick={onStartChat}
          aria-label="Open the astrology chat"
        >
          <span className={styles.ctaIcon}>🔮</span>
          Start Chat
        </button>

        <p className={styles.disclaimer}>
          For spiritual guidance only. Not a substitute for professional advice.
        </p>
      </div>
    </main>
  );
}

export default LandingPage;
