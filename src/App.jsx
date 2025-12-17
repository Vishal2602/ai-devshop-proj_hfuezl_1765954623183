/**
 * PDF Tarot Reader - Main Application Component
 *
 * Orchestrates the full user flow:
 * 1. Upload a PDF via DropZone
 * 2. Analyze and get a tarot reading
 * 3. View animated card reveal
 * 4. Export with tarot cover page
 */

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import UploadView from './views/UploadView';
import ReadingView from './views/ReadingView';
import { useFileUpload } from './hooks/useFileUpload';
import { useAnalysis } from './hooks/useAnalysis';
import { useExport } from './hooks/useExport';
import { clearLastReading } from './utils/storage';
import './styles/App.css';

/**
 * Application states for view transitions
 */
const APP_VIEWS = {
  UPLOAD: 'upload',
  ANALYZING: 'analyzing',
  READING: 'reading',
};

export default function App() {
  // Current view state
  const [currentView, setCurrentView] = useState(APP_VIEWS.UPLOAD);

  // File upload hook
  const fileUpload = useFileUpload({
    onUploadComplete: handleFileReady,
    onError: handleUploadError,
  });

  // Analysis hook
  const analysis = useAnalysis({
    onAnalysisComplete: handleAnalysisComplete,
    onError: handleAnalysisError,
  });

  // Export hook
  const exportPdf = useExport({
    onExportComplete: handleExportComplete,
    onError: handleExportError,
  });

  /**
   * Handle successful file validation
   * Automatically trigger analysis
   */
  function handleFileReady(file) {
    setCurrentView(APP_VIEWS.ANALYZING);
    analysis.analyze(file);
  }

  /**
   * Handle upload errors
   */
  function handleUploadError(error) {
    console.error('[App] Upload error:', error);
    // Stay on upload view, error shown by DropZone
  }

  /**
   * Handle successful analysis
   * Transition to reading view
   */
  function handleAnalysisComplete(result) {
    setCurrentView(APP_VIEWS.READING);
  }

  /**
   * Handle analysis errors
   * Return to upload view
   */
  function handleAnalysisError(error) {
    console.error('[App] Analysis error:', error);
    setCurrentView(APP_VIEWS.UPLOAD);
  }

  /**
   * Handle export button click
   */
  const handleExport = useCallback(() => {
    if (fileUpload.file && analysis.result) {
      exportPdf.exportPdf(fileUpload.file, analysis.result);
    }
  }, [fileUpload.file, analysis.result, exportPdf]);

  /**
   * Handle successful export
   */
  function handleExportComplete() {
    // Show success state (handled by useExport)
  }

  /**
   * Handle export errors
   */
  function handleExportError(error) {
    console.error('[App] Export error:', error);
  }

  /**
   * Start over with a new PDF
   */
  const handleStartOver = useCallback(() => {
    // Reset all state
    fileUpload.reset();
    analysis.reset();
    exportPdf.reset();
    clearLastReading();
    setCurrentView(APP_VIEWS.UPLOAD);
  }, [fileUpload, analysis, exportPdf]);

  /**
   * Retry analysis with current file
   */
  const handleRetryAnalysis = useCallback(() => {
    if (fileUpload.file) {
      analysis.retry(fileUpload.file);
      setCurrentView(APP_VIEWS.ANALYZING);
    }
  }, [fileUpload.file, analysis]);

  // Determine what to show based on current view
  const showUpload = currentView === APP_VIEWS.UPLOAD || currentView === APP_VIEWS.ANALYZING;
  const showReading = currentView === APP_VIEWS.READING && analysis.hasResult;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">PDF Tarot Reader</h1>
        <p className="app__subtitle">Discover your document's destiny</p>
      </header>

      <main className="app__main">
        <AnimatePresence mode="wait">
          {showUpload && (
            <UploadView
              key="upload"
              fileUpload={fileUpload}
              analysis={analysis}
              isAnalyzing={currentView === APP_VIEWS.ANALYZING}
              onRetry={handleRetryAnalysis}
            />
          )}

          {showReading && (
            <ReadingView
              key="reading"
              result={analysis.result}
              filename={fileUpload.file?.name}
              onExport={handleExport}
              onStartOver={handleStartOver}
              exportState={exportPdf}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="app__footer">
        <p>Your documents' secrets revealed</p>
      </footer>
    </div>
  );
}
