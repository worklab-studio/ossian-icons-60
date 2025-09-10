import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface IconDetailHeaderProps {
  libraryName?: string;
  iconName?: string;
  onCustomizeClick?: () => void;
}

export function IconDetailHeader({ libraryName, iconName, onCustomizeClick }: IconDetailHeaderProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <>
      {/* Top Navigation Bar - Edge to Edge */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Back button and branding */}
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
              <IconstackLogo className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary">Iconstack</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">50,000+ icons</span>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Beta</span>
            </div>
          </div>
          
          {/* Right: Customize and Theme toggle */}
          <div className="flex items-center gap-2">
            {onCustomizeClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCustomizeClick}
                className="h-9 w-9 p-0 rounded-md hover:bg-hover-bg transition-colors"
                aria-label="Customize"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Breadcrumb Section - Below Header */}
      {libraryName && iconName && (
        <>
          <div className="bg-background/50 px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={handleBackClick}
                    className="cursor-pointer hover:text-foreground"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="text-muted-foreground">{libraryName}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{iconName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Separator />
        </>
      )}
    </>
  );
}