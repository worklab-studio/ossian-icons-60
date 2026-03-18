import React from "react";
import { ArrowRight } from "lucide-react";
import { TbBrandX } from "react-icons/tb";

export function RotatingFooter() {
  return (
    <footer className="border-t p-3 text-center text-sm bg-white dark:bg-white overflow-hidden">
      <a
        href="https://xautopilot.app?ref=iconstack"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-gray-800 hover:text-black transition-colors group"
      >
        <TbBrandX className="h-4 w-4" />
        <span>
          🚀 <strong>X-Autopilot</strong> just launched on Product Hunt! 20% off for IconStack users — Use code{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-black">X20DI</code>
        </span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </footer>
  );
}
