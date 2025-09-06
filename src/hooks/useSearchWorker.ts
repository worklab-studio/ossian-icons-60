import { useEffect, useRef, useCallback, useState } from 'react';
import { type IconItem } from '@/types/icon';

interface SearchWorkerHook {
  search: (query: string, options?: { maxResults?: number; fuzzy?: boolean; enableSynonyms?: boolean; enablePhonetic?: boolean; libraryId?: string }) => Promise<{ results: IconItem[]; totalCount: number }>;
  indexLibrary: (libraryId: string, icons: IconItem[]) => Promise<void>;
  clearIndex: (libraryId?: string) => Promise<void>;
  isReady: boolean;
  isSearching: boolean;
}

export function useSearchWorker(): SearchWorkerHook {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const seqRef = useRef(0);
  const pendingCallbacks = useRef<Map<number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>>(new Map());

  // Initialize worker
  useEffect(() => {
    try {
      // Create worker from the search worker file
      workerRef.current = new Worker(
        new URL('@/workers/searchWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { type, seq, libraryId, results, query, success, error } = event.data;
        
        if (error) {
          console.error('Search worker error:', error);
          // Reject all pending promises
          for (const [, callbacks] of pendingCallbacks.current) {
            callbacks.reject(new Error(error));
          }
          pendingCallbacks.current.clear();
          return;
        }

        switch (type) {
          case 'indexComplete':
            const indexCallbacks = pendingCallbacks.current.get(seq);
            if (indexCallbacks) {
              indexCallbacks.resolve(success);
              pendingCallbacks.current.delete(seq);
            }
            break;

          case 'searchResults':
            setIsSearching(false);
            const searchCallbacks = pendingCallbacks.current.get(seq);
            if (searchCallbacks) {
              // Map worker results back to original icons with React components
              const mappedResults = (results || []).map((workerIcon: any) => {
                // Find original icon across all libraries
                for (const [, iconMap] of originalIconsRef.current) {
                  const originalIcon = iconMap.get(workerIcon.id);
                  if (originalIcon) {
                    return originalIcon;
                  }
                }
                return workerIcon; // Fallback if not found
              }).filter((icon: IconItem) => icon.svg); // Filter out any invalid results
              
              const { totalCount = mappedResults.length } = event.data;
              searchCallbacks.resolve({ results: mappedResults, totalCount });
              pendingCallbacks.current.delete(seq);
            }
            break;

          case 'clearComplete':
            const clearCallbacks = pendingCallbacks.current.get(seq);
            if (clearCallbacks) {
              // Clear stored icons for this library
              if (libraryId) {
                originalIconsRef.current.delete(libraryId);
              } else {
                originalIconsRef.current.clear();
              }
              clearCallbacks.resolve(true);
              pendingCallbacks.current.delete(seq);
            }
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Search worker error:', error);
        setIsReady(false);
        // Reject all pending promises
        for (const [, callbacks] of pendingCallbacks.current) {
          callbacks.reject(error);
        }
        pendingCallbacks.current.clear();
      };

      setIsReady(true);
    } catch (error) {
      console.warn('Search worker not available, falling back to main thread search');
      setIsReady(false);
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingCallbacks.current.clear();
      setIsReady(false);
    };
  }, []);

  // Search function
  const search = useCallback(async (
    query: string, 
    options: { maxResults?: number; fuzzy?: boolean; enableSynonyms?: boolean; enablePhonetic?: boolean; libraryId?: string } = {}
  ): Promise<{ results: IconItem[]; totalCount: number }> => {
    if (!workerRef.current || !isReady || !query.trim()) {
      return { results: [], totalCount: 0 };
    }

    setIsSearching(true);
    
    return new Promise((resolve, reject) => {
      const seq = ++seqRef.current;
      pendingCallbacks.current.set(seq, { resolve, reject });
      
      // Send search message with conservative options
      workerRef.current!.postMessage({
        type: 'search',
        seq,
        query: query.trim(),
        libraryId: options.libraryId,
        options: {
          maxResults: 1000, // Conservative limit for performance
          fuzzy: true,
          enableSynonyms: false, // Conservative default
          enablePhonetic: false, // Conservative default
          minScore: 8.0, // Higher threshold for precision
          ...options
        }
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        if (pendingCallbacks.current.has(seq)) {
          pendingCallbacks.current.delete(seq);
          setIsSearching(false);
          reject(new Error('Search timeout'));
        }
      }, 5000); // 5 second timeout
    });
  }, [isReady]);

  // Store original icons for mapping search results back
  const originalIconsRef = useRef<Map<string, Map<string, IconItem>>>(new Map());

  // Index library function - send only searchable metadata to worker
  const indexLibrary = useCallback(async (libraryId: string, icons: IconItem[]): Promise<void> => {
    if (!workerRef.current || !isReady) {
      return Promise.resolve();
    }

    // Store original icons for result mapping
    const iconMap = new Map<string, IconItem>();
    const serializableIcons = icons
      .filter(icon => icon.svg) // Only include icons with valid svg
      .map(icon => {
        iconMap.set(icon.id, icon); // Store original icon
        return {
          id: icon.id,
          name: icon.name,
          tags: icon.tags || [],
          category: icon.category || '',
          style: icon.style || ''
          // No SVG data sent to worker - only searchable metadata
        };
      });
    
    originalIconsRef.current.set(libraryId, iconMap);

    return new Promise((resolve, reject) => {
      const seq = ++seqRef.current;
      pendingCallbacks.current.set(seq, { resolve, reject });
      
      // Send index message with only searchable metadata
      workerRef.current!.postMessage({
        type: 'index',
        seq,
        libraryId,
        icons: serializableIcons
      });

      // Set timeout
      setTimeout(() => {
        if (pendingCallbacks.current.has(seq)) {
          pendingCallbacks.current.delete(seq);
          reject(new Error('Index timeout'));
        }
      }, 10000); // 10 second timeout for indexing
    });
  }, [isReady]);

  // Clear index function
  const clearIndex = useCallback(async (libraryId?: string): Promise<void> => {
    if (!workerRef.current || !isReady) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const seq = ++seqRef.current;
      pendingCallbacks.current.set(seq, { resolve, reject });
      
      // Send clear message
      workerRef.current!.postMessage({
        type: 'clear',
        seq,
        libraryId
      });

      // Set timeout
      setTimeout(() => {
        if (pendingCallbacks.current.has(seq)) {
          pendingCallbacks.current.delete(seq);
          reject(new Error('Clear timeout'));
        }
      }, 3000); // 3 second timeout
    });
  }, [isReady]);

  return {
    search,
    indexLibrary,
    clearIndex,
    isReady,
    isSearching
  };
}