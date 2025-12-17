import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './TarotCard.css';

const positionColors = {
  past: { primary: 'var(--color-past)', subtle: 'var(--color-past-subtle)' },
  present: { primary: 'var(--color-present)', subtle: 'var(--color-present-subtle)' },
  future: { primary: 'var(--color-future)', subtle: 'var(--color-future-subtle)' }
};

const positionLabels = {
  past: 'Past',
  present: 'Present',
  future: 'Future'
};

const positionSymbols = {
  past: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 8,14" />
    </svg>
  ),
  present: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  future: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
};

export default function TarotCard({ card, position, delay = 0, onReveal }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const colors = positionColors[position];

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => {
        setIsRevealed(true);
        onReveal?.();
      }, 300);
    }
  };

  // Auto-flip after delay
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
        setTimeout(() => {
          setIsRevealed(true);
          onReveal?.();
        }, 300);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, onReveal]);

  const rotation = position === 'past' ? -5 : position === 'future' ? 5 : 0;

  return (
    <motion.div
      className="tarot-card-wrapper"
      initial={{ opacity: 0, y: -30, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ delay: delay / 1000, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      style={{ '--card-accent': colors.primary, '--card-accent-subtle': colors.subtle }}
    >
      <motion.div
        className={`tarot-card ${isFlipped ? 'tarot-card--flipped' : ''}`}
        onClick={handleFlip}
        whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-card-hover)' }}
        transition={{ duration: 0.12 }}
        style={{ perspective: '1000px' }}
      >
        <div className="tarot-card__inner">
          {/* Card Back */}
          <div className="tarot-card__face tarot-card__back">
            <div className="tarot-card__back-pattern">
              <div className="tarot-card__back-border">
                <div className="tarot-card__back-inner">
                  <div className="tarot-card__mystical-symbol">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M50 15 L50 85" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M15 50 L85 50" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M26 26 L74 74" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M74 26 L26 74" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <span className="tarot-card__click-hint">Click to reveal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Front */}
          <div className="tarot-card__face tarot-card__front">
            <div className="tarot-card__position-badge">
              {positionLabels[position]}
            </div>

            <div className="tarot-card__symbol">
              {positionSymbols[position]}
            </div>

            <motion.div
              className="tarot-card__content"
              initial={{ opacity: 0 }}
              animate={isRevealed ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
            >
              <h3 className="tarot-card__name">{card.name}</h3>
              <p className="tarot-card__meaning">{card.meaning}</p>
            </motion.div>

            <div className="tarot-card__accent-bar" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
