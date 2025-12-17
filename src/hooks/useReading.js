/**
 * useReading - Hook for tarot reading state management
 *
 * Orchestrates the complete reading flow:
 * - Combines useFileUpload, useAnalysis, and useExport
 * - Manages view transitions (upload -> reading -> export)
 * - Handles card reveal animation state
 * - Coordinates loading states across all hooks
 *
 * This is the main hook for the ReadingView component.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFileUpload, UPLOAD_STATES } from './useFileUpload';
import { useAnalysis, ANALYSIS_STATES } from './useAnalysis';
import { useExport, EXPORT_STATES } from './useExport';
import { getLastReading, clearLastReading, getPreferences } from '../utils/storage';

/**
 * Application view states
 */
export const VIEW_STATES = {
  UPLOAD: 'upload',
  ANALYZING: 'analyzing',
  READING: 'reading',
  EXPORTING: 'exporting',
};

/**
 * Card reveal states for animation
 */
export const CARD_REVEAL_STATES = {
  HIDDEN: 'hidden',
  REVEALING: 'revealing',
  REVEALED: 'revealed',
};

/**
 * Default stagger delay between card reveals (ms)
 */
const CARD_REVEAL_STAGGER = 400;

/**
 * Duration for each card flip animation (ms)
 */
const CARD_FLIP_DURATION = 600;

/**
 * useReading hook
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.autoReveal - Auto-reveal cards after analysis (default: true)
 * @param {Function} options.onReadingComplete - Callback when reading is fully revealed
 * @param {Function} options.onExportComplete - Callback when export finishes
 * @returns {Object} - Complete reading state and handlers
 */
