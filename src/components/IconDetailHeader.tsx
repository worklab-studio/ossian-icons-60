import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function IconDetailHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Back + branding */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {!isMobile && (
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <IconstackLogo className="h-5 w-5 text-primary" />
              <span className="font-bold text-base text-primary">Iconstack</span>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">Beta</span>
            </Link>
          )}
          {isMobile && (
            <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <IconstackLogo className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm text-primary">Iconstack</span>
            </Link>
          )}
        </div>
        
        {/* Right: Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}