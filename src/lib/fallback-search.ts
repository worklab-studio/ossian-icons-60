// Fallback search implementation using the same advanced algorithms as the worker
import { type IconItem } from '@/types/icon';
import { 
  fuzzyScore, 
  multiWordScore, 
  extractWords, 
  stem, 
  phoneticallyMatch 
} from './search-algorithms';
import { expandQueryWithSynonyms } from './search-synonyms';

interface FallbackSearchOptions {
  fuzzy?: boolean;
  maxResults?: number;
  minScore?: number;
  enableSynonyms?: boolean;
  enablePhonetic?: boolean;
  libraryId?: string;
}

interface SearchResult {
  icon: IconItem;
  score: number;
  matchedFields: string[];
  matchDetails: {
    exactMatch: boolean;
    fuzzyMatch: boolean;
    synonymMatch: boolean;
    phoneticMatch: boolean;
  };
}

// Tiered scoring system for precise search results
const FIELD_WEIGHTS = {
  nameExact: 100.0,     // Perfect name match gets highest score
  namePrefix: 50.0,     // Name starts with query
  nameFuzzy: 10.0,      // Fuzzy name match
  tagExact: 50.0,       // Exact tag match
  tagFuzzy: 8.0,        // Fuzzy tag match  
  categoryExact: 25.0,  // Exact category match
  categoryFuzzy: 5.0,   // Fuzzy category match
  synonymMatch: 5.0,    // Synonym match (conservative)
  phoneticMatch: 3.0,   // Phonetic match
  stemMatch: 8.0        // Stemmed word match
};

// Token-based word matching utility (mirrors worker logic)
function matchesWholeWord(text: string, query: string): { exact: boolean; prefix: boolean } {
  const textWords = extractWords(text);
  const queryLower = query.toLowerCase();
  
  for (const word of textWords) {
    if (word === queryLower) {
      return { exact: true, prefix: false };
    }
    if (query.length >= 3 && word.startsWith(queryLower)) {
      return { exact: false, prefix: true };
    }
  }
  
  return { exact: false, prefix: false };
}

// Calculate comprehensive search score for an icon (same logic as worker)
function calculateIconScore(
  icon: IconItem, 
  originalQuery: string,
  expandedQueries: string[],
  queryWords: string[],
  options: FallbackSearchOptions = {}
): SearchResult | null {
  const { fuzzy = true, enableSynonyms = false, enablePhonetic = true } = options;
  
  let bestScore = 0;
  let matchedFields: string[] = [];
  let matchDetails = {
    exactMatch: false,
    fuzzyMatch: false,
    synonymMatch: false,
    phoneticMatch: false
  };

  // Normalize icon fields once
  const iconName = (icon.name || '').toLowerCase();
  const iconTags = (icon.tags || []).map(tag => tag.toLowerCase());
  const iconCategory = (icon.category || '').toLowerCase();
  
  // Check all expanded queries (including synonyms)
  for (const query of expandedQueries) {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) continue;
    
    let queryScore = 0;
    const currentFields: string[] = [];
    
    // Score against name using token-based matching
    const nameMatch = matchesWholeWord(iconName, normalizedQuery);
    if (nameMatch.exact) {
      queryScore = Math.max(queryScore, FIELD_WEIGHTS.nameExact);
      matchDetails.exactMatch = true;
      currentFields.push('name');
    } else if (nameMatch.prefix) {
      queryScore = Math.max(queryScore, FIELD_WEIGHTS.namePrefix);
      currentFields.push('name');
    } else if (fuzzy && normalizedQuery.length >= 4) {
      const nameScore = fuzzyScore(normalizedQuery, iconName);
      if (nameScore > 0) {
        queryScore = Math.max(queryScore, nameScore * FIELD_WEIGHTS.nameFuzzy);
        matchDetails.fuzzyMatch = true;
        currentFields.push('name');
      }
    }
    
    // Score against tags using token-based matching
    for (const tag of iconTags) {
      const tagMatch = matchesWholeWord(tag, normalizedQuery);
      if (tagMatch.exact) {
        queryScore = Math.max(queryScore, FIELD_WEIGHTS.tagExact);
        matchDetails.exactMatch = true;
        currentFields.push('tag');
      } else if (tagMatch.prefix) {
        queryScore = Math.max(queryScore, FIELD_WEIGHTS.tagExact * 0.8);
        currentFields.push('tag');
      } else if (fuzzy && normalizedQuery.length >= 4) {
        const tagScore = fuzzyScore(normalizedQuery, tag);
        if (tagScore > 0) {
          queryScore = Math.max(queryScore, tagScore * FIELD_WEIGHTS.tagFuzzy);
          matchDetails.fuzzyMatch = true;
          currentFields.push('tag');
        }
      }
    }
    
    // Score against category using token-based matching
    const categoryMatch = matchesWholeWord(iconCategory, normalizedQuery);
    if (categoryMatch.exact) {
      queryScore = Math.max(queryScore, FIELD_WEIGHTS.categoryExact);
      matchDetails.exactMatch = true;
      currentFields.push('category');
    } else if (categoryMatch.prefix) {
      queryScore = Math.max(queryScore, FIELD_WEIGHTS.categoryExact * 0.8);
      currentFields.push('category');
    } else if (fuzzy && normalizedQuery.length >= 4) {
      const categoryScore = fuzzyScore(normalizedQuery, iconCategory);
      if (categoryScore > 0) {
        queryScore = Math.max(queryScore, categoryScore * FIELD_WEIGHTS.categoryFuzzy);
        matchDetails.fuzzyMatch = true;
        currentFields.push('category');
      }
    }
    
    // Check if this is a synonym match
    if (query !== originalQuery.toLowerCase()) {
      queryScore *= 0.9; // Slight penalty for synonym matches
      matchDetails.synonymMatch = true;
    }
    
    // Phonetic matching
    if (enablePhonetic && queryScore === 0) {
      const fields = [iconName, ...iconTags, iconCategory];
      for (const field of fields) {
        if (phoneticallyMatch(normalizedQuery, field)) {
          queryScore = Math.max(queryScore, FIELD_WEIGHTS.phoneticMatch);
          matchDetails.phoneticMatch = true;
          currentFields.push('phonetic');
          break;
        }
      }
    }
    
    if (queryScore > bestScore) {
      bestScore = queryScore;
      matchedFields = [...currentFields];
    }
  }
  
  // Multi-word query bonus
  if (queryWords.length > 1) {
    const nameMultiScore = multiWordScore(queryWords, iconName, FIELD_WEIGHTS.nameFuzzy / 10);
    const tagMultiScore = Math.max(...iconTags.map(tag => 
      multiWordScore(queryWords, tag, FIELD_WEIGHTS.tagFuzzy / 10)
    ), 0);
    const categoryMultiScore = multiWordScore(queryWords, iconCategory, FIELD_WEIGHTS.categoryFuzzy / 10);
    
    const multiScore = Math.max(nameMultiScore, tagMultiScore, categoryMultiScore);
    if (multiScore > 0) {
      bestScore = Math.max(bestScore, multiScore);
      matchedFields.push('multi-word');
    }
  }
  
  return bestScore > 0 ? {
    icon,
    score: bestScore,
    matchedFields: [...new Set(matchedFields)],
    matchDetails
  } : null;
}