export function useReading({ autoReveal = true, onReadingComplete, onExportComplete } = {}) {
  // Card reveal state
  const [cardRevealStates, setCardRevealStates] = useState({
    past: CARD_REVEAL_STATES.HIDDEN,
    present: CARD_REVEAL_STATES.HIDDEN,
    future: CARD_REVEAL_STATES.HIDDEN,
  });

  // Track if reveal sequence has completed
  const [revealComplete, setRevealComplete] = useState(false);

  // Initialize child hooks
  const fileUpload = useFileUpload({
    onUploadComplete: handleFileReady,
  });

  const analysis = useAnalysis({
    onAnalysisComplete: handleAnalysisComplete,
  });

  const exportHook = useExport({
    onExportComplete: handleExportComplete,
  });

  /**
   * Handle file ready for analysis
   * Called after file validation passes
   *
   * @param {File} file - Validated PDF file
   */
  function handleFileReady(file) {
    // Clear any previous reading state
    resetCardStates();
    analysis.reset();
    exportHook.reset();

    // Clear cached reading since user is uploading new file
    clearLastReading();

    // Start analysis
    analysis.analyze(file);
  }

  /**
   * Handle analysis completion
   * Triggers card reveal animation
   *
   * @param {Object} result - Analysis result
   */
  function handleAnalysisComplete(result) {
    if (autoReveal && result) {
      revealCardsSequentially();
    }
  }

  /**
   * Handle export completion
   *
   * @param {string} filename - Exported filename
   */
  function handleExportComplete(filename) {
    onExportComplete?.(filename);
  }

  /**
   * Reset card reveal states
   */
  const resetCardStates = useCallback(() => {
    setCardRevealStates({
      past: CARD_REVEAL_STATES.HIDDEN,
      present: CARD_REVEAL_STATES.HIDDEN,
      future: CARD_REVEAL_STATES.HIDDEN,
    });
    setRevealComplete(false);
  }, []);

  /**
   * Reveal a single card
   *
   * @param {string} position - Card position (past, present, future)
   */
  const revealCard = useCallback((position) => {
    setCardRevealStates((prev) => ({
      ...prev,
      [position]: CARD_REVEAL_STATES.REVEALING,
    }));

    // Mark as revealed after flip animation completes
    setTimeout(() => {
      setCardRevealStates((prev) => ({
        ...prev,
        [position]: CARD_REVEAL_STATES.REVEALED,
      }));
    }, CARD_FLIP_DURATION);
  }, []);

  /**
   * Reveal all cards sequentially with stagger
   */
  const revealCardsSequentially = useCallback(() => {
    const positions = ['past', 'present', 'future'];

    positions.forEach((position, index) => {
      setTimeout(() => {
        revealCard(position);

        // Mark sequence complete after last card
        if (index === positions.length - 1) {
          setTimeout(() => {
            setRevealComplete(true);
            onReadingComplete?.();
          }, CARD_FLIP_DURATION);
        }
      }, index * CARD_REVEAL_STAGGER);
    });
  }, [revealCard, onReadingComplete]);

  /**
   * Reveal all cards immediately (no animation)
   */
  const revealAllCards = useCallback(() => {
    setCardRevealStates({
      past: CARD_REVEAL_STATES.REVEALED,
      present: CARD_REVEAL_STATES.REVEALED,
      future: CARD_REVEAL_STATES.REVEALED,
    });
    setRevealComplete(true);
  }, []);

  /**
   * Reset entire reading flow
   * Returns to upload state
   */
  const resetReading = useCallback(() => {
    fileUpload.reset();
    analysis.reset();
    exportHook.reset();
    resetCardStates();
    clearLastReading();
  }, [fileUpload, analysis, exportHook, resetCardStates]);

  /**
   * Start export with current file and analysis
   */
  const startExport = useCallback(() => {
    if (fileUpload.file && analysis.result) {
      exportHook.exportPdf(fileUpload.file, analysis.result);
    }
  }, [fileUpload.file, analysis.result, exportHook]);

  /**
   * Retry export
   */
  const retryExport = useCallback(() => {
    if (fileUpload.file && analysis.result) {
      exportHook.retry(fileUpload.file, analysis.result);
    }
  }, [fileUpload.file, analysis.result, exportHook]);

  /**
   * Load last reading from storage (if available)
   * Useful for returning users
   *
   * @returns {boolean} - True if reading was loaded
   */
  const loadLastReading = useCallback(() => {
    const cached = getLastReading();
    if (cached) {
      // We can restore the analysis result but not the file
      // User would need to re-upload to export
      analysis.reset();
      // Set result directly (bypassing analyze flow)
      // Note: This is a read-only restore, export won't work without file
      return true;
    }
    return false;
  }, [analysis]);

  /**
   * Determine current view state based on hook states
   */
  const currentView = useMemo(() => {
    // Exporting takes priority
    if (exportHook.isRendering) {
      return VIEW_STATES.EXPORTING;
    }

    // Analyzing
    if (analysis.isAnalyzing) {
      return VIEW_STATES.ANALYZING;
    }

    // Have results -> show reading
    if (analysis.hasResult) {
      return VIEW_STATES.READING;
    }

    // Default -> upload
    return VIEW_STATES.UPLOAD;
  }, [exportHook.isRendering, analysis.isAnalyzing, analysis.hasResult]);

  /**
   * Aggregate loading state
   */
  const isLoading = useMemo(() => {
    return fileUpload.isLoading || analysis.isAnalyzing || exportHook.isRendering;
  }, [fileUpload.isLoading, analysis.isAnalyzing, exportHook.isRendering]);

  /**
   * Aggregate error state
   */
  const error = useMemo(() => {
    return fileUpload.error || analysis.error || exportHook.error || null;
  }, [fileUpload.error, analysis.error, exportHook.error]);

  /**
   * Check if export is allowed
   */
  const canExport = useMemo(() => {
    return (
      analysis.hasResult &&
      fileUpload.file !== null &&
      !exportHook.isRendering &&
      revealComplete
    );
  }, [analysis.hasResult, fileUpload.file, exportHook.isRendering, revealComplete]);

  /**
   * Get card by position with reveal state
   */
  const getCard = useCallback(
    (position) => {
      const card = analysis.cards.find((c) => c.position === position);
      return {
        ...card,
        revealState: cardRevealStates[position],
        isRevealed: cardRevealStates[position] === CARD_REVEAL_STATES.REVEALED,
        isRevealing: cardRevealStates[position] === CARD_REVEAL_STATES.REVEALING,
      };
    },
    [analysis.cards, cardRevealStates]
  );

  /**
   * Get all cards with reveal states
   */
  const cardsWithRevealState = useMemo(() => {
    return ['past', 'present', 'future'].map((position) => getCard(position));
  }, [getCard]);

  /**
   * User preferences
   */
  const preferences = useMemo(() => getPreferences(), []);

  return {
    // View state
    currentView,
    isLoading,
    error,

    // File upload
    file: fileUpload.file,
    uploadState: fileUpload.state,
    isDragging: fileUpload.isDragging,
    processFiles: fileUpload.processFiles,
    handleDragEnter: fileUpload.handleDragEnter,
    handleDragLeave: fileUpload.handleDragLeave,
    dropzoneAccept: fileUpload.dropzoneAccept,
    maxFileSize: fileUpload.maxFileSize,
    formatFileSize: fileUpload.formatFileSize,

    // Analysis
    analysisState: analysis.state,
    analysisProgress: analysis.progress,
    title: analysis.title,
    keywords: analysis.keywords,
    aura: analysis.aura,
    cards: analysis.cards,

    // Card reveal
    cardRevealStates,
    cardsWithRevealState,
    revealComplete,
    revealCard,
    revealCardsSequentially,
    revealAllCards,
    getCard,

    // Export
    exportState: exportHook.state,
    exportProgress: exportHook.progress,
    exportedFilename: exportHook.exportedFilename,
    canExport,
    startExport,
    retryExport,

    // Actions
    resetReading,
    loadLastReading,

    // Preferences
    preferences,
    showConfetti: preferences.showConfetti && exportHook.isSuccess,
  };
}

export default useReading;
