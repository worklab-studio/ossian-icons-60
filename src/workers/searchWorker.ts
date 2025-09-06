// Enhanced Web Worker for advanced icon search functionality
import { type IconItem } from '@/types/icon';
import { 
  fuzzyScore, 
  multiWordScore, 
  extractWords, 
  stem, 
  phoneticallyMatch 
} from '../lib/search-algorithms';
import { expandQueryWithSynonyms } from '../lib/search-synonyms';

interface SearchMessage {
  type: 'search' | 'index' | 'clear';
  seq?: number;
  query?: string;
  libraryId?: string;
  icons?: SearchableIcon[];
  options?: {
    fuzzy?: boolean;
    maxResults?: number;
    minScore?: number;
    enableSynonyms?: boolean;
    enablePhonetic?: boolean;
    libraryId?: string;
  };
}

// Simplified icon interface for search indexing (no SVG components)
interface SearchableIcon {
  id: string;
  name: string;
  tags?: string[];
  category?: string;
  style?: string;
}

interface SearchResult {
  icon: SearchableIcon;
  score: number;
  matchedFields: string[];
  matchDetails: {
    exactMatch: boolean;
    fuzzyMatch: boolean;
    synonymMatch: boolean;
    phoneticMatch: boolean;
  };
}

// Enhanced search index with performance optimizations
const searchIndex = new Map<string, {
  icons: SearchableIcon[];
  nameIndex: Map<string, SearchableIcon[]>;
  tagIndex: Map<string, SearchableIcon[]>;
  categoryIndex: Map<string, SearchableIcon[]>;
  stemIndex: Map<string, SearchableIcon[]>;
  popularityIndex: Map<string, number>;
}>();

// Search result cache with LRU eviction
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const MAX_CACHE_SIZE = 200;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

// Token-based word matching utility
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

// Calculate comprehensive search score for an icon
function calculateIconScore(
  icon: SearchableIcon, 
  originalQuery: string,
  expandedQueries: string[],
  queryWords: string[],
  options: SearchMessage['options'] = {}
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
  
  // Apply popularity boost (if available)
  const libraryId = icon.id.split('-')[0];
  const popularityKey = `${libraryId}-${icon.name.toLowerCase()}`;
  const popularityBoost = searchIndex.get(libraryId)?.popularityIndex?.get(popularityKey) || 0;
  bestScore += popularityBoost * 0.1;
  
  return bestScore > 0 ? {
    icon,
    score: bestScore,
    matchedFields: [...new Set(matchedFields)],
    matchDetails
  } : null;
}

// Build enhanced search index with stemming and popularity tracking
function buildIndex(libraryId: string, icons: SearchableIcon[]) {
  const nameIndex = new Map<string, SearchableIcon[]>();
  const tagIndex = new Map<string, SearchableIcon[]>();
  const categoryIndex = new Map<string, SearchableIcon[]>();
  const stemIndex = new Map<string, SearchableIcon[]>();
  const popularityIndex = new Map<string, number>();
  
  for (const icon of icons) {
    // Ensure consistent field normalization
    const normalizedName = (icon.name || '').toLowerCase();
    const normalizedTags = (icon.tags || []).map(tag => tag.toLowerCase());
    const normalizedCategory = (icon.category || '').toLowerCase();
    
    // Index by name words
    const nameWords = extractWords(normalizedName);
    for (const word of nameWords) {
      if (!nameIndex.has(word)) nameIndex.set(word, []);
      nameIndex.get(word)!.push(icon);
      
      // Add stemmed version
      const stemmed = stem(word);
      if (stemmed !== word) {
        if (!stemIndex.has(stemmed)) stemIndex.set(stemmed, []);
        stemIndex.get(stemmed)!.push(icon);
      }
    }
    
    // Index by tags with normalization
    for (const tag of normalizedTags) {
      if (!tagIndex.has(tag)) tagIndex.set(tag, []);
      tagIndex.get(tag)!.push(icon);
      
      // Index tag words
      const tagWords = extractWords(tag);
      for (const word of tagWords) {
        if (!tagIndex.has(word)) tagIndex.set(word, []);
        tagIndex.get(word)!.push(icon);
        
        // Add stemmed version
        const stemmed = stem(word);
        if (stemmed !== word) {
          if (!stemIndex.has(stemmed)) stemIndex.set(stemmed, []);
          stemIndex.get(stemmed)!.push(icon);
        }
      }
    }
    
    // Index by category
    if (normalizedCategory) {
      if (!categoryIndex.has(normalizedCategory)) categoryIndex.set(normalizedCategory, []);
      categoryIndex.get(normalizedCategory)!.push(icon);
      
      // Index category words
      const categoryWords = extractWords(normalizedCategory);
      for (const word of categoryWords) {
        if (!categoryIndex.has(word)) categoryIndex.set(word, []);
        categoryIndex.get(word)!.push(icon);
        
        // Add stemmed version
        const stemmed = stem(word);
        if (stemmed !== word) {
          if (!stemIndex.has(stemmed)) stemIndex.set(stemmed, []);
          stemIndex.get(stemmed)!.push(icon);
        }
      }
    }
    
    // Initialize popularity (can be updated later with usage data)
    const popularityKey = `${libraryId}-${normalizedName}`;
    popularityIndex.set(popularityKey, 0);
  }
  
  searchIndex.set(libraryId, {
    icons,
    nameIndex,
    tagIndex,
    categoryIndex,
    stemIndex,
    popularityIndex
  });
}

