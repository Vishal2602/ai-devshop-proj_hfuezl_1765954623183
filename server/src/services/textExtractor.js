/**
 * PDF Text Extraction Service
 *
 * Uses pdf-parse to extract text content from PDF files
 */

import pdfParse from 'pdf-parse';

// Extract first N characters to keep processing fast
const MAX_TEXT_LENGTH = 3000;

/**
 * Extract text content from a PDF buffer
 *
 * @param {Buffer} pdfBuffer - PDF file as buffer
 * @returns {Promise<{text: string, numPages: number, title: string}>}
 */
export async function extractText(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer, {
      max: 5, // Only parse first 5 pages for speed
    });

    // Get raw text and truncate
    const text = data.text.slice(0, MAX_TEXT_LENGTH).trim();

    // Try to extract title from metadata or first line
    let title = data.info?.Title || '';
    if (!title) {
      // Get first line as title
      const firstLine = text.split('\n')[0]?.trim() || '';
      title = firstLine.slice(0, 100) || 'Untitled Document';
    }

    return {
      text,
      numPages: data.numpages,
      title: cleanTitle(title),
    };
  } catch (error) {
    console.error('[textExtractor] Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Clean up extracted title
 */
function cleanTitle(title) {
  return title
    .replace(/[^\w\s\-_.,!?'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Untitled Document';
}

export default { extractText };
