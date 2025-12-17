/**
 * useFileUpload - Hook for PDF file upload management
 *
 * Handles the complete upload lifecycle:
 * - File validation (type, size, magic bytes)
 * - Drag/drop state management
 * - Upload progress tracking
 * - Error handling with user-friendly messages
 *
 * Designed to integrate with react-dropzone and the DropZone component.
 */

import { useState, useCallback, useRef } from 'react';
import { trackUpload } from '../utils/storage';

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB as per tech lead decision
const ACCEPTED_MIME_TYPES = ['application/pdf'];
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

/**
 * Upload states for UI rendering
 */
export const UPLOAD_STATES = {
  IDLE: 'idle',
  DRAGGING: 'dragging',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Error types for specific handling
 */
export const UPLOAD_ERRORS = {
  INVALID_TYPE: 'invalid_type',
  FILE_TOO_LARGE: 'file_too_large',
  INVALID_PDF: 'invalid_pdf',
  MULTIPLE_FILES: 'multiple_files',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  UNKNOWN: 'unknown',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [UPLOAD_ERRORS.INVALID_TYPE]: 'Please upload a PDF file',
  [UPLOAD_ERRORS.FILE_TOO_LARGE]: 'File is too large. Maximum size is 10MB',
  [UPLOAD_ERRORS.INVALID_PDF]: 'This file appears to be corrupted or not a valid PDF',
  [UPLOAD_ERRORS.MULTIPLE_FILES]: 'Please upload only one file at a time',
  [UPLOAD_ERRORS.NETWORK_ERROR]: 'Network error. Please check your connection and try again',
  [UPLOAD_ERRORS.SERVER_ERROR]: 'Server error. Please try again later',
  [UPLOAD_ERRORS.UNKNOWN]: 'An unexpected error occurred. Please try again',
};

/**
 * Check PDF magic bytes to verify file is actually a PDF
 * Some browsers allow file extension spoofing
 *
 * @param {File} file - File to check
 * @returns {Promise<boolean>} - True if valid PDF
 */
async function verifyPdfMagicBytes(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);
      const isPdf = PDF_MAGIC_BYTES.every((byte, i) => arr[i] === byte);
      resolve(isPdf);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

/**
 * Validate a file before upload
 *
 * @param {File} file - File to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateFile(file) {
  // Check MIME type
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: UPLOAD_ERRORS.INVALID_TYPE };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE };
  }

  // Verify magic bytes (paranoid but necessary)
  const isValidPdf = await verifyPdfMagicBytes(file);
  if (!isValidPdf) {
    return { valid: false, error: UPLOAD_ERRORS.INVALID_PDF };
  }

  return { valid: true };
}

/**
 * Format file size for display
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * useFileUpload hook
 *
 * @param {Object} options - Hook options
 * @param {Function} options.onUploadComplete - Callback when file is ready for analysis
 * @param {Function} options.onError - Optional error callback
 * @returns {Object} - Upload state and handlers
 */
export function useFileUpload({ onUploadComplete, onError } = {}) {
  // State
  const [state, setState] = useState(UPLOAD_STATES.IDLE);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Ref to prevent duplicate uploads
  const uploadInProgressRef = useRef(false);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState(UPLOAD_STATES.IDLE);
    setFile(null);
    setError(null);
    setProgress(0);
    uploadInProgressRef.current = false;
  }, []);

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback(() => {
    if (state === UPLOAD_STATES.IDLE || state === UPLOAD_STATES.ERROR) {
      setState(UPLOAD_STATES.DRAGGING);
    }
  }, [state]);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    if (state === UPLOAD_STATES.DRAGGING) {
      setState(UPLOAD_STATES.IDLE);
    }
  }, [state]);

  /**
   * Set error state with message
   */
  const setErrorState = useCallback(
    (errorType) => {
      const errorMessage = ERROR_MESSAGES[errorType] || ERROR_MESSAGES[UPLOAD_ERRORS.UNKNOWN];
      setError({ type: errorType, message: errorMessage });
      setState(UPLOAD_STATES.ERROR);
      onError?.({ type: errorType, message: errorMessage });
    },
    [onError]
  );

  /**
   * Process dropped/selected files
   * This is the main entry point for file handling
   *
   * @param {File[]} acceptedFiles - Files from dropzone
   * @param {Object[]} rejectedFiles - Rejected files from dropzone
   */
  const processFiles = useCallback(
    async (acceptedFiles, rejectedFiles = []) => {
      // Prevent duplicate processing
      if (uploadInProgressRef.current) {
        return;
      }

      // Reset previous state
      setError(null);
      setProgress(0);

      // Handle rejection from dropzone (type mismatch)
      if (rejectedFiles.length > 0) {
        setErrorState(UPLOAD_ERRORS.INVALID_TYPE);
        return;
      }

      // Check for multiple files
      if (acceptedFiles.length > 1) {
        setErrorState(UPLOAD_ERRORS.MULTIPLE_FILES);
        return;
      }

      // Check for no files
      if (acceptedFiles.length === 0) {
        return;
      }

      const selectedFile = acceptedFiles[0];
      uploadInProgressRef.current = true;
      setState(UPLOAD_STATES.VALIDATING);

      try {
        // Validate the file
        const validation = await validateFile(selectedFile);

        if (!validation.valid) {
          setErrorState(validation.error);
          uploadInProgressRef.current = false;
          return;
        }

        // File is valid - store it
        setFile(selectedFile);
        setState(UPLOAD_STATES.SUCCESS);

        // Track upload for stats
        trackUpload({
          fileSize: selectedFile.size,
          pageCount: 0, // Will be updated after analysis
        });

        // Notify parent
        onUploadComplete?.(selectedFile);
      } catch (err) {
        console.error('[useFileUpload] Validation error:', err);
        setErrorState(UPLOAD_ERRORS.UNKNOWN);
      } finally {
        uploadInProgressRef.current = false;
      }
    },
    [onUploadComplete, setErrorState]
  );

  /**
   * Update progress during upload (for API calls)
   * Can be passed to axios/fetch progress handlers
   *
   * @param {number} percent - Progress percentage (0-100)
   */
  const updateProgress = useCallback((percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    setProgress(clamped);
  }, []);

  /**
   * Set uploading state (when sending to API)
   */
  const setUploading = useCallback(() => {
    setState(UPLOAD_STATES.UPLOADING);
  }, []);

  /**
   * Handle successful upload/analysis
   */
  const setSuccess = useCallback(() => {
    setState(UPLOAD_STATES.SUCCESS);
    setProgress(100);
  }, []);

  /**
   * Handle network/server errors
   *
   * @param {Error} err - Error object
   */
  const handleApiError = useCallback(
    (err) => {
      if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        setErrorState(UPLOAD_ERRORS.NETWORK_ERROR);
      } else if (err.response?.status >= 500) {
        setErrorState(UPLOAD_ERRORS.SERVER_ERROR);
      } else {
        setErrorState(UPLOAD_ERRORS.UNKNOWN);
      }
    },
    [setErrorState]
  );

  /**
   * Get accept config for react-dropzone
   */
  const dropzoneAccept = {
    'application/pdf': ['.pdf'],
  };

  /**
   * Check if upload is in a loading state
   */
  const isLoading = state === UPLOAD_STATES.VALIDATING || state === UPLOAD_STATES.UPLOADING;

  /**
   * Check if ready for next action
   */
  const isReady = state === UPLOAD_STATES.SUCCESS && file !== null;

  /**
   * Get state for UI rendering
   */
  const isDragging = state === UPLOAD_STATES.DRAGGING;
  const hasError = state === UPLOAD_STATES.ERROR;

  return {
    // State
    state,
    file,
    error,
    progress,

    // Derived state
    isLoading,
    isReady,
    isDragging,
    hasError,

    // Handlers
    processFiles,
    handleDragEnter,
    handleDragLeave,
    updateProgress,
    setUploading,
    setSuccess,
    handleApiError,
    reset,

    // Config
    dropzoneAccept,
    maxFileSize: MAX_FILE_SIZE,

    // Utilities
    formatFileSize,
  };
}

export default useFileUpload;
