import { Search, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useRef, useEffect } from "react";

interface MobileHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void;
  onCustomizeClick: () => void;
  onLibraryClick: () => void;
}

export function MobileHeader({
  searchQuery,
  onSearchChange,
  onSearchClear,
  onCustomizeClick,
  onLibraryClick,
}: MobileHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      
      // Clear search on Escape key
      if (event.key === 'Escape' && searchQuery) {
        event.preventDefault();
        onSearchClear?.();
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchClear]);

  const shortcutKey = searchQuery ? 'Esc' : '⌘K';

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      {/* Top navigation bar */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <IconstackLogo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">Iconstack</span>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Beta</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCustomizeClick}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLibraryClick}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-10 pr-10"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                {shortcutKey}
              </kbd>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}