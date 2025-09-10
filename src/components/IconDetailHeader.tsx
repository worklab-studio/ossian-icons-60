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
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Back button and breadcrumb */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <IconstackLogo />
            {libraryName && iconName && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{libraryName}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{iconName}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}