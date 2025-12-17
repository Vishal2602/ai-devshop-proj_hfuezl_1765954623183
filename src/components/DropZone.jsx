import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import './DropZone.css';

export default function DropZone({ onFileAccepted, isLoading }) {
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload a PDF file.');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="dropzone-wrapper">
      <motion.div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${isDragReject ? 'dropzone--reject' : ''} ${isLoading ? 'dropzone--loading' : ''}`}
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
        animate={isDragActive ? { scale: 1.02, borderColor: 'var(--color-primary)' } : {}}
        transition={{ duration: 0.15 }}
      >
        <input {...getInputProps()} />

        <div className="dropzone__content">
          <motion.div
            className="dropzone__icon"
            animate={isDragActive ? { y: -10 } : { y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <svg className="dropzone__spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="dropzone__text"
              >
                <p className="dropzone__title">Reading the stars...</p>
                <p className="dropzone__subtitle">Analyzing your document's destiny</p>
              </motion.div>
            ) : isDragActive ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="dropzone__text"
              >
                <p className="dropzone__title">Release to reveal your fate</p>
                <p className="dropzone__subtitle">The cards await...</p>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="dropzone__text"
              >
                <p className="dropzone__title">Drop your PDF here</p>
                <p className="dropzone__subtitle">or click to browse</p>
                <span className="dropzone__hint">PDF up to 10MB</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mystical glow effect on drag */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              className="dropzone__glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="dropzone__error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
