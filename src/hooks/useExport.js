/**
 * useExport - Hook for PDF export/render flow
 *
 * Handles the export lifecycle:
 * - Sending PDF + analysis to /api/render endpoint
 * - Receiving merged PDF with tarot cover page
 * - Triggering browser download
 * - Managing loading/error states
 *
 * Integrates with useAnalysis hook for analysis data.
 */

import { useState, useCallback, useRef } from 'react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const RENDER_ENDPOINT = `${API_BASE_URL}/render`;

// Timeout configuration
const REQUEST_TIMEOUT = 60000; // 60 seconds - PDF rendering can take time
const MAX_RETRIES = 1;

/**
 * Export states for UI rendering
 */
export const EXPORT_STATES = {
  IDLE: 'idle',
  RENDERING: 'rendering',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Error types for specific handling
 */
export const EXPORT_ERRORS = {
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  SERVER: 'server',
  INVALID_RESPONSE: 'invalid_response',
  DOWNLOAD_FAILED: 'download_failed',
  MISSING_DATA: 'missing_data',
  UNKNOWN: 'unknown',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [EXPORT_ERRORS.TIMEOUT]: 'Export took too long. Please try again',
  [EXPORT_ERRORS.NETWORK]: 'Unable to connect. Please check your internet connection',
  [EXPORT_ERRORS.SERVER]: 'Server error during export. Please try again',
  [EXPORT_ERRORS.INVALID_RESPONSE]: 'Received invalid file. Please try again',
  [EXPORT_ERRORS.DOWNLOAD_FAILED]: 'Download failed. Please try again',
  [EXPORT_ERRORS.MISSING_DATA]: 'Missing analysis data. Please re-upload the document',
  [EXPORT_ERRORS.UNKNOWN]: 'An unexpected error occurred. Please try again',
};

/**
 * Generate filename for exported PDF
 * Uses original filename with "_tarot_reading" suffix
 *
 * @param {string} originalName - Original PDF filename
 * @returns {string} - New filename
 */
function generateExportFilename(originalName) {
  // Remove .pdf extension if present
  const baseName = originalName.replace(/\.pdf$/i, '');

  // Sanitize filename (remove special chars that could cause issues)
  const sanitized = baseName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();

  // Use a default if sanitization removed everything
  const finalName = sanitized || 'document';

  return `${finalName}_tarot_reading.pdf`;
}

/**
 * Trigger browser download for blob
 *
 * @param {Blob} blob - PDF blob to download
 * @param {string} filename - Filename for download
 * @returns {boolean} - Success status
 */
function triggerDownload(blob, filename) {
  try {
    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return true;
  } catch (err) {
    console.error('[useExport] Download trigger failed:', err);
    return false;
  }
}

/**
 * Validate that we have all required data for export
 *
 * @param {File} file - Original PDF file
 * @param {Object} analysis - Analysis result
 * @returns {{valid: boolean, error?: string}}
 */
function validateExportData(file, analysis) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!analysis) {
    return { valid: false, error: 'No analysis data' };
  }

  if (!analysis.cards || analysis.cards.length !== 3) {
    return { valid: false, error: 'Invalid card data' };
  }

  if (!analysis.aura) {
    return { valid: false, error: 'Missing aura data' };
  }

  return { valid: true };
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
 * useExport hook
 *
 * @param {Object} options - Hook options
 * @param {Function} options.onExportComplete - Callback when export succeeds
 * @param {Function} options.onError - Optional error callback
 * @returns {Object} - Export state and handlers
 */
