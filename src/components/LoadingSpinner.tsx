import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-border rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Loading icons...</p>
    </div>
  );
};

export default LoadingSpinner;