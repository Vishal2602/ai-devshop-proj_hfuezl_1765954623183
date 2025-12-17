/**
 * POST /api/render - Vercel Serverless Function
 *
 * Generates cover page and merges with original PDF
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';

// Disable body parsing - we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Colors matching design system
const COLORS = {
  background: rgb(26 / 255, 32 / 255, 44 / 255),
  primary: rgb(107 / 255, 70 / 255, 193 / 255),
  gold: rgb(246 / 255, 173 / 255, 85 / 255),
  white: rgb(1, 1, 1),
  muted: rgb(160 / 255, 174 / 255, 192 / 255),
  past: rgb(104 / 255, 211 / 255, 145 / 255),
  present: rgb(66 / 255, 153 / 255, 225 / 255),
  future: rgb(237 / 255, 100 / 255, 166 / 255),
};

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

async function createCoverPage(analysis, pageWidth = 612, pageHeight = 792) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const centerX = pageWidth / 2;

  // Draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: COLORS.background,
  });

  // Title
  let y = pageHeight - 60;
  const titleText = 'PDF TAROT READING';
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 28);
  page.drawText(titleText, {
    x: centerX - titleWidth / 2,
    y,
    size: 28,
    font: boldFont,
    color: COLORS.gold,
  });

  // Decorative line
  y -= 15;
  const lineWidth = 200;
  page.drawRectangle({
    x: centerX - lineWidth / 2,
    y,
    width: lineWidth,
    height: 2,
    color: COLORS.primary,
  });

  // Document title
  y -= 30;
  const docTitle = truncateText(analysis.title || 'Untitled Document', 50);
  const docTitleWidth = regularFont.widthOfTextAtSize(docTitle, 14);
  page.drawText(docTitle, {
    x: centerX - docTitleWidth / 2,
    y,
    size: 14,
    font: regularFont,
    color: COLORS.muted,
  });

  // Draw three cards
  y -= 50;
  const cardWidth = 140;
  const cardHeight = 180;
  const cardGap = 20;
  const totalCardsWidth = cardWidth * 3 + cardGap * 2;
  let cardX = centerX - totalCardsWidth / 2;

  const positionColors = [COLORS.past, COLORS.present, COLORS.future];
  const positionLabels = ['PAST', 'PRESENT', 'FUTURE'];

  for (let i = 0; i < 3; i++) {
    const card = analysis.cards[i];
    const color = positionColors[i];

    // Card background
    page.drawRectangle({
      x: cardX,
      y: y - cardHeight,
      width: cardWidth,
      height: cardHeight,
      color: rgb(0.15, 0.18, 0.25),
      borderColor: color,
      borderWidth: 2,
    });

    // Position label
    const labelY = y - 25;
    const labelText = positionLabels[i];
    const labelWidth = boldFont.widthOfTextAtSize(labelText, 10);
    page.drawText(labelText, {
      x: cardX + cardWidth / 2 - labelWidth / 2,
      y: labelY,
      size: 10,
      font: boldFont,
      color: color,
    });

    // Card name
    const nameY = y - 50;
    const cardName = truncateText(card.name, 18);
    const nameWidth = boldFont.widthOfTextAtSize(cardName, 12);
    page.drawText(cardName, {
      x: cardX + cardWidth / 2 - nameWidth / 2,
      y: nameY,
      size: 12,
      font: boldFont,
      color: COLORS.white,
    });

    // Card meaning (wrapped)
    const meaningLines = wrapText(card.meaning, 22);
    let meaningY = y - 75;
    for (const line of meaningLines.slice(0, 5)) {
      page.drawText(line, {
        x: cardX + 10,
        y: meaningY,
        size: 8,
        font: regularFont,
        color: COLORS.muted,
      });
      meaningY -= 12;
    }

    cardX += cardWidth + cardGap;
  }

  // Aura badge
  y -= cardHeight + 50;
  const auraText = 'AURA: ' + analysis.aura;
  const auraWidth = boldFont.widthOfTextAtSize(auraText, 14);

  const badgePadding = 15;
  const badgeWidth = auraWidth + badgePadding * 2;
  page.drawRectangle({
    x: centerX - badgeWidth / 2,
    y: y - 25,
    width: badgeWidth,
    height: 30,
    color: COLORS.primary,
    borderColor: COLORS.gold,
    borderWidth: 1,
  });

  page.drawText(auraText, {
    x: centerX - auraWidth / 2,
    y: y - 17,
    size: 14,
    font: boldFont,
    color: COLORS.white,
  });

  // Certification stamp
  y -= 70;
  const certText = analysis.certification || 'Certified Chaotic Neutral';
  const certWidth = boldFont.widthOfTextAtSize(certText, 12);

  const stampWidth = certWidth + 30;
  const stampHeight = 40;
  page.drawRectangle({
    x: centerX - stampWidth / 2 + 2,
    y: y - stampHeight / 2 - 2,
    width: stampWidth,
    height: stampHeight,
    borderColor: COLORS.primary,
    borderWidth: 2,
    opacity: 0.5,
  });
  page.drawRectangle({
    x: centerX - stampWidth / 2,
    y: y - stampHeight / 2,
    width: stampWidth,
    height: stampHeight,
    borderColor: COLORS.primary,
    borderWidth: 3,
  });

  page.drawText(certText, {
    x: centerX - certWidth / 2,
    y: y - 5,
    size: 12,
    font: boldFont,
    color: COLORS.primary,
  });

  // Footer
  y = 40;
  const footerText = 'pdftarot.app';
  const footerWidth = regularFont.widthOfTextAtSize(footerText, 10);
  page.drawText(footerText, {
    x: centerX - footerWidth / 2,
    y,
    size: 10,
    font: regularFont,
    color: COLORS.muted,
  });

  return pdfDoc;
}

async function renderMergedPdf(originalPdfBuffer, analysis) {
  // Load original PDF
  const originalPdf = await PDFDocument.load(originalPdfBuffer, {
    ignoreEncryption: true,
  });

  // Get page dimensions from first page
  const firstPage = originalPdf.getPages()[0];
  const { width, height } = firstPage.getSize();

  // Create cover page
  const coverPdf = await createCoverPage(analysis, width, height);

  // Create new document and merge
  const mergedPdf = await PDFDocument.create();

  // Copy cover page
  const [coverPage] = await mergedPdf.copyPages(coverPdf, [0]);
  mergedPdf.addPage(coverPage);

  // Copy all original pages
  const pageIndices = originalPdf.getPageIndices();
  const copiedPages = await mergedPdf.copyPages(originalPdf, pageIndices);
  for (const page of copiedPages) {
    mergedPdf.addPage(page);
  }

  // Save and return
  const pdfBytes = await mergedPdf.save();
  return Buffer.from(pdfBytes);
}

// Parse form data
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const { fields, files } = await parseForm(req);

    // Get the uploaded file
    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    // Get analysis JSON
    const analysisStr = fields.analysis?.[0] || fields.analysis;
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

    console.log('[render] Processing: ' + (file.originalFilename || 'uploaded.pdf'));

    // Read the file
    const pdfBuffer = readFileSync(file.filepath);

    // Render merged PDF
    const mergedPdfBuffer = await renderMergedPdf(pdfBuffer, analysis);

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
