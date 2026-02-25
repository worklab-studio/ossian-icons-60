import React, { useState, useEffect } from "react";
import { TrendingUp, Flame } from "lucide-react";

type BadgeType = "New" | "Trending" | "Hot";

const footerItems: { text: string; link: string; badge?: BadgeType }[] = [
  {
    text: "IconStack Figma Plugin is live",
    link: "https://www.figma.com/community/plugin/1548394766689434419/iconstack-50-000-free-svg-icons",
    badge: "New"
  },
  {
    text: "Ultimate launch toolkit for founders - Productlaunchos.com",
    link: "https://productlaunchos.com",
    badge: "Trending"
  },
  {
    text: "A complete icon library - iconstack.io",
    link: "https://iconstack.io",
  },
  {
    text: "Free AI invoicing tool - Dodoinvoice.com",
    link: "https://dodoinvoice.com",
    badge: "Hot"
  },
];

const BadgeComponent = ({ type }: { type: BadgeType }) => {
  if (type === "Hot") {
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-orange-500/50 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-500">
        <Flame size={10} />
        {type}
      </span>
    );
  }

  if (type === "Trending") {
    return (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-blue-500/50 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
        <TrendingUp size={10} />
        {type}
      </span>
    );
  }
  
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
      {type}
    </span>
  );
};

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
          {current.badge && <BadgeComponent type={current.badge} />}
        </a>
      </div>
    </footer>
  );
}