// Enhanced fallback search with comprehensive scoring
export function fallbackSearch(
  icons: IconItem[], 
  query: string, 
  options: FallbackSearchOptions = {}
): { results: IconItem[]; totalCount: number } {
  const {
    fuzzy = true,
    maxResults = 500,      // Reduced to prioritize best matches
    minScore = 8.0,        // Significantly increased for precision
    enableSynonyms = false, // Disabled by default for exact results
    enablePhonetic = true,
    libraryId
  } = options;
  
  console.log(`🔍 Fallback search for "${query}" (libraryId: ${libraryId || 'all'})`);
  console.log(`Total icons available: ${icons.length}`);
  
  if (!query?.trim() || !icons.length) return { results: [], totalCount: 0 };
  
  // Filter icons by library if specified
  let filteredIcons = icons;
  if (libraryId && libraryId !== 'all') {
    filteredIcons = icons.filter(icon => {
      // Extract library from icon id (assuming format: libraryId-iconName or similar)
      const iconLibrary = icon.id.split('-')[0];
      return iconLibrary === libraryId;
    });
    console.log(`Filtered to ${filteredIcons.length} icons for library: ${libraryId}`);
  } else {
    console.log(`Searching all ${filteredIcons.length} icons (no library filter)`);
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Expand query with synonyms and extract words
  const expandedQueries = enableSynonyms ? 
    expandQueryWithSynonyms(normalizedQuery) : 
    [normalizedQuery];
  const queryWords = extractWords(normalizedQuery);
  
  const results: SearchResult[] = [];
  
  // Score all icons
  for (const icon of filteredIcons) {
    // Filter out icons with invalid svg data early
    if (!icon.svg) continue;
    
    const result = calculateIconScore(
      icon, 
      normalizedQuery, 
      expandedQueries, 
      queryWords, 
      options
    );
    
    if (result && result.score >= minScore) {
      results.push(result);
    }
  }
  
  // Sort by score (descending) and limit results
  const sortedResults = results
    .sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort by match quality
      if (a.matchDetails.exactMatch && !b.matchDetails.exactMatch) return -1;
      if (!a.matchDetails.exactMatch && b.matchDetails.exactMatch) return 1;
      
      // Tertiary sort by name length (shorter names first for exact matches)
      return a.icon.name.length - b.icon.name.length;
    });

  const totalCount = sortedResults.length;
  const limitedResults = sortedResults.slice(0, maxResults);
  
  // Track library attribution for debugging
  const libraryStats = new Map<string, number>();
  limitedResults.forEach(result => {
    const library = result.icon.id.split('-')[0];
    libraryStats.set(library, (libraryStats.get(library) || 0) + 1);
  });

  console.log(`✅ Fallback search results: ${limitedResults.length} icons (from ${totalCount} total matches)`);
  console.log('🏷️ Fallback Library Attribution:', Object.fromEntries(libraryStats));
  
  return {
    results: limitedResults.map(result => result.icon),
    totalCount 
  };
}