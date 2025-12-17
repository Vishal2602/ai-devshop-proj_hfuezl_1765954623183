/**
 * POST /api/analyze - Vercel Serverless Function
 *
 * Accepts a PDF file, extracts text, and generates a tarot reading
 */

import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';

// Disable body parsing - we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

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

// Common words to filter out (stop words)
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'this',
  'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us',
  'our', 'you', 'your', 'i', 'me', 'my', 'he', 'him', 'his', 'she', 'her',
  'which', 'who', 'whom', 'what', 'where', 'when', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here',
  'there', 'then', 'once', 'page', 'document', 'file', 'version', 'date', 'new',
  'one', 'two', 'three', 'first', 'last', 'next', 'any', 'many', 'much', 'own'
]);

// Tarot card decks
const CARD_DECKS = {
  past: [
    { name: 'The Procrastinator', meaning: "This document began its journey in the depths of someone's 'to-do later' pile. It has known neglect, yet persevered." },
    { name: 'The Midnight Oil', meaning: 'Born from late-night inspiration and questionable coffee decisions. This document carries the energy of deadlines past.' },
    { name: 'The Copy-Paste Sage', meaning: 'Much wisdom here was borrowed from documents that came before. Standing on the shoulders of templates.' },
    { name: 'The Revision Maze', meaning: 'This document has seen many versions, each one slightly different, none quite right. Version 17 remembers.' },
    { name: 'The Abandoned Draft', meaning: 'Once begun with great enthusiasm, then forgotten for weeks. Its early paragraphs still echo with optimism.' },
    { name: 'The Meeting Minutes', meaning: 'This document was birthed in a conference room. It carries the collective indecision of many voices.' },
    { name: 'The Inherited Legacy', meaning: 'Someone else started this. The original author has moved on, leaving only cryptic comments behind.' },
    { name: 'The Scope Creeper', meaning: 'What began as a simple task grew into something far more complex. Feature creep left its mark.' }
  ],
  present: [
    { name: 'The Attention Seeker', meaning: 'Right now, this document desperately wants to be read. It yearns for someone to actually make it to page 2.' },
    { name: 'The Hopeful Attachment', meaning: 'Currently sitting in an inbox, waiting to be opened. It believes today could be the day.' },
    { name: 'The Polished Facade', meaning: 'Presenting its best self with clean formatting and professional fonts. But we know the tracked changes it hides.' },
    { name: 'The Meeting Survivor', meaning: 'This document has been projected onto screens and scrutinized by many. It seeks validation.' },
    { name: 'The Urgent Flag', meaning: 'Marked as important! High priority! But is anyone actually reading it? The document wonders.' },
    { name: 'The Circling Approval', meaning: 'Currently making rounds through the approval chain. Each signature brings it closer to its destiny.' },
    { name: 'The Open Tab', meaning: 'Living in a browser tab among dozens of others. Occasionally glimpsed but never fully absorbed.' },
    { name: 'The Desktop Dweller', meaning: 'Saved to the desktop for "quick access." Now buried under 47 other files with similar intentions.' }
  ],
  future: [
    { name: 'The Forgotten Archive', meaning: "Beware! This document's destiny leads to a folder called 'Old Stuff' where it will languish for eternity." },
    { name: 'The Scope Creep', meaning: 'Warning: Additional requirements approach. This document will grow to twice its intended size.' },
    { name: 'The Reply All Catastrophe', meaning: 'Danger ahead! This document may be accidentally sent to people who should never see it.' },
    { name: 'The Printer Nemesis', meaning: 'A formatting disaster awaits. Margins will shift, fonts will change, and someone will say "it looked fine on my screen."' },
    { name: 'The Endless Revision', meaning: 'More feedback is coming. Version numbers will climb. The "final" version will spawn many children.' },
    { name: 'The Deadline Demon', meaning: 'A hard deadline approaches. Corners will be cut. Sleep will be lost. The document will ship anyway.' },
    { name: 'The Silent Archive', meaning: 'After much fanfare, this document will be filed away and never opened again. Such is the cycle.' },
    { name: 'The Rebirth', meaning: 'This document will be repurposed. Its content will live on in presentations, emails, and other forms.' }
  ]
};

