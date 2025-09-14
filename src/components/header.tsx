import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef, useEffect } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void;
}

export function Header({ searchQuery, onSearchChange, onSearchClear }: HeaderProps) {
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

  // Detect if user is on Mac for the right key indicator
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = searchQuery ? 'Esc' : (isMac ? '⌘K' : 'Ctrl+K');

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pl-10 pr-16 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
              <kbd 
                className={`inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ${
                  searchQuery ? 'pointer-events-auto cursor-pointer hover:bg-muted/80 transition-colors' : 'pointer-events-none'
                }`}
                onClick={searchQuery ? onSearchClear : undefined}
              >
                {shortcutKey}
              </kbd>
            </div>
        </div>
        
        <div className="absolute right-4 flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}