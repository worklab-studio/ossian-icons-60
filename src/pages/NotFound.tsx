import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconstackLogo } from "@/components/iconstack-logo";

const notFoundTaglines = [
  "This page got lost in the stack.",
  "404: Icon not found in this directory.",
  "Oops! This route needs an icon.",
  "Page missing from the Iconstack.",
  "Even our icons can't find this page.",
  "This URL isn't in our library.",
  "404: Stack overflow on this route.",
  "Lost in the icon wilderness.",
  "This page took a wrong turn.",
  "Error 404: Creativity not found here."
];

const getUniqueNotFoundTagline = () => {
  try {
    const lastTagline = sessionStorage.getItem('lastNotFoundTagline');
    let availableTaglines = notFoundTaglines;
    
    if (lastTagline) {
      availableTaglines = notFoundTaglines.filter(tagline => tagline !== lastTagline);
    }
    
    const randomIndex = Math.floor(Math.random() * availableTaglines.length);
    const selectedTagline = availableTaglines[randomIndex];
    
    sessionStorage.setItem('lastNotFoundTagline', selectedTagline);
    return selectedTagline;
  } catch {
    // Fallback if sessionStorage is not available
    const randomIndex = Math.floor(Math.random() * notFoundTaglines.length);
    return notFoundTaglines[randomIndex];
  }
};

const NotFound = () => {
  const location = useLocation();
  const [currentTagline] = useState(() => getUniqueNotFoundTagline());

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
        {/* Large 404 Number */}
        <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
          404
        </div>
        
        {/* Iconstack Branding */}
        <div className="flex flex-col items-center space-y-3 -mt-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20">
            <IconstackLogo className="text-primary w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Iconstack
            </h1>
            <p className="text-lg font-medium text-muted-foreground animate-fade-in">
              {currentTagline}
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-4">
          <Button 
            onClick={() => window.location.href = '/'}
            size="lg"
            className="hover-scale"
          >
            Return to Home
          </Button>
        </div>
        
        {/* Optional Route Info for Debug */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-muted-foreground/60 mt-8">
            Route: {location.pathname}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotFound;
