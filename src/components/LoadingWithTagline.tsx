import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const taglines = [
  "56,800+ icons. One stack.",
  "Stop hunting. Start shipping.",
  "Every icon you need, stacked.",
  "Search less. Design faster.",
  "All your favorite libraries. One place.",
  "From Material to Phosphor — all here.",
  "Icons, customized your way.",
  "One search bar. Infinite icons.",
  "The Unsplash for icons.",
  "Your UI's new best friend."
];

const getUniqueTagline = () => {
  try {
    const lastTagline = sessionStorage.getItem('lastTagline');
    let availableTaglines = taglines;
    
    if (lastTagline) {
      availableTaglines = taglines.filter(tagline => tagline !== lastTagline);
    }
    
    const randomIndex = Math.floor(Math.random() * availableTaglines.length);
    const selectedTagline = availableTaglines[randomIndex];
    
    sessionStorage.setItem('lastTagline', selectedTagline);
    return selectedTagline;
  } catch {
    // Fallback if sessionStorage is not available
    const randomIndex = Math.floor(Math.random() * taglines.length);
    return taglines[randomIndex];
  }
};

interface LoadingWithTaglineProps {
  minDuration?: number;
  onMinDurationComplete?: () => void;
}

const LoadingWithTagline: React.FC<LoadingWithTaglineProps> = ({ 
  minDuration = 2000, 
  onMinDurationComplete 
}) => {
  const [currentTagline] = React.useState(() => getUniqueTagline());

  React.useEffect(() => {
    if (onMinDurationComplete) {
      const timer = setTimeout(() => {
        onMinDurationComplete();
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [minDuration, onMinDurationComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <LoadingSpinner />
      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold text-primary">
          Iconstack
        </h1>
        <p className="text-base font-medium text-muted-foreground animate-fade-in">
          {currentTagline}
        </p>
      </div>
    </div>
  );
};

export default LoadingWithTagline;