const AURAS = [
  { name: 'Focus Goblin', description: 'Highly concentrated content, dense with purpose' },
  { name: 'Deadline Phantom', description: 'Created under pressure, radiates urgency' },
  { name: 'Meeting Magnet', description: 'Will spawn many discussions and calendar invites' },
  { name: 'Inbox Specter', description: 'Destined to haunt email threads' },
  { name: 'Revision Wraith', description: 'Will undergo many transformations' },
  { name: 'Approval Seeker', description: 'Craves validation from stakeholders' },
  { name: 'Scope Creeper', description: 'Tends to expand beyond original boundaries' },
  { name: 'Format Warrior', description: 'Fights valiantly against inconsistent styling' },
  { name: 'Archive Wanderer', description: 'Seeks a final resting place in the file system' },
  { name: 'Tab Haunter', description: 'Will live in browser tabs indefinitely' }
];

const CERTIFICATIONS = [
  'Certified Chaotic Neutral',
  'Professionally Procrastinated',
  'Officially Overthought',
  'Beautifully Bureaucratic',
  'Delightfully Disorganized',
  'Strategically Ambiguous',
  'Carefully Cluttered',
  'Magnificently Meandering',
  'Perfectly Pending',
  'Blissfully Bloated'
];

// Helper functions
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function selectSeeded(array, seed, offset = 0) {
  const index = (seed + offset) % array.length;
  return array[index];
}

function cleanTitle(title) {
  return title
    .replace(/[^\w\s\-_.,!?'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Untitled Document';
}

function extractKeywords(text, maxKeywords = 10) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word));

  const frequency = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

function categorizeDocument(keywords) {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  const categories = [
    { name: 'technical', words: ['code', 'software', 'system', 'data', 'api', 'function', 'error', 'debug'] },
    { name: 'business', words: ['revenue', 'sales', 'market', 'customer', 'strategy', 'growth', 'budget'] },
    { name: 'legal', words: ['agreement', 'contract', 'terms', 'party', 'clause', 'liability', 'law'] },
    { name: 'academic', words: ['research', 'study', 'analysis', 'hypothesis', 'methodology', 'results'] },
    { name: 'creative', words: ['design', 'concept', 'creative', 'brand', 'visual', 'story', 'content'] },
    { name: 'administrative', words: ['meeting', 'agenda', 'minutes', 'action', 'review', 'report', 'status'] },
  ];

  let bestMatch = { name: 'general', score: 0 };

  for (const category of categories) {
    const score = category.words.filter(w => keywordSet.has(w)).length;
    if (score > bestMatch.score) {
      bestMatch = { name: category.name, score };
    }
  }

  return bestMatch.name;
}

function generateReading({ title, keywords, category, text }) {
  const seed = hashCode(text.slice(0, 500) + title);

  const pastCard = selectSeeded(CARD_DECKS.past, seed, 0);
  const presentCard = selectSeeded(CARD_DECKS.present, seed, 1);
  const futureCard = selectSeeded(CARD_DECKS.future, seed, 2);

  const aura = selectSeeded(AURAS, seed, 3);
  const certification = selectSeeded(CERTIFICATIONS, seed, 4);

  return {
    title,
    keywords,
    category,
    aura: aura.name,
    certification,
    cards: [
      { position: 'past', name: pastCard.name, meaning: pastCard.meaning },
      { position: 'present', name: presentCard.name, meaning: presentCard.meaning },
      { position: 'future', name: futureCard.name, meaning: futureCard.meaning }
    ]
  };
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
    const { files } = await parseForm(req);

    // Get the uploaded file
    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    // Validate MIME type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    // Read the file
    const pdfBuffer = readFileSync(file.filepath);

    // Extract text from PDF
    let data;
    try {
      data = await pdfParse(pdfBuffer, { max: 5 });
    } catch (parseError) {
      console.error('[analyze] PDF parse error:', parseError);
      return res.status(422).json({
        message: 'Could not extract text from PDF. The document may be scanned or encrypted.'
      });
    }

    const text = data.text.slice(0, 3000).trim();

    if (!text || text.length < 10) {
      return res.status(422).json({
        message: 'Could not extract text from PDF. The document may be scanned or encrypted.'
      });
    }

    // Get title
    let title = data.info?.Title || '';
    if (!title) {
      const firstLine = text.split('\n')[0]?.trim() || '';
      title = firstLine.slice(0, 100) || 'Untitled Document';
    }
    title = cleanTitle(title);

    // Extract keywords and categorize
    const keywords = extractKeywords(text);
    const category = categorizeDocument(keywords);

    // Generate tarot reading
    const reading = generateReading({ title, keywords, category, text });

    // Validate response structure
    const validated = AnalysisResponseSchema.parse(reading);

    // Return analysis
    res.status(200).json(validated);

  } catch (error) {
    console.error('[analyze] Error:', error);

    if (error.name === 'ZodError') {
      return res.status(500).json({ message: 'Internal validation error' });
    }

    res.status(500).json({ message: 'Failed to analyze PDF' });
  }
}
