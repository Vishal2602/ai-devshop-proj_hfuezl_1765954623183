/**
 * Custom hooks for PDF Tarot Reader
 *
 * These hooks provide the complete state management layer for the application.
 * They integrate with the storage utility and API endpoints.
 *
 * Hook hierarchy:
 * - useReading (orchestrator) -> useFileUpload, useAnalysis, useExport
 *
 * Usage:
 * - Use `useReading` in App.jsx for complete flow management
 * - Use individual hooks when you need isolated functionality
 */

// Main orchestrator hook - use this for complete reading flow
export { useReading, VIEW_STATES, CARD_REVEAL_STATES } from './useReading';

// Individual feature hooks
export { useFileUpload, UPLOAD_STATES, UPLOAD_ERRORS, formatFileSize } from './useFileUpload';
export { useAnalysis, ANALYSIS_STATES, ANALYSIS_ERRORS } from './useAnalysis';
export { useExport, EXPORT_STATES, EXPORT_ERRORS } from './useExport';
