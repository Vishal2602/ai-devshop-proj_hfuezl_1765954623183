/**
 * Keyword Extraction Service
 *
 * Simple TF-IDF style keyword extraction for document analysis
 */

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

/**
 * Extract keywords from text using simple frequency analysis
 *
 * @param {string} text - Raw text content
 * @param {number} maxKeywords - Maximum keywords to return
 * @returns {string[]} - Array of keywords
 */
export function extractKeywords(text, maxKeywords = 10) {
  // Tokenize: extract words, lowercase, remove short words
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word));

  // Count frequency
  const frequency = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Sort by frequency and take top N
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted;
}

/**
 * Categorize document based on keywords
 *
 * @param {string[]} keywords - Extracted keywords
 * @returns {string} - Category label
 */
export function categorizeDocument(keywords) {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  // Category detection rules
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

export default { extractKeywords, categorizeDocument };
