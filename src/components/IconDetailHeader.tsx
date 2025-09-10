import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";

interface IconDetailHeaderProps {
  // No props needed for this simplified header
}

export function IconDetailHeader({}: IconDetailHeaderProps) {

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Iconstack branding */}
        <div className="flex items-center gap-2">
          <IconstackLogo className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary">Iconstack</span>
            <span className="text-xs text-muted-foreground hidden sm:block">50,000+ icons</span>
          </div>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Beta</span>
        </div>
        
        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}