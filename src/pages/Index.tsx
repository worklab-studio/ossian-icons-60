import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { SectionedIconGrid } from "@/components/icon-grid/SectionedIconGrid";
import { ControlPanel } from "@/components/control-panel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { IconCustomizationProvider, useIconCustomization } from "@/contexts/IconCustomizationContext";
import { type IconItem } from "@/types/icon";
import { sortIconsByStyleThenName } from "@/lib/icon-utils";
import { toast } from "@/hooks/use-toast";
import { useAsyncIconLibrary, useIconLibraryMetadata } from "@/hooks/useAsyncIconLibrary";
import { useSearchWorker } from "@/hooks/useSearchWorker";
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser";
import { useVisitedUser } from "@/hooks/useVisitedUser";
import { showFirstCopyNudge } from "@/components/ui/first-copy-nudge";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingWithTagline from "@/components/LoadingWithTagline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { type LibrarySection } from "@/types/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileLibraryDrawer } from "@/components/mobile/MobileLibraryDrawer";
import { MobileCustomizeSheet } from "@/components/mobile/MobileCustomizeSheet";
import { MobileIconActions } from "@/components/mobile/MobileIconActions";
import { HapticsManager } from "@/lib/haptics";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useSchemaMarkup } from "@/hooks/useSchemaMarkup";

function IconGridPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IconItem[]>([]);
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [minDurationComplete, setMinDurationComplete] = useState(true);
  const { customization } = useIconCustomization();

  // Mobile state
  const isMobile = useIsMobile();
  const [showLibraryDrawer, setShowLibraryDrawer] = useState(false);
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);
  const [showIconActions, setShowIconActions] = useState(false);

  // Default to loading all libraries
  const primaryLibrary = 'lucide';

  // Visited user state for simple loading
  const { shouldSkipLoading, markLoadingSeen } = useVisitedUser();
  
  // Async icon loading
  const { 
    icons, 
    sections,
    loading, 
    backgroundLoading,
    error, 
    loaded,
    loadLibrary, 
    loadLibraryProgressive,
    loadAllLibraries,
    loadAllLibrariesSectioned,
    loadAllLibrariesSectionedProgressive,
    clearError 
  } = useAsyncIconLibrary();
  
  // Library metadata for total counts
  const { libraries, totalCount } = useIconLibraryMetadata();

  // Schema.org markup for SEO - defined after totalCount is available
  const { schemaMarkup } = useSchemaMarkup({
    totalIcons: totalCount,
    includeFAQ: true
  });
  
  // Search worker
  const { 
    search, 
    indexLibrary, 
    isReady: searchReady, 
    isSearching 
  } = useSearchWorker();

  // Test library searches on component mount for debugging
  useEffect(() => {
    const testLibrarySearches = async () => {
      if (search && searchReady && loaded) {
        console.log('🧪 Testing individual library searches...');
        
        // Test Fluent UI specifically first
        console.log('\n🔍 Testing Fluent UI library loading...');
        try {
          await loadLibrary('fluent-ui');
          const fluentResult = await search('access', { 
            maxResults: 10, 
            libraryId: 'fluent-ui',
            fuzzy: true 
          });
          console.log(`📊 Fluent UI search for "access": ${fluentResult.results.length} results`);
          if (fluentResult.results.length > 0) {
            console.log(`✅ First Fluent UI result:`, fluentResult.results[0]);
          } else {
            console.warn(`❌ No Fluent UI results found for "access"`);
          }
        } catch (error) {
          console.error('❌ Failed to test Fluent UI:', error);
        }
        
        // Test search in each library
        const testQueries = ['pen', 'home', 'user'];
        const testLibraries = ['feather', 'tabler', 'lucide', 'solar', 'fluent-ui'];
        
        for (const library of testLibraries) {
          for (const query of testQueries) {
            try {
              console.log(`\n🔍 Testing: "${query}" in ${library} library`);
              const result = await search(query, { 
                maxResults: 20, 
                libraryId: library,
                fuzzy: true 
              });
              console.log(`📊 ${library}/${query}: ${result.results.length} results (total: ${result.totalCount})`);
              
              // Verify all results are from the correct library (handle hyphenated names)
              const misattributed = result.results.filter(icon => {
                if (library.includes('-')) {
                  return !icon.id.startsWith(library + '-');
                }
                return !icon.id.startsWith(library + '-');
              });
              if (misattributed.length > 0) {
                console.warn(`⚠️ Misattributed icons in ${library}:`, misattributed.map(i => i.id));
              }
            } catch (error) {
              console.error(`❌ Error testing ${library}/${query}:`, error);
            }
          }
        }
      }
    };

    // Only run tests once when ready - force run for debugging
    if (searchReady && loaded && search) {
      // Clear the test flag to force re-run
      localStorage.removeItem('library-search-tested');
      if (!localStorage.getItem('library-search-tested')) {
        testLibrarySearches();
        localStorage.setItem('library-search-tested', 'true');
      }
    }
  }, [search, searchReady, loaded]);

  // Control loading animation visibility - smart loading based on cache
  useEffect(() => {
    if (shouldSkipLoading) {
      // Skip loading for returning users with cached data
      setShowLoadingAnimation(false);
      setMinDurationComplete(true);
    } else {
      // Show loading for first-time users or users without cache
      setShowLoadingAnimation(true);
    }
  }, [shouldSkipLoading]);

  // Hide loading animation when both conditions are met
  useEffect(() => {
    if (loaded && minDurationComplete && showLoadingAnimation) {
      console.log('Hiding loading animation - icons loaded and minimum duration complete');
      setShowLoadingAnimation(false);
      markLoadingSeen();
    }
  }, [loaded, minDurationComplete, showLoadingAnimation, markLoadingSeen]);

  // Fallback timeout removed - just keep loading until ready

  // Load icons based on selected set - consolidated loading logic
  useEffect(() => {
    const loadIcons = async () => {
      try {
        console.log(`Loading icons for: ${selectedSet}`);
        
        if (selectedSet === "all") {
          console.log('Loading all libraries sectioned...');
          await loadAllLibrariesSectioned();
        } else {
          console.log(`🚀 Loading library: ${selectedSet}`);
          await loadLibrary(selectedSet);
          console.log(`✅ Completed loading: ${selectedSet}`);
        }
        
        console.log(`Successfully loaded icons for: ${selectedSet}`, {
          iconsCount: icons.length,
          sectionsCount: sections.length,
          loaded
        });
      } catch (error) {
        console.error(`❌ Failed to load library: ${selectedSet}`, error);
        // Error is handled by the hook's internal error state
      }
    };
    
    loadIcons();
  }, [loadLibrary, loadAllLibrariesSectioned, selectedSet]);

  // Index loaded icons for search - with proper library separation for "all"
  useEffect(() => {
    if (loaded && searchReady) {
      const indexIcons = async () => {
        try {
          if (selectedSet === "all" && sections.length > 0) {
            // Index each library separately when showing all icons
            console.log('Indexing all libraries separately for comprehensive search...');
            for (const section of sections) {
              if (section.icons.length > 0) {
                console.log(`Indexing ${section.libraryId} with ${section.icons.length} icons`);
                await indexLibrary(section.libraryId, section.icons);
              }
            }
            console.log(`Successfully indexed ${sections.length} libraries for search`);
          } else if (icons.length > 0) {
            // Index single library
            console.log(`Indexing ${selectedSet} with ${icons.length} icons`);
            await indexLibrary(selectedSet, icons);
          }
        } catch (error) {
          console.error('Failed to index icons for search:', error);
          // Search will fall back to client-side search automatically
        }
      };
      
      indexIcons();
    }
  }, [loaded, icons, sections, searchReady, selectedSet, indexLibrary]);

  // Get the selected icon object
  const selectedIcon = useMemo(() => {
    if (!selectedId) return null;
    
    // First check search results if we're currently searching
    if (searchQuery.trim() && searchResults.length > 0) {
      const searchIcon = searchResults.find(icon => icon.id === selectedId);
      if (searchIcon) return searchIcon;
    }
    
    // Then check the main icons array
    return icons.find(icon => icon.id === selectedId) || null;
  }, [selectedId, icons, searchResults, searchQuery]);

  // Handle search with worker or fallback
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchTotalCount(0);
      return;
    }

    const performSearch = async () => {
      console.log(`🔍 Starting search for "${searchQuery}" in ${selectedSet}`);
      console.log(`Search ready: ${searchReady}, Loaded: ${loaded}`);
      console.log(`Available icons: ${icons.length}`);
      
      if (selectedSet === 'all' && sections.length > 0) {
        const totalIconsInSections = sections.reduce((total, section) => total + section.icons.length, 0);
        console.log(`Total icons in sections: ${totalIconsInSections}`);
        console.log(`Sections breakdown:`, sections.map(s => `${s.libraryId}: ${s.icons.length}`));
      }

      try {
        // Try worker search with conservative options including library filter
        if (searchReady && loaded) {
          console.log('🤖 Using worker search');
          const searchResult = await search(searchQuery, {
            maxResults: 1000, // Conservative limit for performance
            fuzzy: true,
            enableSynonyms: false, // Conservative default
            enablePhonetic: false, // Conservative default
            // Don't pass libraryId for "all" - let worker search across all indexed libraries
            libraryId: selectedSet !== 'all' ? selectedSet : undefined
          });
          // Filter out any invalid results
          const validResults = searchResult.results.filter(icon => icon && icon.svg);
          
          // Validate library attribution
          const libraryValidation = new Map<string, { expected: string, actual: string, count: number }>();
          validResults.forEach(icon => {
            const expectedLibrary = icon.id.split('-')[0];
            const actualLibrary = sections.find(section => 
              section.icons.some(sectionIcon => sectionIcon.id === icon.id)
            )?.libraryId || 'unknown';
            
            const key = `${expectedLibrary}->${actualLibrary}`;
            const current = libraryValidation.get(key) || { expected: expectedLibrary, actual: actualLibrary, count: 0 };
            libraryValidation.set(key, { ...current, count: current.count + 1 });
          });

          console.log(`✅ Worker search results: ${validResults.length} valid icons (total: ${searchResult.totalCount})`);
          console.log('🏷️ Library Attribution Validation:', Object.fromEntries(libraryValidation));
          setSearchResults(validResults);
          setSearchTotalCount(searchResult.totalCount);
        } else if (loaded) {
          console.log('🔄 Using fallback search');
          // Enhanced fallback search when worker isn't ready
          const { fallbackSearch } = await import('@/lib/fallback-search');
          const fallbackResult = fallbackSearch(icons, searchQuery, {
            fuzzy: true,
            maxResults: 1000, // Conservative limit for performance
            minScore: 8.0, // Higher threshold for precision
            enableSynonyms: false, // Conservative default
            enablePhonetic: false, // Conservative default
            libraryId: selectedSet !== 'all' ? selectedSet : undefined // Only filter if specific library selected
          });
          setSearchResults(fallbackResult.results);
          setSearchTotalCount(fallbackResult.totalCount);
        }
      } catch (error) {
        console.warn('Worker search failed, using fallback:', error);
        // Always fallback to client-side search on any error
        const { fallbackSearch } = await import('@/lib/fallback-search');
        const fallbackResult = fallbackSearch(icons, searchQuery, {
          fuzzy: true,
          maxResults: 1000, // Conservative limit for performance
          minScore: 8.0, // Higher threshold for precision
          enableSynonyms: false, // Conservative default
          enablePhonetic: false, // Conservative default
          libraryId: selectedSet !== 'all' ? selectedSet : undefined // Only filter if specific library selected
        });
        setSearchResults(fallbackResult.results);
        setSearchTotalCount(fallbackResult.totalCount);
      }
    };

    performSearch();
  }, [searchQuery, search, searchReady, loaded, icons, selectedSet]);

  // Get current icon set to display
  const currentIcons = useMemo(() => {
    if (searchQuery.trim()) {
      // Filter search results to only include icons with valid svg data
      return searchResults.filter(icon => icon.svg !== undefined && icon.svg !== null);
    }
    // Filter out icons that don't have valid svg data
    return icons.filter(icon => icon.svg !== undefined && icon.svg !== null);
  }, [searchQuery, searchResults, icons]);


  // Get available categories from current icon set
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    currentIcons.forEach(icon => {
      if (icon.category) categories.add(icon.category);
    });
    return Array.from(categories).sort();
  }, [currentIcons]);

  // Filter by category and sort to show outline icons first
  const displayedIcons = useMemo(() => {
    let filtered = currentIcons;
    
    if (selectedCategory) {
      filtered = filtered.filter(icon => icon.category === selectedCategory);
    }
    
    // Sort to show stroke/outline icons first, then filled/solid icons
    return sortIconsByStyleThenName(filtered);
  }, [currentIcons, selectedCategory]);

  // Group search results by library for sectioned display when searching "all icons"
  const groupedSearchSections = useMemo(() => {
    if (!searchQuery.trim() || selectedSet !== "all" || searchResults.length === 0) {
      return [];
    }
    
    console.log(`🔍 Grouping ${searchResults.length} search results for "all icons" view...`);

    // Group icons by library ID
    const iconsByLibrary = new Map<string, IconItem[]>();
    
    searchResults.forEach(icon => {
      // Extract library ID from icon ID, handling hyphenated library names
      let libraryId: string | null = null;
      
      // Check against all registered libraries to find the correct match
      for (const libraryMeta of iconLibraryManager.libraries) {
        if (icon.id.startsWith(`${libraryMeta.id}-`)) {
          libraryId = libraryMeta.id;
          break;
        }
      }
      
      // Fallback: if no library matches, extract first part
      if (!libraryId) {
        libraryId = icon.id.split('-')[0];
        console.warn(`⚠️ No matching library found for icon: ${icon.id}, using fallback: ${libraryId}`);
      }
      
      // Add icon to the appropriate library group
      if (libraryId) {
        if (!iconsByLibrary.has(libraryId)) {
          iconsByLibrary.set(libraryId, []);
        }
        iconsByLibrary.get(libraryId)!.push(icon);
      }
    });

    // Create sections in the same order as defined in IconLibraryManager
    const orderedSections: LibrarySection[] = [];
    
    iconLibraryManager.libraries.forEach(libraryMeta => {
      const libraryIcons = iconsByLibrary.get(libraryMeta.id);
      if (libraryIcons && libraryIcons.length > 0) {
        // Filter by category if selected
        let filteredIcons = libraryIcons;
        if (selectedCategory) {
          filteredIcons = libraryIcons.filter(icon => icon.category === selectedCategory);
        }
        
        if (filteredIcons.length > 0) {
          // Sort icons within each library (stroke/outline icons first, then filled/solid)
          const sortedIcons = sortIconsByStyleThenName(filteredIcons);
          
          orderedSections.push({
            libraryId: libraryMeta.id,
            libraryName: libraryMeta.name,
            icons: sortedIcons
          });
        }
      }
    });

    console.log(`📊 Grouped search results into ${orderedSections.length} library sections:`, 
      orderedSections.map(s => `${s.libraryName}: ${s.icons.length} icons`));
    
    return orderedSections;
  }, [searchQuery, selectedSet, searchResults, selectedCategory]);

  // Apply category filtering to sections when showing "all icons" without search
  const filteredSections = useMemo(() => {
    if (selectedSet !== "all" || searchQuery.trim() || !selectedCategory) {
      return sections;
    }

    // Filter sections to only include icons matching the selected category
    return sections.map(section => ({
      ...section,
      icons: section.icons.filter(icon => icon.category === selectedCategory)
    })).filter(section => section.icons.length > 0); // Remove empty sections
  }, [sections, selectedSet, searchQuery, selectedCategory]);

  // Reset category when library changes
  React.useEffect(() => {
    setSelectedCategory(null);
  }, [selectedSet]);

  const { isFirstCopy, markFirstCopyComplete, getKeyboardShortcut } = useFirstTimeUser();

  const handleCopy = (icon: IconItem) => {
    setSelectedId(icon.id);
    
    // Show first copy nudge if this is their first copy
    if (isFirstCopy) {
      showFirstCopyNudge({ keyboardShortcut: getKeyboardShortcut() });
      markFirstCopyComplete();
    } else {
      toast({
        description: `${icon.name} icon copied to clipboard!`,
        duration: 2000,
      });
    }
  };

  const handleIconClick = (icon: IconItem) => {
    if (isMobile) {
      // On mobile, select and show actions sheet
      setSelectedId(icon.id);
      setShowIconActions(true);
    } else {
      // Desktop behavior: toggle selection
      setSelectedId(prevId => prevId === icon.id ? null : icon.id);
    }
  };

  const handleMobileSetChange = (setId: string) => {
    // Trigger selection haptic feedback when changing library
    HapticsManager.selection();
    setSelectedSet(setId);
    setShowLibraryDrawer(false);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <div className="flex flex-col h-screen w-full">
          {/* Fixed top header - non-scrollable */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-background">
            <MobileHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery("")}
              onCustomizeClick={() => setShowCustomizeSheet(true)}
              onLibraryClick={() => setShowLibraryDrawer(true)}
            />

            {/* Mobile Library Header */}
            <div 
              className="border-b px-4 py-3 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors"
              onClick={() => {
                const mainElement = document.querySelector('main');
                if (mainElement) {
                  mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <h1 className="text-lg font-semibold">
                {selectedSet === "all" ? "All Icons" : 
                 selectedSet === "lucide" ? "Lucide Icons" :
                 selectedSet === "pixelart" ? "Pixel Art Icons" :
                 selectedSet === "hugeicon" ? "Huge Icons" :
                 selectedSet === "mingcute" ? "Mingcute Icons" :
                 selectedSet === "heroicons" ? "Heroicons" :
                 selectedSet === "material" ? "Material Design Icons" :
                 selectedSet === "fluent-ui" ? "Fluent UI Icons" :
                 "Icons"}
                {searchQuery && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({searchTotalCount > 0 ? searchTotalCount.toLocaleString() : '0'} results)
                  </span>
                )}
              </h1>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSet === "all" ? 
                    `${totalCount.toLocaleString()} icons across all libraries` :
                    `${displayedIcons.length.toLocaleString()} icons`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Content area with top padding to account for fixed header */}
          <main className="flex-1 overflow-auto pt-32">
            {showLoadingAnimation ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <LoadingWithTagline 
                  minDuration={3000}
                  onMinDurationComplete={() => setMinDurationComplete(true)}
                />
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-center px-6">
                <Alert className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="mt-2">
                    <p className="font-medium">Failed to load icons</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <button
                      onClick={clearError}
                      className="mt-3 text-sm text-primary hover:text-primary/80 underline"
                    >
                      Try again
                    </button>
                  </AlertDescription>
                </Alert>
              </div>
            ) : displayedIcons.length === 0 && !loading ? (
              <div className="flex h-64 items-center justify-center text-center px-6">
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    {selectedSet === "favorites" ? "No favorites yet" : 
                     searchQuery ? "No icons found" : "No icons available"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSet === "favorites" 
                      ? "Tap library menu to browse icons"
                      : searchQuery
                      ? "Try a different search term"
                      : "Tap library menu to select icons"
                    }
                  </p>
                </div>
              </div>
            ) : (
              // Mobile icon grid
              (selectedSet === "all" && !searchQuery.trim() && sections.length > 0) || 
              (selectedSet === "all" && searchQuery.trim() && groupedSearchSections.length > 0) ? (
                <SectionedIconGrid
                  sections={searchQuery.trim() ? groupedSearchSections : sections}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                />
              ) : (
                <IconGrid
                  items={displayedIcons}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                />
              )
            )}
          </main>
        </div>

        {/* Mobile drawers and sheets */}
        <MobileLibraryDrawer
          isOpen={showLibraryDrawer}
          onClose={() => setShowLibraryDrawer(false)}
          selectedSet={selectedSet}
          onSetChange={handleMobileSetChange}
        />
        
        <MobileCustomizeSheet
          isOpen={showCustomizeSheet}
          onClose={() => setShowCustomizeSheet(false)}
        />
        
        <MobileIconActions
          isOpen={showIconActions}
          onClose={() => setShowIconActions(false)}
          selectedIcon={selectedIcon}
        />
      </>
    );
  }
  
  // Desktop layout
  return (
    <>
      <Helmet>
        <title>Iconstack – 50,000+ Free SVG Icons</title>
        <meta 
          name="description" 
          content="Stop hunting icons. Start shipping designs. Iconstack brings you 50,000+ free SVG icons – download, copy, and use instantly. MIT licensed." 
        />
        <meta name="keywords" content="icons, svg, free icons, web development, ui design, icon library, open source, mit license" />
        <link rel="canonical" href="https://iconstack.io" />
      </Helmet>
      
      <SchemaMarkup schema={schemaMarkup} />
      
      <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">{/* Fixed viewport height */}
        <AppSidebar 
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
        />
        
        <div className="flex-1 flex flex-col h-screen">{/* Fixed layout container */}
          <Header 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchClear={() => setSearchQuery("")}
          />
          
          {/* Fixed header with padding */}
          <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-background">
            <div className="space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">
                     {selectedSet === "all" ? "All icons" : 
                     selectedSet === "favorites" ? "Favorites" : 
                     selectedSet === "material" ? "Material Design Icons" :
                     selectedSet === "fluent-ui" ? "Fluent UI Icons" :
                     selectedSet === "animated" ? "Animated Icons" :
                     selectedSet === "lucide" ? "Lucide Icons" :
                     selectedSet === "feather" ? "Feather Icons" :
                     selectedSet === "phosphor" ? "Phosphor Icons" :
                     selectedSet === "tabler" ? "Tabler Icons" :
                     selectedSet === "bootstrap" ? "Bootstrap Icons" :
                     selectedSet === "remix" ? "Remix Icons" :
                     selectedSet === "boxicons" ? "Boxicons" :
                     selectedSet === "css-gg" ? "CSS.GG Icons" :
                     selectedSet === "iconsax" ? "Iconsax Icons" :
                        selectedSet === "solar" ? "Solar Icons" :
                        selectedSet === "phosphor" ? "Phosphor Icons" :
                         selectedSet === "bootstrap" ? "Bootstrap Icons" :
                         selectedSet === "radix" ? "Radix Icons" :
                          selectedSet === "line" ? "Line Icons" :
                           selectedSet === "pixelart" ? "Pixel Art Icons" :
                            selectedSet === "hugeicon" ? "Huge Icons" :
                             selectedSet === "mingcute" ? "Mingcute Icons" :
                             selectedSet === "heroicons" ? "Heroicons" :
                           selectedSet.charAt(0).toUpperCase() + selectedSet.slice(1)}
                  </h2>
                   <p className="text-sm text-muted-foreground">
                      {searchQuery && searchTotalCount > (groupedSearchSections.length > 0 ? groupedSearchSections.reduce((total, section) => total + section.icons.length, 0) : displayedIcons.length) ? (
                        <>
                          Showing {groupedSearchSections.length > 0 ? groupedSearchSections.reduce((total, section) => total + section.icons.length, 0).toLocaleString() : displayedIcons.length.toLocaleString()} of {searchTotalCount.toLocaleString()} icons matching "{searchQuery}"
                          {selectedCategory && ` in ${selectedCategory}`}
                        </>
                      ) : searchQuery ? (
                        <>
                          {groupedSearchSections.length > 0 ? groupedSearchSections.reduce((total, section) => total + section.icons.length, 0).toLocaleString() : displayedIcons.length.toLocaleString()} icons matching "{searchQuery}"
                          {selectedCategory && ` in ${selectedCategory}`}
                        </>
                      ) : (
                        <>
                          {(() => {
                            if (selectedSet === "all") return totalCount.toLocaleString();
                            if (selectedSet === "animated") {
                              const animatedLib = libraries.find(lib => lib.id === "animated");
                              return animatedLib ? animatedLib.count.toLocaleString() : "0";
                            }
                            const selectedLib = libraries.find(lib => lib.id === selectedSet);
                            return selectedLib ? selectedLib.count.toLocaleString() : "0";
                          })()} icons
                          {selectedCategory && ` in ${selectedCategory}`}
                        </>
                      )}
                    </p>
                </div>
                
                <div className="flex items-center">
                  <CategoryFilter 
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable main content */}
          <main className="flex-1 overflow-hidden">
            {showLoadingAnimation ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <LoadingWithTagline 
                  minDuration={3000}
                  onMinDurationComplete={() => setMinDurationComplete(true)}
                />
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading icons...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-center px-6">
                <Alert className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="mt-2">
                    <p className="font-medium">Failed to load icons</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <button
                      onClick={clearError}
                      className="mt-3 text-sm text-primary hover:text-primary/80 underline"
                    >
                      Try again
                    </button>
                  </AlertDescription>
                </Alert>
              </div>
            ) : displayedIcons.length === 0 && !loading ? (
              <div className="flex h-64 items-center justify-center text-center px-6">
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    {selectedSet === "favorites" ? "No favorites yet" : 
                     searchQuery ? "No icons found" : "No icons available"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSet === "favorites" 
                      ? "Star some icons to see them here"
                      : searchQuery
                      ? `Try a different search term or select a different library`
                      : "Select a library from the sidebar to get started"
                    }
                  </p>
                </div>
              </div>
            ) : (
              // Use SectionedIconGrid for: 1) "all icons" without search, OR 2) "all icons" with search results
              (selectedSet === "all" && !searchQuery.trim() && filteredSections.length > 0) ||
               (selectedSet === "all" && searchQuery.trim() && groupedSearchSections.length > 0) ? (
                <SectionedIconGrid
                  sections={searchQuery.trim() ? groupedSearchSections : filteredSections}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                />
              ) : (
                <IconGrid
                  items={displayedIcons}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName={selectedSet !== "all" ? (
                    selectedSet === "favorites" ? "Favorites" : 
                    selectedSet === "material" ? "Material Design Icons" :
                    selectedSet === "animated" ? "Animated Icons" :
                    selectedSet === "lucide" ? "Lucide Icons" :
                    selectedSet === "feather" ? "Feather Icons" :
                    selectedSet === "phosphor" ? "Phosphor Icons" :
                    selectedSet === "tabler" ? "Tabler Icons" :
                    selectedSet === "bootstrap" ? "Bootstrap Icons" :
                    selectedSet === "remix" ? "Remix Icons" :
                    selectedSet === "boxicons" ? "Boxicons" :
                    selectedSet === "css-gg" ? "CSS.GG Icons" :
                    selectedSet === "iconsax" ? "Iconsax Icons" :
                     selectedSet === "solar" ? "Solar Icons" :
                     selectedSet === "atlas" ? "Atlas Icons" :
                      selectedSet === "pixelart" ? "Pixel Art Icons" :
                       selectedSet === "hugeicon" ? "Huge Icons" :
                       selectedSet === "mingcute" ? "Mingcute Icons" :
                       selectedSet.charAt(0).toUpperCase() + selectedSet.slice(1)
                  ) : undefined}
                />
              )
            )}
          </main>
          
          <footer className="border-t p-4 text-center text-xs text-muted-foreground bg-background">
            <p>Ossian Design Lab • <a href="https://buymeacoffee.com/thedeepflux" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Support creator</a> • <a href="https://www.figma.com/community/plugin/1548394766689434419/iconstack-50-000-free-svg-icons" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent hover:opacity-80 transition-opacity">Figma Plugin</a> <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">New</span></p>
          </footer>
        </div>
        
        <ControlPanel selectedIcon={selectedIcon} selectedSet={selectedSet} />
      </div>
    </SidebarProvider>
    </>
  );
}

const Index = () => {
  return <IconGridPage />;
};

export default Index;