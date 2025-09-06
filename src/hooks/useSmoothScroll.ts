import { useCallback, useRef } from 'react';

interface SmoothScrollOptions {
  duration?: number;
  easing?: string;
  behavior?: ScrollBehavior;
}

interface ScrollToOptions extends SmoothScrollOptions {
  top?: number;
  left?: number;
}

export function useSmoothScroll() {
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollTo = useCallback((
    element: HTMLElement | null,
    options: ScrollToOptions = {}
  ) => {
    if (!element || isScrollingRef.current) return;

    const {
      top = 0,
      left = 0,
      duration = 300,
      behavior = 'smooth'
    } = options;

    isScrollingRef.current = true;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Enhanced smooth scrolling with momentum
    const startTime = performance.now();
    const startTop = element.scrollTop;
    const startLeft = element.scrollLeft;
    const deltaTop = top - startTop;
    const deltaLeft = left - startLeft;

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      element.scrollTo({
        top: startTop + (deltaTop * easedProgress),
        left: startLeft + (deltaLeft * easedProgress),
        behavior: 'instant' // We handle the easing manually
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isScrollingRef.current = false;
      }
    };

    // Fallback to native smooth scrolling for better browser support
    if ('scrollBehavior' in document.documentElement.style) {
      element.scrollTo({ top, left, behavior });
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, duration);
    } else {
      requestAnimationFrame(animate);
    }
  }, []);

  const scrollToTop = useCallback((
    element: HTMLElement | null,
    options: SmoothScrollOptions = {}
  ) => {
    scrollTo(element, { ...options, top: 0 });
  }, [scrollTo]);

  const scrollBy = useCallback((
    element: HTMLElement | null,
    deltaY: number,
    options: SmoothScrollOptions = {}
  ) => {
    if (!element) return;
    
    const currentTop = element.scrollTop;
    scrollTo(element, { ...options, top: currentTop + deltaY });
  }, [scrollTo]);

  return {
    scrollTo,
    scrollToTop,
    scrollBy,
    isScrolling: () => isScrollingRef.current
  };
}