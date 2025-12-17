/**
 * Tarot Reading Generator Service
 *
 * Generates tarot-style readings based on document analysis
 */

// Tarot card decks for each position
const CARD_DECKS = {
  past: [
    {
      name: 'The Procrastinator',
      meaning: "This document began its journey in the depths of someone's 'to-do later' pile. It has known neglect, yet persevered."
    },
    {
      name: 'The Midnight Oil',
      meaning: 'Born from late-night inspiration and questionable coffee decisions. This document carries the energy of deadlines past.'
    },
    {
      name: 'The Copy-Paste Sage',
      meaning: 'Much wisdom here was borrowed from documents that came before. Standing on the shoulders of templates.'
    },
    {
      name: 'The Revision Maze',
      meaning: 'This document has seen many versions, each one slightly different, none quite right. Version 17 remembers.'
    },
    {
      name: 'The Abandoned Draft',
      meaning: 'Once begun with great enthusiasm, then forgotten for weeks. Its early paragraphs still echo with optimism.'
    },
    {
      name: 'The Meeting Minutes',
      meaning: 'This document was birthed in a conference room. It carries the collective indecision of many voices.'
    },
    {
      name: 'The Inherited Legacy',
      meaning: 'Someone else started this. The original author has moved on, leaving only cryptic comments behind.'
    },
    {
      name: 'The Scope Creeper',
      meaning: 'What began as a simple task grew into something far more complex. Feature creep left its mark.'
    }
  ],
  present: [
    {
      name: 'The Attention Seeker',
      meaning: 'Right now, this document desperately wants to be read. It yearns for someone to actually make it to page 2.'
    },
    {
      name: 'The Hopeful Attachment',
      meaning: 'Currently sitting in an inbox, waiting to be opened. It believes today could be the day.'
    },
    {
      name: 'The Polished Facade',
      meaning: 'Presenting its best self with clean formatting and professional fonts. But we know the tracked changes it hides.'
    },
    {
      name: 'The Meeting Survivor',
      meaning: 'This document has been projected onto screens and scrutinized by many. It seeks validation.'
    },
    {
      name: 'The Urgent Flag',
      meaning: 'Marked as important! High priority! But is anyone actually reading it? The document wonders.'
    },
    {
      name: 'The Circling Approval',
      meaning: 'Currently making rounds through the approval chain. Each signature brings it closer to its destiny.'
    },
    {
      name: 'The Open Tab',
      meaning: 'Living in a browser tab among dozens of others. Occasionally glimpsed but never fully absorbed.'
    },
    {
      name: 'The Desktop Dweller',
      meaning: 'Saved to the desktop for "quick access." Now buried under 47 other files with similar intentions.'
    }
  ],
  future: [
    {
      name: 'The Forgotten Archive',
      meaning: "Beware! This document's destiny leads to a folder called 'Old Stuff' where it will languish for eternity."
    },
    {
      name: 'The Scope Creep',
      meaning: 'Warning: Additional requirements approach. This document will grow to twice its intended size.'
    },
    {
      name: 'The Reply All Catastrophe',
      meaning: 'Danger ahead! This document may be accidentally sent to people who should never see it.'
    },
    {
      name: 'The Printer Nemesis',
      meaning: 'A formatting disaster awaits. Margins will shift, fonts will change, and someone will say "it looked fine on my screen."'
    },
    {
      name: 'The Endless Revision',
      meaning: 'More feedback is coming. Version numbers will climb. The "final" version will spawn many children.'
    },
    {
      name: 'The Deadline Demon',
      meaning: 'A hard deadline approaches. Corners will be cut. Sleep will be lost. The document will ship anyway.'
    },
    {
      name: 'The Silent Archive',
      meaning: 'After much fanfare, this document will be filed away and never opened again. Such is the cycle.'
    },
    {
      name: 'The Rebirth',
      meaning: 'This document will be repurposed. Its content will live on in presentations, emails, and other forms.'
    }
  ]
};

// Aura types based on document characteristics
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

// Certification stamps
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

/**
 * Generate a seeded random number based on text hash
 * This ensures same document gets same reading
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select item from array using seeded index
 */
function selectSeeded(array, seed, offset = 0) {
  const index = (seed + offset) % array.length;
  return array[index];
}

/**
 * Generate a tarot reading from document analysis
 *
 * @param {Object} params - Analysis parameters
 * @param {string} params.title - Document title
 * @param {string[]} params.keywords - Extracted keywords
 * @param {string} params.category - Document category
 * @param {string} params.text - Raw text (for hashing)
 * @returns {Object} - Complete tarot reading
 */
export function generateReading({ title, keywords, category, text }) {
  // Create seed from document content for reproducible results
  const seed = hashCode(text.slice(0, 500) + title);

  // Select cards for each position
  const pastCard = selectSeeded(CARD_DECKS.past, seed, 0);
  const presentCard = selectSeeded(CARD_DECKS.present, seed, 1);
  const futureCard = selectSeeded(CARD_DECKS.future, seed, 2);

  // Select aura and certification
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

export default { generateReading };
