import { useState, useEffect, useCallback } from 'react';
import { type IconItem, type LibrarySection } from '@/types/icon';
import { iconLibraryManager } from '@/services/IconLibraryManager';

interface UseAsyncIconLibraryState {
  icons: IconItem[];
  sections: LibrarySection[]; // For sectioned "all" view
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  loaded: boolean;
}

interface UseAsyncIconLibraryReturn extends UseAsyncIconLibraryState {
  loadLibrary: (libraryId: string) => Promise<void>;
  loadLibraryProgressive: (libraryId: string) => Promise<void>;
  loadAllLibraries: () => Promise<void>;
  loadAllLibrariesSectioned: () => Promise<void>;
  loadAllLibrariesSectionedProgressive: () => Promise<void>;
  searchIcons: (query: string, libraryIds?: string[]) => IconItem[];
  clearError: () => void;
}

export function useAsyncIconLibrary(): UseAsyncIconLibraryReturn {
  const [state, setState] = useState<UseAsyncIconLibraryState>({
    icons: [],
    sections: [],
    loading: false,
    backgroundLoading: false,
    error: null,
    loaded: false
  });

  // Load a specific library
  const loadLibrary = useCallback(async (libraryId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const icons = await iconLibraryManager.loadLibrary(libraryId);
      setState({
        icons,
        sections: [], // Reset sections for single library view
        loading: false,
        backgroundLoading: false,
        error: null,
        loaded: true
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load library',
        loaded: false
      }));
    }
  }, []);

  // Load all libraries
  const loadAllLibraries = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const icons = await iconLibraryManager.loadAllLibraries();
      setState({
        icons,
        sections: [],
        loading: false,
        backgroundLoading: false,
        error: null,
        loaded: true
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load libraries',
        loaded: false
      }));
    }
  }, []);

  // Load a library progressively
  const loadLibraryProgressive = useCallback(async (libraryId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { initialBatch, loadRemaining } = await iconLibraryManager.loadLibraryProgressive(libraryId, 100);
      
      // Show initial batch immediately
      setState({
        icons: initialBatch,
        sections: [],
        loading: false,
        backgroundLoading: true,
        error: null,
        loaded: true
      });

      // Load remaining icons in background
      const allIcons = await loadRemaining();
      setState(prev => ({
        ...prev,
        icons: allIcons,
        backgroundLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        backgroundLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load library',
        loaded: false
      }));
    }
  }, []);

  // Load all libraries sectioned (for "All Icons" view with headers)
  const loadAllLibrariesSectioned = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const sections = await iconLibraryManager.loadAllLibrariesGrouped();
      // Also create flat array for search compatibility
      const allIcons = sections.flatMap(section => section.icons);
      
      setState({
        icons: allIcons,
        sections,
        loading: false,
        backgroundLoading: false,
        error: null,
        loaded: true
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        backgroundLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load libraries',
        loaded: false
      }));
    }
  }, []);

  // Load all libraries sectioned progressively
  const loadAllLibrariesSectionedProgressive = useCallback(async () => {
    // Start with loaded: true immediately for instant display
    setState(prev => ({ ...prev, loading: false, error: null, loaded: true }));
    
    try {
      const { initialSections, loadRemaining } = await iconLibraryManager.loadAllLibrariesSectionedProgressive(120);
      // Also create flat array for search compatibility
      const initialIcons = initialSections.flatMap(section => section.icons);
      
      // Show initial batch immediately (no loading state)
      setState(prev => ({
        ...prev,
        icons: initialIcons,
        sections: initialSections,
        backgroundLoading: true,
        error: null,
        loaded: true
      }));

      // Load remaining sections in background
      const allSections = await loadRemaining();
      const allIcons = allSections.flatMap(section => section.icons);
      
      setState(prev => ({
        ...prev,
        icons: allIcons,
        sections: allSections,
        backgroundLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        backgroundLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load libraries',
        loaded: false
      }));
    }
  }, []);

  // Search icons (only in loaded libraries)
  const searchIcons = useCallback((query: string, libraryIds?: string[]): IconItem[] => {
    return iconLibraryManager.searchIcons(query, libraryIds);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadLibrary,
    loadLibraryProgressive,
    loadAllLibraries,
    loadAllLibrariesSectioned,
    loadAllLibrariesSectionedProgressive,
    searchIcons,
    clearError
  };
}

// Hook for multiple libraries
export function useMultipleIconLibraries(libraryIds: string[]) {
  const [state, setState] = useState<{
    librariesMap: Map<string, IconItem[]>;
    loading: boolean;
    error: string | null;
    loadedLibraries: Set<string>;
  }>({
    librariesMap: new Map(),
    loading: false,
    error: null,
    loadedLibraries: new Set()
  });

  const loadLibraries = useCallback(async (ids: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const librariesMap = await iconLibraryManager.loadLibraries(ids);
      setState({
        librariesMap,
        loading: false,
        error: null,
        loadedLibraries: new Set(ids)
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load libraries'
      }));
    }
  }, []);

  // Auto-load when libraryIds change
  useEffect(() => {
    if (libraryIds.length > 0) {
      loadLibraries(libraryIds);
    }
  }, [libraryIds, loadLibraries]);

  return {
    ...state,
    loadLibraries
  };
}

// Hook for library metadata (synchronous)
export function useIconLibraryMetadata() {
  return {
    libraries: iconLibraryManager.libraries,
    totalCount: iconLibraryManager.libraries.reduce((sum, lib) => sum + lib.count, 0)
  };
}