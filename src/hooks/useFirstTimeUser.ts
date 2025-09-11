import { useState, useEffect } from 'react';

const STORAGE_KEY = 'iconstack_first_copy_completed';

export function useFirstTimeUser() {
  const [isFirstCopy, setIsFirstCopy] = useState<boolean | null>(null);
  
  useEffect(() => {
    const hasCompletedFirstCopy = localStorage.getItem(STORAGE_KEY);
    setIsFirstCopy(!hasCompletedFirstCopy);
  }, []);
  
  const markFirstCopyComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsFirstCopy(false);
  };
  
  const getKeyboardShortcut = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                  navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? '⌘D' : 'Ctrl+D';
  };
  
  return {
    isFirstCopy,
    markFirstCopyComplete,
    getKeyboardShortcut
  };
}