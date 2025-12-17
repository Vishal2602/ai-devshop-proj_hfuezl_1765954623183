/**
 * useAnalysis - Hook for tarot analysis API interaction
 *
 * Handles the analysis flow:
 * - Sending PDF to /api/analyze endpoint
 * - Managing loading/error states
 * - Caching results in localStorage
 * - Retry logic for transient failures
 *
 * Integrates with useFileUpload and useReading hooks.
 */

import { useState, useCallback, useRef } from 'react';
import { saveLastReading, addToHistory } from '../utils/storage';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ANALYZE_ENDPOINT = `${API_BASE_URL}/analyze`;

// Timeout configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds - PDFs can take time to process
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Analysis states for UI rendering
 */
export const ANALYSIS_STATES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Error types for specific handling
 */
export const ANALYSIS_ERRORS = {
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  SERVER: 'server',
  INVALID_RESPONSE: 'invalid_response',
  PDF_UNREADABLE: 'pdf_unreadable',
  UNKNOWN: 'unknown',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ANALYSIS_ERRORS.TIMEOUT]: 'Analysis took too long. Please try a smaller document',
  [ANALYSIS_ERRORS.NETWORK]: 'Unable to connect. Please check your internet connection',
  [ANALYSIS_ERRORS.SERVER]: 'The oracle is temporarily unavailable. Please try again',
  [ANALYSIS_ERRORS.INVALID_RESPONSE]: 'Received an unexpected response. Please try again',
  [ANALYSIS_ERRORS.PDF_UNREADABLE]:
    'This document appears to be unreadable (scanned image or encrypted)',
  [ANALYSIS_ERRORS.UNKNOWN]: 'An unexpected error occurred. Please try again',
};

/**
 * Validate the analysis response structure
 * Defensive check to ensure API returned expected shape
 *
 * @param {Object} response - API response
 * @returns {boolean} - True if valid
 */
function validateAnalysisResponse(response) {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Required fields
  if (!response.title || typeof response.title !== 'string') {
    return false;
  }

  if (!response.aura || typeof response.aura !== 'string') {
    return false;
  }

  if (!Array.isArray(response.cards) || response.cards.length !== 3) {
    return false;
  }

  // Validate each card
  const validPositions = ['past', 'present', 'future'];
  for (const card of response.cards) {
    if (
      !card.position ||
      !validPositions.includes(card.position) ||
      !card.name ||
      !card.meaning
    ) {
      return false;
    }
  }

  // Keywords should be array (can be empty)
  if (!Array.isArray(response.keywords)) {
    return false;
  }

  return true;
}

/**
 * Create a timeout promise for request cancellation
 *
 * @param {number} ms - Timeout in milliseconds
 * @param {AbortController} controller - Controller to abort
 * @returns {Promise}
 */
function createTimeoutPromise(ms, controller) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('Request timeout'));
    }, ms);
  });
}

/**
 * Sleep utility for retry delay
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * useAnalysis hook
 *
 * @param {Object} options - Hook options
 * @param {Function} options.onAnalysisComplete - Callback when analysis succeeds
 * @param {Function} options.onError - Optional error callback
 * @param {boolean} options.saveToStorage - Whether to cache result (default: true)
 * @returns {Object} - Analysis state and handlers
 */
