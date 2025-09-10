import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useNavigate } from "react-router-dom";

interface IconDetailHeaderProps {
  libraryName?: string;
  iconName?: string;
}

export function IconDetailHeader({ libraryName, iconName }: IconDetailHeaderProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Back button and logo with breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="h-9 w-9 p-0 rounded-md hover:bg-hover-bg transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <IconstackLogo className="text-foreground" />
              {libraryName && iconName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{libraryName}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-medium text-foreground">{iconName}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}