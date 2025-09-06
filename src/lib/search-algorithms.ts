// Advanced search algorithms and utilities for comprehensive search quality

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// Calculate fuzzy similarity score (0-1) using Levenshtein distance
export function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();
  
  // Exact match gets perfect score
  if (normalizedQuery === normalizedTarget) return 1.0;
  
  // Check for exact substring match
  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery);
    const positionBonus = 1 - (position / normalizedTarget.length) * 0.2;
    return Math.min(0.95, 0.8 + positionBonus); // Cap at 0.95 to prioritize exact matches
  }
  
  // Check for prefix match
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return 0.85;
  }
  
  // Use Levenshtein distance for fuzzy matching
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const similarity = 1 - (distance / maxLength);
  
  // Only return score if similarity is above threshold (strict for precision)
  return similarity >= 0.9 ? similarity * 0.5 : 0;
}

// Soundex algorithm for phonetic matching
export function soundex(str: string): string {
  if (!str) return '';
  
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';
  
  const first = s[0];
  let code = s.slice(1)
    .replace(/[AEIOUHYW]/g, '0')
    .replace(/[BFPV]/g, '1')
    .replace(/[CGJKQSXZ]/g, '2')
    .replace(/[DT]/g, '3')
    .replace(/[L]/g, '4')
    .replace(/[MN]/g, '5')
    .replace(/[R]/g, '6')
    .replace(/(.)\1+/g, '$1') // Remove consecutive duplicates
    .replace(/0/g, ''); // Remove zeros
  
  return (first + code + '000').slice(0, 4);
}

// Check if two strings are phonetically similar
export function phoneticallyMatch(query: string, target: string): boolean {
  return soundex(query) === soundex(target);
}

// Extract words from a string for multi-word processing
export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

// Stop words to filter out
export const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'or', 'but', 'not', 'this', 'have'
]);

// Simple stemming for common word endings
export function stem(word: string): string {
  if (word.length <= 3) return word;
  
  // Remove common suffixes
  const suffixes = [
    'ing', 'ed', 'er', 'est', 'ly', 'ion', 'tion', 'ation', 'ness', 'ment',
    'able', 'ible', 'ful', 'less', 'ous', 'eous', 'ious', 'al', 'ial',
    's', 'es', 'ies'
  ];
  
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      let stem = word.slice(0, -suffix.length);
      // Handle some basic transformations
      if (suffix === 'ies') stem += 'y';
      else if (suffix === 'es' && stem.endsWith('s')) continue;
      return stem;
    }
  }
  
  return word;
}

// Calculate score for multi-word queries
export function multiWordScore(queryWords: string[], targetText: string, fieldWeight: number = 1.0): number {
  if (queryWords.length === 0) return 0;
  
  const targetWords = extractWords(targetText);
  if (targetWords.length === 0) return 0;
  
  let totalScore = 0;
  let matchedWords = 0;
  
  for (const queryWord of queryWords) {
    let bestScore = 0;
    
    for (const targetWord of targetWords) {
      // Check exact match (stemmed)
      const queryStem = stem(queryWord);
      const targetStem = stem(targetWord);
      
      if (queryStem === targetStem) {
        bestScore = Math.max(bestScore, 1.0);
      } else {
        // Check fuzzy match
        const fuzzy = fuzzyScore(queryWord, targetWord);
        bestScore = Math.max(bestScore, fuzzy);
        
        // Check phonetic match
        if (phoneticallyMatch(queryWord, targetWord)) {
          bestScore = Math.max(bestScore, 0.6);
        }
      }
    }
    
    if (bestScore > 0) {
      totalScore += bestScore;
      matchedWords++;
    }
  }
  
  // Require at least some words to match
  if (matchedWords === 0) return 0;
  
  // Calculate average score with bonus for matching more words
  const avgScore = totalScore / queryWords.length;
  const completenessBonus = matchedWords / queryWords.length;
  
  return (avgScore * 0.8 + completenessBonus * 0.2) * fieldWeight;
}