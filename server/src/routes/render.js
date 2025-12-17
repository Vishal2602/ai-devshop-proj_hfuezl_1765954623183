/**
 * Render Route - POST /api/render
 *
 * Generates cover page and merges with original PDF
 */

import { renderMergedPdf } from '../services/pdfRenderer.js';

/**
 * Handle PDF render request
 *
 * @param {Request} req - Express request with file and analysis
 * @param {Response} res - Express response
 */
export async function renderRoute(req, res) {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    // Parse analysis JSON from form data
    const analysisStr = req.body.analysis;
    if (!analysisStr) {
      return res.status(400).json({ message: 'No analysis data provided' });
    }

    let analysis;
    try {
      analysis = JSON.parse(analysisStr);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid analysis JSON' });
    }

    // Validate analysis structure
    if (!analysis.cards || analysis.cards.length !== 3) {
      return res.status(400).json({ message: 'Invalid analysis: missing cards' });
    }

    if (!analysis.aura) {
      return res.status(400).json({ message: 'Invalid analysis: missing aura' });
    }

    console.log('[render] Processing: ' + req.file.originalname);

    // Render merged PDF
    const mergedPdfBuffer = await renderMergedPdf(req.file.buffer, analysis);

    console.log('[render] Generated ' + mergedPdfBuffer.length + ' bytes');

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="tarot_reading.pdf"');
    res.setHeader('Content-Length', mergedPdfBuffer.length);
    res.send(mergedPdfBuffer);

  } catch (error) {
    console.error('[render] Error:', error);
    res.status(500).json({ message: 'Failed to render PDF' });
  }
}

export default { renderRoute };
