import React, { useState, useEffect } from "react";

const footerItems = [
  {
    text: "IconStack Figma Plugin is live",
    link: "https://www.figma.com/community/plugin/1548394766689434419/iconstack-50-000-free-svg-icons",
    badge: "New"
  },
  {
    text: "Ultimate launch toolkit for founders: ProductLaunchos.com",
    link: "https://productlaunchos.com",
  },
  {
    text: "A complete icon library - iconstack.io",
    link: "https://iconstack.io",
  },
];

export function RotatingFooter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % footerItems.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const current = footerItems[currentIndex];

  return (
    <footer className="border-t p-4 text-center text-xs text-muted-foreground bg-background overflow-hidden">
      <div className="relative h-5 flex items-center justify-center">
        <a
          href={current.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute transition-all duration-300 ease-in-out hover:text-primary ${
            isAnimating
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          }`}
        >
          {current.text}
          {current.badge && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {current.badge}
            </span>
          )}
        </a>
      </div>
    </footer>
  );
}
