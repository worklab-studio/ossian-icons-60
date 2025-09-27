import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";
import { Link } from "react-router-dom";

interface IconDetailHeaderProps {
  // No props needed for this simplified header
}

export function IconDetailHeader({}: IconDetailHeaderProps) {

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Iconstack branding */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <IconstackLogo className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">Iconstack</span>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Beta</span>
            </div>
            <span className="text-xs text-muted-foreground">50,000+ icons</span>
          </div>
        </Link>
        
        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}