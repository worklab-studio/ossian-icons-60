import React from "react";
import { ArrowRight } from "lucide-react";
import { TbBrandX } from "react-icons/tb";

export function RotatingFooter() {
  return (
    <footer className="border-t border-orange-500/30 p-3 text-center text-sm bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
      <a
        href="https://xautopilot.app?ref=iconstack"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors group"
      >
        <TbBrandX className="h-4 w-4" />
        <span>
          🚀 <strong className="text-zinc-900 dark:text-white">X-Autopilot</strong> just launched on Product Hunt! 20% off for IconStack users — Use code{" "}
          <code className="rounded bg-orange-500/10 dark:bg-orange-500/20 px-1.5 py-0.5 text-xs font-bold text-orange-700 dark:text-orange-300">X20DI</code>
        </span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </footer>
  );
}
