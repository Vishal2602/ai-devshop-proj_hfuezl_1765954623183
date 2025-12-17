/**
 * POST /api/analyze Route
 *
 * Accepts a PDF file, extracts text, and generates a tarot reading
 */

import { z } from 'zod';
import { extractText } from '../services/textExtractor.js';
import { extractKeywords, categorizeDocument } from '../services/keywordExtractor.js';
import { generateReading } from '../services/readingGenerator.js';

// Response schema for validation
const AnalysisResponseSchema = z.object({
  title: z.string(),
  keywords: z.array(z.string()),
  category: z.string(),
  aura: z.string(),
  certification: z.string(),
  cards: z.array(z.object({
    position: z.enum(['past', 'present', 'future']),
    name: z.string(),
    meaning: z.string(),
  })).length(3),
});

/**
 * Analyze route handler
 */
export async function analyzeRoute(req, res) {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    const pdfBuffer = req.file.buffer;

    // Extract text from PDF
    const { text, title, numPages } = await extractText(pdfBuffer);

    if (!text || text.length < 10) {
      return res.status(422).json({
        message: 'Could not extract text from PDF. The document may be scanned or encrypted.'
      });
    }

    // Extract keywords
    const keywords = extractKeywords(text);

    // Categorize document
    const category = categorizeDocument(keywords);

    // Generate tarot reading
    const reading = generateReading({
      title,
      keywords,
      category,
      text,
    });

    // Validate response structure
    const validated = AnalysisResponseSchema.parse(reading);

    // Return analysis
    res.json(validated);

  } catch (error) {
    console.error('[analyze] Error:', error);

    if (error.name === 'ZodError') {
      return res.status(500).json({ message: 'Internal validation error' });
    }

    if (error.message?.includes('extract text')) {
      return res.status(422).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to analyze PDF' });
  }
}

export default analyzeRoute;
