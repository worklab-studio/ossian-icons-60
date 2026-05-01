import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import dodoLogo from "@/assets/dodoinvoice-logo.avif";
import xautopilotLogo from "@/assets/xautopilot-logo.png";

type Promo = {
  brand: string;
  tagline: string;
  href: string;
  logo: React.ReactNode;
};

const FigmaIcon = () => (
  <svg viewBox="0 0 38 57" className="h-4 w-4" aria-hidden="true">
    <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
    <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
    <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
    <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
    <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
  </svg>
);

const FramerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#0055FF" d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
  </svg>
);

const McpIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const promos: Promo[] = [
  {
    brand: "Iconstack API & MCP",
    tagline: "Search 51,000+ icons from Cursor, Claude or your code.",
    href: "/api",
    logo: <McpIcon />,
  },
  {
    brand: "Iconstack for Figma",
    tagline: "Drop icons straight into your designs.",
    href: "https://www.figma.com/community/plugin/1548394766689434419",
    logo: <FigmaIcon />,
  },
  {
    brand: "Iconstack for Framer",
    tagline: "Use any icon inside Framer.",
    href: "https://www.framer.com/marketplace/plugins/iconstack-io/",
    logo: <FramerIcon />,
  },
  {
    brand: "X-Autopilot",
    tagline: "Automate your X with a Claude-powered AI agent.",
    href: "https://xautopilot.app?ref=iconstack",
    logo: <img src={xautopilotLogo} alt="X-Autopilot" className="h-4 w-4 rounded-sm" />,
  },
  {
    brand: "Dodo Invoice",
    tagline: "AI invoicing for freelancers and agencies.",
    href: "https://dodoinvoice.com?ref=iconstack",
    logo: <img src={dodoLogo} alt="Dodo Invoice" className="h-4 w-4 rounded-sm" />,
  },
];

export function RotatingFooter() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % promos.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const promo = promos[index];

  return (
    <footer
      className="border-t border-border p-3 text-center text-sm bg-zinc-100 dark:bg-zinc-900 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <a
        key={index}
        href={promo.href}
        target={promo.href.startsWith("/") ? "_self" : "_blank"}
        rel={promo.href.startsWith("/") ? undefined : "noopener noreferrer"}
        className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors group animate-fade-in"
      >
        {promo.logo}
        <span>
          <strong className="text-zinc-900 dark:text-white">{promo.brand}</strong> — {promo.tagline}
        </span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </footer>
  );
}
