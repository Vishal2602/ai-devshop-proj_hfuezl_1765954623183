import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ExportButton.css';

export default function ExportButton({ onExport, disabled }) {
  const [state, setState] = useState('idle'); // idle, loading, success

  const handleClick = async () => {
    if (state !== 'idle' || disabled) return;

    setState('loading');
    try {
      await onExport();
      setState('success');
      setTimeout(() => setState('idle'), 2500);
    } catch (error) {
      console.error('Export failed:', error);
      setState('idle');
    }
  };

  return (
    <motion.button
      className={`export-button export-button--${state}`}
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      whileHover={state === 'idle' ? { scale: 1.02 } : {}}
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.span
            key="idle"
            className="export-button__content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="export-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Your Reading
          </motion.span>
        )}

        {state === 'loading' && (
          <motion.span
            key="loading"
            className="export-button__content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="export-button__spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            Generating PDF...
          </motion.span>
        )}

        {state === 'success' && (
          <motion.span
            key="success"
            className="export-button__content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="export-button__icon export-button__icon--success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Downloaded!
          </motion.span>
        )}
      </AnimatePresence>

      {/* Success confetti */}
      <AnimatePresence>
        {state === 'success' && (
          <div className="export-button__confetti">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="export-button__confetti-piece"
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: [0, 1, 1],
                  x: Math.cos(i * 30 * Math.PI / 180) * (60 + Math.random() * 30),
                  y: [0, -(40 + Math.random() * 30), 60],
                  rotate: Math.random() * 720 - 360
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  background: ['var(--color-gold)', 'var(--color-rose)', 'var(--color-sage)', 'var(--color-ocean)', 'var(--color-primary)'][i % 5]
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