export function useAnalysis({ onAnalysisComplete, onError, saveToStorage = true } = {}) {
  // State
  const [state, setState] = useState(ANALYSIS_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Ref to track current request and prevent race conditions
  const currentRequestRef = useRef(null);
  const retryCountRef = useRef(0);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    // Abort any pending request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    setState(ANALYSIS_STATES.IDLE);
    setResult(null);
    setError(null);
    setProgress(0);
    retryCountRef.current = 0;
  }, []);

  /**
   * Set error state with message
   *
   * @param {string} errorType - Error type from ANALYSIS_ERRORS
   * @param {string} customMessage - Optional custom message
   */
  const setErrorState = useCallback(
    (errorType, customMessage = null) => {
      const errorMessage = customMessage || ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unknown;
      const errorObj = { type: errorType, message: errorMessage };
      setError(errorObj);
      setState(ANALYSIS_STATES.ERROR);
      onError?.(errorObj);
    },
    [onError]
  );

  /**
   * Analyze a PDF file
   * Main entry point for analysis flow
   *
   * @param {File} file - PDF file to analyze
   * @returns {Promise<Object|null>} - Analysis result or null on error
   */
  const analyze = useCallback(
    async (file) => {
      if (!file) {
        console.error('[useAnalysis] No file provided');
        return null;
      }

      // Reset state for new analysis
      setError(null);
      setResult(null);
      setProgress(0);
      retryCountRef.current = 0;
      setState(ANALYSIS_STATES.ANALYZING);

      // Create abort controller for this request
      const controller = new AbortController();
      currentRequestRef.current = controller;

      const attemptAnalysis = async () => {
        // Build form data
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress (we don't have real upload progress with fetch)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            // Slow down as we approach 90% (wait for actual response)
            const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
            return Math.min(prev + increment, 90);
          });
        }, 200);

        try {
          // Race between fetch and timeout
          const response = await Promise.race([
            fetch(ANALYZE_ENDPOINT, {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            }),
            createTimeoutPromise(REQUEST_TIMEOUT, controller),
          ]);

          clearInterval(progressInterval);

          // Check response status
          if (!response.ok) {
            if (response.status === 422 || response.status === 400) {
              // Unreadable PDF or validation error
              const errorData = await response.json().catch(() => ({}));
              throw {
                type: ANALYSIS_ERRORS.PDF_UNREADABLE,
                message: errorData.message || ERROR_MESSAGES[ANALYSIS_ERRORS.PDF_UNREADABLE],
              };
            }

            if (response.status >= 500) {
              throw { type: ANALYSIS_ERRORS.SERVER };
            }

            throw { type: ANALYSIS_ERRORS.UNKNOWN };
          }

          // Parse response
          const data = await response.json();

          // Validate response structure
          if (!validateAnalysisResponse(data)) {
            console.error('[useAnalysis] Invalid response structure:', data);
            throw { type: ANALYSIS_ERRORS.INVALID_RESPONSE };
          }

          return data;
        } catch (err) {
          clearInterval(progressInterval);

          // Handle abort (timeout or manual cancel)
          if (err.name === 'AbortError' || err.message === 'Request timeout') {
            throw { type: ANALYSIS_ERRORS.TIMEOUT };
          }

          // Handle network errors
          if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
            throw { type: ANALYSIS_ERRORS.NETWORK };
          }

          // Re-throw typed errors
          if (err.type) {
            throw err;
          }

          // Unknown error
          console.error('[useAnalysis] Unexpected error:', err);
          throw { type: ANALYSIS_ERRORS.UNKNOWN };
        }
      };

      // Attempt with retries
      while (retryCountRef.current <= MAX_RETRIES) {
        try {
          const data = await attemptAnalysis();

          // Success!
          setProgress(100);
          setResult(data);
          setState(ANALYSIS_STATES.SUCCESS);

          // Save to localStorage for later re-export
          if (saveToStorage) {
            const readingWithFile = {
              ...data,
              filename: file.name,
            };
            saveLastReading(readingWithFile);
            addToHistory(readingWithFile);
          }

          onAnalysisComplete?.(data);
          return data;
        } catch (err) {
          // Don't retry certain errors
          if (
            err.type === ANALYSIS_ERRORS.PDF_UNREADABLE ||
            err.type === ANALYSIS_ERRORS.INVALID_RESPONSE
          ) {
            setErrorState(err.type, err.message);
            return null;
          }

          // Retry transient errors
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            console.log(`[useAnalysis] Retry ${retryCountRef.current}/${MAX_RETRIES}`);
            await sleep(RETRY_DELAY * retryCountRef.current); // Exponential backoff
            continue;
          }

          // Max retries reached
          setErrorState(err.type || ANALYSIS_ERRORS.UNKNOWN, err.message);
          return null;
        }
      }

      return null;
    },
    [onAnalysisComplete, onError, saveToStorage, setErrorState]
  );

  /**
   * Cancel ongoing analysis
   */
  const cancel = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    reset();
  }, [reset]);

  /**
   * Retry failed analysis with same file
   * Must be called from a context that has the file reference
   *
   * @param {File} file - PDF file to retry
   */
  const retry = useCallback(
    (file) => {
      if (state === ANALYSIS_STATES.ERROR) {
        retryCountRef.current = 0;
        analyze(file);
      }
    },
    [state, analyze]
  );

  // Derived state
  const isAnalyzing = state === ANALYSIS_STATES.ANALYZING;
  const isSuccess = state === ANALYSIS_STATES.SUCCESS;
  const hasError = state === ANALYSIS_STATES.ERROR;
  const hasResult = result !== null;

  return {
    // State
    state,
    result,
    error,
    progress,

    // Derived state
    isAnalyzing,
    isSuccess,
    hasError,
    hasResult,

    // Actions
    analyze,
    cancel,
    retry,
    reset,

    // Reading data shortcuts (when result exists)
    title: result?.title || null,
    keywords: result?.keywords || [],
    aura: result?.aura || null,
    cards: result?.cards || [],
  };
}

export default useAnalysis;
