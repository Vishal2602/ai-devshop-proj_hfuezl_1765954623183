/**
 * PreviewStrip Component
 *
 * Displays thumbnail previews of PDF pages using pdfjs-dist
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import './PreviewStrip.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_THUMBNAILS = 5;
const THUMBNAIL_WIDTH = 80;

/**
 * PreviewStrip - Thumbnail preview of PDF pages
 *
 * @param {Object} props
 * @param {File} props.file - PDF file to preview
 * @param {string} props.className - Additional CSS classes
 */
export default function PreviewStrip({ file, className = '' }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRefs = useRef([]);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    async function generateThumbnails() {
      setLoading(true);
      setError(null);
      setThumbnails([]);

      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF document
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (cancelled) return;

        setTotalPages(pdf.numPages);

        // Generate thumbnails for first N pages
        const numThumbnails = Math.min(pdf.numPages, MAX_THUMBNAILS);
        const newThumbnails = [];

        for (let i = 1; i <= numThumbnails; i++) {
          if (cancelled) return;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });

          // Create canvas for thumbnail
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          newThumbnails.push({
            pageNum: i,
            dataUrl,
            width: viewport.width,
            height: viewport.height,
          });
        }

        if (!cancelled) {
          setThumbnails(newThumbnails);
          setLoading(false);
        }
      } catch (err) {
        console.error('[PreviewStrip] Error generating thumbnails:', err);
        if (!cancelled) {
          setError('Failed to generate preview');
          setLoading(false);
        }
      }
    }

    generateThumbnails();

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const thumbnailVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  if (error) {
    return null; // Silently fail - thumbnails are optional
  }

  if (loading) {
    return (
      <div className={`preview-strip preview-strip--loading ${className}`}>
        <div className="preview-strip__skeleton">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="preview-strip__skeleton-item" />
          ))}
        </div>
      </div>
    );
  }

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`preview-strip ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="preview-strip__thumbnails">
        {thumbnails.map((thumb, index) => (
          <motion.div
            key={thumb.pageNum}
            className="preview-strip__thumbnail"
            variants={thumbnailVariants}
          >
            <img
              src={thumb.dataUrl}
              alt={`Page ${thumb.pageNum}`}
              className="preview-strip__image"
            />
            <span className="preview-strip__page-num">{thumb.pageNum}</span>
          </motion.div>
        ))}
        {totalPages > MAX_THUMBNAILS && (
          <div className="preview-strip__more">
            +{totalPages - MAX_THUMBNAILS}
          </div>
        )}
      </div>
      <p className="preview-strip__count">
        {totalPages} page{totalPages !== 1 ? 's' : ''}
      </p>
    </motion.div>
  );
}
