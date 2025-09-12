import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'announcementBarDismissed';
const PLUGIN_URL = 'https://www.figma.com/community/plugin/1548394766689434419/iconstack-50-000-free-svg-icons';

const FigmaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <circle cx="15" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 21C10.6569 21 12 19.6569 12 18V15H9C7.34315 15 6 16.3431 6 18C6 19.6569 7.34315 21 9 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 9V15H9C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V9H9C7.34315 9 6 7.65685 6 6C6 4.34315 7.34315 3 9 3H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V9H15C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if announcement was dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === '1') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsVisible(false);
  };

  // Don't render on server or if dismissed
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Announcement"
      data-component="announcement-bar"
      className="announcement-bar fixed top-0 left-0 right-0 z-60 h-14 md:h-12 bg-gradient-to-r from-gray-900 via-gray-800 via-purple-900 to-purple-700 dark:from-gray-900 dark:via-gray-800 dark:via-purple-900 dark:to-purple-700 text-gray-100 overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #111827 0%, #1F2937 35%, #4C1D95 65%, #7C3AED 100%)',
        backgroundSize: '200% 100%',
        animation: 'gradient-shift 40s ease-in-out infinite',
      }}
    >
      {/* Film grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsSAAALEgHS3X78AAAAGUlEQVQYV2NkYGD4z0AEMDEwMDAwGDAAAAE7AAf3q6oPAAAAAElFTkSuQmCC')`,
          backgroundRepeat: 'repeat'
        }}
      />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FigmaIcon />
            <p className="text-sm md:text-base font-medium text-gray-100 truncate sm:whitespace-normal">
              Just launched: the Iconstack Figma Plugin — search 50,000+ free icons inside Figma.
            </p>
          </div>

          {/* CTA Button */}
          <a
            href={PLUGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="figma-plugin"
            className="flex-shrink-0 inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Try it now
          </a>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="flex-shrink-0 p-1 text-gray-300 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .announcement-bar {
            animation: none !important;
            background-size: auto !important;
          }
        }

        @media (prefers-color-scheme: light) {
          .announcement-bar {
            background: linear-gradient(90deg, #EEF2FF 0%, #E0E7FF 40%, #DDD6FE 70%, #C7D2FE 100%) !important;
            color: #111827 !important;
          }
          .announcement-bar .text-gray-100 {
            color: #111827 !important;
          }
          .announcement-bar .text-white {
            color: #111827 !important;
          }
          .announcement-bar .text-gray-300 {
            color: #374151 !important;
          }
          .announcement-bar .border-white\\/20 {
            border-color: rgba(17, 24, 39, 0.2) !important;
          }
          .announcement-bar .bg-white\\/10 {
            background-color: rgba(17, 24, 39, 0.1) !important;
          }
          .announcement-bar:hover .hover\\:bg-white\\/20 {
            background-color: rgba(17, 24, 39, 0.2) !important;
          }
        }
      `}</style>
    </div>
  );
}