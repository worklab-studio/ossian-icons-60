import React from 'react';
import LoadingSpinner from './LoadingSpinner';


interface LoadingWithTaglineProps {
  minDuration?: number;
  onMinDurationComplete?: () => void;
}

const LoadingWithTagline: React.FC<LoadingWithTaglineProps> = ({ 
  minDuration = 2000, 
  onMinDurationComplete 
}) => {
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
        <p className="text-lg font-medium text-muted-foreground">
          Loading your icons...
        </p>
      </div>
    </div>
  );
};

export default LoadingWithTagline;