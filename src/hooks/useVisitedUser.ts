import { useState, useEffect } from 'react';
import { iconLibraryManager } from '@/services/IconLibraryManager';

const STORAGE_KEY = 'iconstack_user_visits';
const CACHE_CHECK_KEY = 'iconstack_cache_status';

interface UserVisitData {
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  hasSeenLoading: boolean;
}

export function useVisitedUser() {
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);
  const [hasCachedData, setHasCachedData] = useState<boolean>(false);
  const [shouldSkipLoading, setShouldSkipLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const checkUserStatus = () => {
      try {
        // Get user visit data
        const visitDataStr = localStorage.getItem(STORAGE_KEY);
        const visitData: UserVisitData = visitDataStr 
          ? JSON.parse(visitDataStr)
          : {
              visitCount: 0,
              firstVisit: new Date().toISOString(),
              lastVisit: new Date().toISOString(),
              hasSeenLoading: false
            };

        const isReturning = visitData.visitCount > 0;
        setIsReturningUser(isReturning);

        // Check if we have cached icon data using IconLibraryManager
        const hasCacheData = iconLibraryManager.hasPriorityLibraryCache();
        setHasCachedData(hasCacheData);

        // Determine if we should skip loading animation
        const shouldSkip = isReturning && hasCacheData && visitData.hasSeenLoading;
        setShouldSkipLoading(shouldSkip);

        // Debug logging to understand what's happening
        console.log('Loading Decision:', {
          isReturning,
          hasCacheData,
          hasSeenLoading: visitData.hasSeenLoading,
          shouldSkip,
          visitCount: visitData.visitCount
        });

        // Update visit count and last visit
        const updatedVisitData: UserVisitData = {
          ...visitData,
          visitCount: visitData.visitCount + 1,
          lastVisit: new Date().toISOString(),
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisitData));
      } catch (error) {
        console.warn('Failed to check user visit status:', error);
        setIsReturningUser(false);
        setHasCachedData(false);
        setShouldSkipLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const markLoadingSeen = () => {
    try {
      const visitDataStr = localStorage.getItem(STORAGE_KEY);
      if (visitDataStr) {
        const visitData: UserVisitData = JSON.parse(visitDataStr);
        const updatedData = { ...visitData, hasSeenLoading: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.warn('Failed to mark loading as seen:', error);
    }
  };

  // Removed - now using IconLibraryManager.hasPriorityLibraryCache() directly

  const clearVisitData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsReturningUser(false);
      setShouldSkipLoading(false);
    } catch (error) {
      console.warn('Failed to clear visit data:', error);
    }
  };

  return {
    isReturningUser,
    hasCachedData,
    shouldSkipLoading,
    markLoadingSeen,
    clearVisitData
  };
}