import React, { useState, useMemo, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import { SimpleIconGrid } from "@/components/icon-grid/SimpleIconGrid";
import { ControlPanel } from "@/components/control-panel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { IconCustomizationProvider, useIconCustomization } from "@/contexts/IconCustomizationContext";
import { type IconItem } from "@/types/icon";
import { sortIconsByStyleThenName } from "@/lib/icon-utils";
import { toast } from "@/hooks/use-toast";
import { useSimpleIconLibrary } from "@/hooks/useSimpleIconLibrary";
import { useSimpleSearch } from "@/hooks/useSimpleSearch";
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser";
import { useVisitedUser } from "@/hooks/useVisitedUser";
import { showFirstCopyNudge } from "@/components/ui/first-copy-nudge";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingWithTagline from "@/components/LoadingWithTagline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileLibraryDrawer } from "@/components/mobile/MobileLibraryDrawer";
import { MobileCustomizeSheet } from "@/components/mobile/MobileCustomizeSheet";
import { MobileIconActions } from "@/components/mobile/MobileIconActions";
import { HapticsManager } from "@/lib/haptics";

// Mock data - replace with your actual icon data
const sampleIcons: IconItem[] = [
  {
    id: 'sample-1',
    name: 'home',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
    tags: ['home', 'house', 'building'],
    category: 'navigation'
  },
  {
    id: 'sample-2',
    name: 'user',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    tags: ['user', 'person', 'profile'],
    category: 'users'
  }
];

function IconGridPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [minDurationComplete, setMinDurationComplete] = useState(false);
  const { customization } = useIconCustomization();

  // Mobile state
  const isMobile = useIsMobile();
  const [showLibraryDrawer, setShowLibraryDrawer] = useState(false);
  const [showCustomizeSheet, setShowCustomizeSheet] = useState(false);
  const [showIconActions, setShowIconActions] = useState(false);

  // Visited user state for smart loading
  const { shouldSkipLoading, markLoadingSeen } = useVisitedUser();
  
  // Simple icon loading
  const { 
    icons, 
    isLoading, 
    error, 
    loadIcons,
    clearIcons 
  } = useSimpleIconLibrary();
  
  // Simple search
  const { searchIcons } = useSimpleSearch();

  // Control loading animation visibility
  useEffect(() => {
    // Skip loading entirely for returning users with cache
    if (shouldSkipLoading) {
      console.log('Skipping loading animation for returning user with cache');
      setShowLoadingAnimation(false);
      setMinDurationComplete(true);
      return;
    }

    // Hide loading when both conditions are met
    if (minDurationComplete && icons.length > 0) {
      setShowLoadingAnimation(false);
      markLoadingSeen();
    }
  }, [minDurationComplete, icons.length, shouldSkipLoading, markLoadingSeen]);

  // Load sample icons on mount
  useEffect(() => {
    if (shouldSkipLoading) {
      loadIcons(sampleIcons);
    } else {
      // Simulate loading delay
      setTimeout(() => {
        loadIcons(sampleIcons);
      }, 1000);
    }
  }, [loadIcons, shouldSkipLoading]);

  // Get the selected icon object
  const selectedIcon = useMemo(() => {
    if (!selectedId) return null;
    return icons.find(icon => icon.id === selectedId) || null;
  }, [selectedId, icons]);

  // Handle search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchIcons(searchQuery, icons);
  }, [searchQuery, searchIcons, icons]);

  // Get current icon set to display
  const currentIcons = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults.filter(icon => icon.svg !== undefined && icon.svg !== null);
    }
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

  // Reset category when library changes
  useEffect(() => {
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
                {selectedSet === "all" ? "All Icons" : "Sample Icons"}
                {searchQuery && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({searchResults.length} results)
                  </span>
                )}
              </h1>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  {displayedIcons.length.toLocaleString()} icons
                </p>
              )}
            </div>
          </div>

          {/* Content area with top padding to account for fixed header */}
          <main className="flex-1 overflow-auto pt-32">
            {showLoadingAnimation ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <LoadingWithTagline 
                  minDuration={2000}
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
                      onClick={() => loadIcons(sampleIcons)}
                      className="mt-3 text-sm text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="px-4 pb-6">
                {/* Category Filter */}
                {availableCategories.length > 0 && (
                  <div className="mb-4">
                    <CategoryFilter
                      categories={availableCategories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </div>
                )}

                {/* Icon Grid */}
                <SimpleIconGrid
                  icons={displayedIcons}
                  onIconClick={handleIconClick}
                  onCopy={handleCopy}
                />
              </div>
            )}
          </main>
        </div>

        {/* Mobile Drawers/Sheets */}
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchClear={() => setSearchQuery("")}
          />

          {showLoadingAnimation ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingWithTagline 
                minDuration={2000}
                onMinDurationComplete={() => setMinDurationComplete(true)}
              />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-center px-6">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="mt-2">
                  <p className="font-medium">Failed to load icons</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <button
                    onClick={() => loadIcons(sampleIcons)}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Try again
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6">
                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <div className="mb-6">
                      <CategoryFilter
                        categories={availableCategories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                      />
                    </div>
                  )}

                  {/* Icon Grid */}
                  <SimpleIconGrid
                    icons={displayedIcons}
                    onIconClick={handleIconClick}
                    onCopy={handleCopy}
                  />
                </div>
              </div>

              {/* Control Panel */}
              <ControlPanel selectedIcon={selectedIcon} />
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Index() {
  return (
    <IconCustomizationProvider>
      <IconGridPage />
    </IconCustomizationProvider>
  );
}