import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const taglines = [
  "50,000+ icons. One stack.",
  "All your favorite libraries. One place.",
  "Search less. Design faster.",
  "Every icon you need, stacked.",
  "Icons, customized your way."
];

interface LoadingWithTaglineProps {
  minDuration?: number;
  onMinDurationComplete?: () => void;
}

const LoadingWithTagline: React.FC<LoadingWithTaglineProps> = ({ 
  minDuration = 4000, 
  onMinDurationComplete 
}) => {
  const [currentTagline, setCurrentTagline] = useState('');

  useEffect(() => {
    // Get the last shown tagline from localStorage
    const lastTaglineIndex = localStorage.getItem('lastTaglineIndex');
    const lastIndex = lastTaglineIndex ? parseInt(lastTaglineIndex, 10) : -1;
    
    // Get available indices (excluding the last shown one)
    const availableIndices = taglines
      .map((_, index) => index)
      .filter(index => index !== lastIndex);
    
    // If all taglines have been used, reset and use all indices
    const indicesToChooseFrom = availableIndices.length > 0 ? availableIndices : taglines.map((_, index) => index);
    
    // Randomly select from available indices
    const randomIndex = indicesToChooseFrom[Math.floor(Math.random() * indicesToChooseFrom.length)];
    
    // Set the tagline and remember it in localStorage
    setCurrentTagline(taglines[randomIndex]);
    localStorage.setItem('lastTaglineIndex', randomIndex.toString());
  }, []);

  useEffect(() => {
    if (onMinDurationComplete) {
      const timer = setTimeout(() => {
        onMinDurationComplete();
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [minDuration, onMinDurationComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <DotLottieReact
        src="https://lottie.host/48a3d687-d94b-4ef9-aa77-049a95f15af7/O2PsD2POjh.lottie"
        loop
        autoplay
        className="w-32 h-32"
      />
      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold text-primary">
          Iconstack
        </h1>
        <p className="text-lg font-medium text-muted-foreground animate-fade-in">
          {currentTagline}
        </p>
      </div>
    </div>
  );
};

export default LoadingWithTagline;