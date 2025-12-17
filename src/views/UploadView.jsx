/**
 * UploadView - Initial view for PDF upload
 *
 * Shows the dropzone and handles the upload/analysis flow.
 * Integrates with useFileUpload and useAnalysis hooks.
 */

import { motion } from 'framer-motion';
import DropZone from '../components/DropZone';
import PreviewStrip from '../components/PreviewStrip';
import { pageTransition, fadeInUp } from '../lib/animations';
import './UploadView.css';

export default function UploadView({ fileUpload, analysis, isAnalyzing, onRetry }) {
  const showError = analysis.hasError && !isAnalyzing;

  return (
    <motion.div
      className="upload-view"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <div className="upload-view__content">
        <motion.div
          className="upload-view__intro"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
        >
          <p className="upload-view__tagline">
            Every document has a story. Let the cards reveal yours.
          </p>
        </motion.div>

        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          <DropZone
            onFileAccepted={fileUpload.processFiles ? (file) => fileUpload.processFiles([file]) : () => {}}
            isLoading={isAnalyzing}
          />
          {/* Show preview thumbnails when file is uploaded */}
          {fileUpload.file && (
            <PreviewStrip file={fileUpload.file} />
          )}
        </motion.div>

        {/* Analysis progress */}
        {isAnalyzing && (
          <motion.div
            className="upload-view__progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="upload-view__progress-bar">
              <motion.div
                className="upload-view__progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${analysis.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="upload-view__progress-text">
              Consulting the oracle... {Math.round(analysis.progress)}%
            </p>
          </motion.div>
        )}

        {/* Error state with retry */}
        {showError && (
          <motion.div
            className="upload-view__error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="upload-view__error-message">
              {analysis.error?.message || 'Something went wrong'}
            </p>
            <button
              className="upload-view__retry-btn"
              onClick={onRetry}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Features list */}
        <motion.div
          className="upload-view__features"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
        >
          <div className="upload-view__feature">
            <span className="upload-view__feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </span>
            <span className="upload-view__feature-label">Past</span>
            <span className="upload-view__feature-desc">What your doc is really about</span>
          </div>
          <div className="upload-view__feature">
            <span className="upload-view__feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="upload-view__feature-label">Present</span>
            <span className="upload-view__feature-desc">What it's trying to achieve</span>
          </div>
          <div className="upload-view__feature">
            <span className="upload-view__feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="upload-view__feature-label">Future</span>
            <span className="upload-view__feature-desc">What could go hilariously wrong</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