// Clear expired cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
  
  // Enforce cache size limit
  if (searchCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(searchCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      searchCache.delete(key);
    }
  }
}

// Enhanced search function with comprehensive scoring
function searchIcons(
  query: string, 
  options: {
    fuzzy?: boolean;
    maxResults?: number;
    minScore?: number;
    enableSynonyms?: boolean;
    enablePhonetic?: boolean;
    libraryId?: string;
  } = {}
): SearchResult[] {
  const {
    fuzzy = true,
    maxResults = 500,      // Reduced to prioritize best matches
    minScore = 8.0,        // Significantly increased for precision
    enableSynonyms = false, // Disabled by default for exact results
    enablePhonetic = true,
    libraryId
  } = options;
  
  if (!query?.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check cache first
  const cacheKey = `${normalizedQuery}-${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.results.slice(0, maxResults);
  }
  
  // Clean cache periodically
  if (Math.random() < 0.1) {
    cleanCache();
  }
  
  // Expand query with synonyms and extract words
  const expandedQueries = enableSynonyms ? 
    expandQueryWithSynonyms(normalizedQuery) : 
    [normalizedQuery];
  const queryWords = extractWords(normalizedQuery);
  
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  
  // Filter search by library if specified
  const librariesToSearch = libraryId && libraryId !== 'all' ? [libraryId] : Array.from(searchIndex.keys());
  
  // Search across specified libraries
  for (const currentLibraryId of librariesToSearch) {
    const index = searchIndex.get(currentLibraryId);
    if (!index) continue;
    
    const candidates = new Set<SearchableIcon>();
    
    // Collect candidates from all relevant indexes
    for (const expandedQuery of expandedQueries) {
      const normalizedExpanded = expandedQuery.toLowerCase();
      
      // Optimized index lookups for performance (exact/prefix only)
      for (const [key, icons] of index.nameIndex) {
        if (key === normalizedExpanded || (normalizedExpanded.length >= 3 && key.startsWith(normalizedExpanded))) {
          icons.forEach(icon => candidates.add(icon));
        }
      }
      
      for (const [key, icons] of index.tagIndex) {
        if (key === normalizedExpanded || (normalizedExpanded.length >= 3 && key.startsWith(normalizedExpanded))) {
          icons.forEach(icon => candidates.add(icon));
        }
      }
      
      for (const [key, icons] of index.categoryIndex) {
        if (key === normalizedExpanded || (normalizedExpanded.length >= 3 && key.startsWith(normalizedExpanded))) {
          icons.forEach(icon => candidates.add(icon));
        }
      }
      
      // Stem-based matching
      const queryWords = extractWords(normalizedExpanded);
      for (const word of queryWords) {
        const stemmed = stem(word);
        const stemmedIcons = index.stemIndex.get(stemmed);
        if (stemmedIcons) {
          stemmedIcons.forEach(icon => candidates.add(icon));
        }
      }
    }
    
    // Score all candidates
    for (const icon of candidates) {
      if (seen.has(icon.id)) continue;
      seen.add(icon.id);
      
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
    })
    .slice(0, maxResults);
  
  // Cache the results
  searchCache.set(cacheKey, {
    results: sortedResults,
    timestamp: Date.now()
  });
  
  return sortedResults;
}

// Handle messages from main thread
self.onmessage = function(event: MessageEvent<SearchMessage>) {
  const { type, seq, query, icons, libraryId, options } = event.data;
  
  try {
    switch (type) {
      case 'index':
        if (libraryId && icons) {
          buildIndex(libraryId, icons);
          self.postMessage({ 
            type: 'indexComplete', 
            seq,
            libraryId,
            success: true 
          });
        }
        break;
        
      case 'search':
        if (query !== undefined) {
          const results = searchIcons(query, { ...options, libraryId });
          // Calculate total count before limiting
          const totalCount = results.length;
          const limitedResults = results.slice(0, options?.maxResults || 1000);
          self.postMessage({ 
            type: 'searchResults', 
            seq,
            results: limitedResults.map(r => r.icon),
            totalCount,
            query,
            count: limitedResults.length
          });
        }
        break;
        
      case 'clear':
        if (libraryId) {
          searchIndex.delete(libraryId);
        } else {
          searchIndex.clear();
        }
        self.postMessage({ 
          type: 'clearComplete',
          seq,
          libraryId: libraryId || 'all'
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle worker errors
self.onerror = function(error: ErrorEvent) {
  self.postMessage({
    type: 'error',
    error: error.message || 'Worker error'
  });
};

export {}; // Make this a module