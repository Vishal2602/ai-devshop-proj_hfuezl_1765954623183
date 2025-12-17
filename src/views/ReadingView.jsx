/**
 * ReadingView - Displays the tarot reading results
 *
 * Shows:
 * - Three tarot cards with flip animations
 * - Document aura badge
 * - Export button with loading state
 * - Success celebration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TarotCard from '../components/TarotCard';
import AuraBadge from '../components/AuraBadge';
import ExportButton from '../components/ExportButton';
import Confetti from '../components/Confetti';
import PreviewStrip from '../components/PreviewStrip';
import { pageTransition, staggerContainer, badgeBounce } from '../lib/animations';
import './ReadingView.css';

export default function ReadingView({ result, filename, file, onExport, onStartOver, exportState }) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Handle successful export
  const handleExportComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Get cards by position for consistent ordering
  const getCard = (position) => result?.cards?.find(c => c.position === position) || null;
  const pastCard = getCard('past');
  const presentCard = getCard('present');
  const futureCard = getCard('future');

  return (
    <motion.div
      className="reading-view"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {/* Document info */}
      <div className="reading-view__header">
        <motion.h2
          className="reading-view__title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          The Reading for <span className="reading-view__filename">{filename || 'your document'}</span>
        </motion.h2>

        {/* Aura Badge */}
        {result?.aura && (
          <motion.div
            initial={badgeBounce.initial}
            animate={badgeBounce.animate}
            transition={{ delay: 0.3 }}
          >
            <AuraBadge aura={result.aura} />
          </motion.div>
        )}
      </div>

      {/* Tarot Cards */}
      <motion.div
        className="reading-view__cards"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {pastCard && (
          <TarotCard
            card={pastCard}
            position="past"
            delay={200}
          />
        )}
        {presentCard && (
          <TarotCard
            card={presentCard}
            position="present"
            delay={400}
          />
        )}
        {futureCard && (
          <TarotCard
            card={futureCard}
            position="future"
            delay={600}
          />
        )}
      </motion.div>

      {/* Keywords */}
      {result?.keywords?.length > 0 && (
        <motion.div
          className="reading-view__keywords"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="reading-view__keywords-label">Key themes:</span>
          {result.keywords.slice(0, 5).map((keyword, index) => (
            <span key={index} className="reading-view__keyword">{keyword}</span>
          ))}
        </motion.div>
      )}

      {/* Certification badge */}
      {result?.certification && (
        <motion.div
          className="reading-view__certification"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 1, type: 'spring', stiffness: 300 }}
        >
          <span className="reading-view__stamp">{result.certification}</span>
        </motion.div>
      )}

      {/* PDF Preview Thumbnails */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <PreviewStrip file={file} className="reading-view__preview" />
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="reading-view__actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <ExportButton
          onExport={onExport}
          disabled={exportState?.isRendering}
        />

        <button
          className="reading-view__start-over"
          onClick={onStartOver}
        >
          Read Another Document
        </button>
      </motion.div>

      {/* Export error */}
      <AnimatePresence>
        {exportState?.hasError && (
          <motion.p
            className="reading-view__error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {exportState.error?.message || 'Export failed'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Confetti celebration */}
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
    </motion.div>
  );
}
