/**
 * API client for PDF Tarot Reader
 * Handles communication with the backend
 */

const API_BASE = '/api';

/**
 * Analyze a PDF and get a tarot reading
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<Object>} Analysis result with cards, aura, keywords
 */
export async function analyzePdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Analysis failed' }));
    throw new Error(error.message || 'Failed to analyze PDF');
  }

  return response.json();
}

/**
 * Render a PDF with the tarot cover page
 * @param {File} file - The original PDF file
 * @param {Object} analysis - The analysis result from analyzePdf
 * @returns {Promise<Blob>} The merged PDF as a blob
 */
export async function renderPdf(file, analysis) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('analysis', JSON.stringify(analysis));

  const response = await fetch(`${API_BASE}/render`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Render failed' }));
    throw new Error(error.message || 'Failed to render PDF');
  }

  return response.blob();
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The name for the downloaded file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Mock analysis for development/demo without backend
 * @param {File} file - The PDF file
 * @returns {Promise<Object>} Mock analysis result
 */
export async function mockAnalyzePdf(file) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const cardDecks = {
    past: [
      { name: 'The Procrastinator', meaning: 'This document began its journey in the depths of someone\'s "to-do later" pile. It has known neglect, yet persevered.' },
      { name: 'The Midnight Oil', meaning: 'Born from late-night inspiration and questionable coffee decisions. This document carries the energy of deadlines past.' },
      { name: 'The Copy-Paste Sage', meaning: 'Much wisdom here was borrowed from documents that came before. Standing on the shoulders of templates.' },
      { name: 'The Revision Maze', meaning: 'This document has seen many versions, each one slightly different, none quite right. Version 17 remembers.' }
    ],
    present: [
      { name: 'The Attention Seeker', meaning: 'Right now, this document desperately wants to be read. It yearns for someone to actually make it to page 2.' },
      { name: 'The Hopeful Attachment', meaning: 'Currently sitting in an inbox, waiting to be opened. It believes today could be the day.' },
      { name: 'The Polished Facade', meaning: 'Presenting its best self with clean formatting and professional fonts. But we know the tracked changes it hides.' },
      { name: 'The Meeting Survivor', meaning: 'This document has been projected onto screens and scrutinized by many. It seeks validation.' }
    ],
    future: [
      { name: 'The Forgotten Archive', meaning: 'Beware! This document\'s destiny leads to a folder called "Old Stuff" where it will languish for eternity.' },
      { name: 'The Scope Creep', meaning: 'Warning: Additional requirements approach. This document will grow to twice its intended size.' },
      { name: 'The Reply All Catastrophe', meaning: 'Danger ahead! This document may be accidentally sent to people who should never see it.' },
      { name: 'The Printer Nemesis', meaning: 'A formatting disaster awaits. Margins will shift, fonts will change, and someone will say "it looked fine on my screen."' }
    ]
  };

  const auras = [
    'Focus Goblin',
    'Deadline Phantom',
    'Meeting Magnet',
    'Inbox Specter',
    'Revision Wraith',
    'Approval Seeker',
    'Scope Creeper',
    'Format Warrior'
  ];

  const certifications = [
    'Certified Chaotic Neutral',
    'Professionally Procrastinated',
    'Officially Overthought',
    'Beautifully Bureaucratic',
    'Delightfully Disorganized',
    'Strategically Ambiguous'
  ];

  const randomCard = (cards) => cards[Math.floor(Math.random() * cards.length)];

  return {
    title: file.name.replace('.pdf', ''),
    keywords: ['document', 'important', 'review', 'urgent', 'draft'],
    aura: auras[Math.floor(Math.random() * auras.length)],
    certification: certifications[Math.floor(Math.random() * certifications.length)],
    cards: [
      { position: 'past', ...randomCard(cardDecks.past) },
      { position: 'present', ...randomCard(cardDecks.present) },
      { position: 'future', ...randomCard(cardDecks.future) }
    ]
  };
}

/**
 * Mock render for development/demo without backend
 * @param {File} file - The original PDF
 * @param {Object} analysis - The analysis result
 * @returns {Promise<Blob>} The original PDF (mock)
 */
export async function mockRenderPdf(file, analysis) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In mock mode, just return the original file
  // In production, this would return the merged PDF
  return file;
}
