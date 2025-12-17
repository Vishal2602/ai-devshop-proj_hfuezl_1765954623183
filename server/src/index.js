/**
 * PDF Tarot Reader - Express Server
 *
 * Handles PDF analysis and rendering endpoints
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeRoute } from './routes/analyze.js';
import { renderRoute } from './routes/render.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/analyze', upload.single('file'), analyzeRoute);
app.post('/api/render', upload.single('file'), renderRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`PDF Tarot Reader server running on http://localhost:${PORT}`);
});