export function useExport({ onExportComplete, onError } = {}) {
  // State
  const [state, setState] = useState(EXPORT_STATES.IDLE);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [exportedFilename, setExportedFilename] = useState(null);

  // Ref to track current request
  const currentRequestRef = useRef(null);
  const retryCountRef = useRef(0);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    setState(EXPORT_STATES.IDLE);
    setError(null);
    setProgress(0);
    setExportedFilename(null);
    retryCountRef.current = 0;
  }, []);

  /**
   * Set error state with message
   *
   * @param {string} errorType - Error type from EXPORT_ERRORS
   * @param {string} customMessage - Optional custom message
   */
  const setErrorState = useCallback(
    (errorType, customMessage = null) => {
      const errorMessage = customMessage || ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unknown;
      const errorObj = { type: errorType, message: errorMessage };
      setError(errorObj);
      setState(EXPORT_STATES.ERROR);
      onError?.(errorObj);
    },
    [onError]
  );

  /**
   * Export PDF with tarot reading cover page
   *
   * @param {File} file - Original PDF file
   * @param {Object} analysis - Analysis result from useAnalysis
   * @returns {Promise<boolean>} - Success status
   */
  const exportPdf = useCallback(
    async (file, analysis) => {
      // Validate inputs
      const validation = validateExportData(file, analysis);
      if (!validation.valid) {
        setErrorState(EXPORT_ERRORS.MISSING_DATA, validation.error);
        return false;
      }

      // Reset state for new export
      setError(null);
      setProgress(0);
      setExportedFilename(null);
      retryCountRef.current = 0;
      setState(EXPORT_STATES.RENDERING);

      // Create abort controller
      const controller = new AbortController();
      currentRequestRef.current = controller;

      // Generate filename
      const filename = generateExportFilename(file.name);

      const attemptExport = async () => {
        // Build form data with file and analysis JSON
        const formData = new FormData();
        formData.append('file', file);
        formData.append('analysis', JSON.stringify(analysis));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const increment = prev < 50 ? 8 : prev < 80 ? 3 : 1;
            return Math.min(prev + increment, 90);
          });
        }, 150);

        try {
          // Race between fetch and timeout
          const response = await Promise.race([
            fetch(RENDER_ENDPOINT, {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            }),
            createTimeoutPromise(REQUEST_TIMEOUT, controller),
          ]);

          clearInterval(progressInterval);

          // Check response status
          if (!response.ok) {
            if (response.status >= 500) {
              throw { type: EXPORT_ERRORS.SERVER };
            }
            throw { type: EXPORT_ERRORS.UNKNOWN };
          }

          // Verify content type
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/pdf')) {
            console.error('[useExport] Unexpected content type:', contentType);
            throw { type: EXPORT_ERRORS.INVALID_RESPONSE };
          }

          // Get blob
          const blob = await response.blob();

          // Validate blob
          if (blob.size === 0) {
            throw { type: EXPORT_ERRORS.INVALID_RESPONSE };
          }

          return blob;
        } catch (err) {
          clearInterval(progressInterval);

          // Handle abort
          if (err.name === 'AbortError' || err.message === 'Request timeout') {
            throw { type: EXPORT_ERRORS.TIMEOUT };
          }

          // Handle network errors
          if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
            throw { type: EXPORT_ERRORS.NETWORK };
          }

          // Re-throw typed errors
          if (err.type) {
            throw err;
          }

          throw { type: EXPORT_ERRORS.UNKNOWN };
        }
      };

      // Attempt with retry
      while (retryCountRef.current <= MAX_RETRIES) {
        try {
          const blob = await attemptExport();

          // Trigger download
          const downloadSuccess = triggerDownload(blob, filename);

          if (!downloadSuccess) {
            throw { type: EXPORT_ERRORS.DOWNLOAD_FAILED };
          }

          // Success!
          setProgress(100);
          setExportedFilename(filename);
          setState(EXPORT_STATES.SUCCESS);

          onExportComplete?.(filename);
          return true;
        } catch (err) {
          // Retry transient errors once
          if (retryCountRef.current < MAX_RETRIES && err.type !== EXPORT_ERRORS.MISSING_DATA) {
            retryCountRef.current++;
            console.log(`[useExport] Retry ${retryCountRef.current}/${MAX_RETRIES}`);
            continue;
          }

          setErrorState(err.type || EXPORT_ERRORS.UNKNOWN, err.message);
          return false;
        }
      }

      return false;
    },
    [onExportComplete, setErrorState]
  );

  /**
   * Cancel ongoing export
   */
  const cancel = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    reset();
  }, [reset]);

  /**
   * Retry failed export
   *
   * @param {File} file - Original PDF file
   * @param {Object} analysis - Analysis result
   */
  const retry = useCallback(
    (file, analysis) => {
      if (state === EXPORT_STATES.ERROR) {
        retryCountRef.current = 0;
        exportPdf(file, analysis);
      }
    },
    [state, exportPdf]
  );

  // Derived state
  const isRendering = state === EXPORT_STATES.RENDERING;
  const isSuccess = state === EXPORT_STATES.SUCCESS;
  const hasError = state === EXPORT_STATES.ERROR;

  return {
    // State
    state,
    error,
    progress,
    exportedFilename,

    // Derived state
    isRendering,
    isSuccess,
    hasError,

    // Actions
    exportPdf,
    cancel,
    retry,
    reset,

    // Utilities
    generateExportFilename,
  };
}

export default useExport;
