import React from "react";
import { ArrowRight } from "lucide-react";
import dodoLogo from "@/assets/dodoinvoice-logo.avif";

export function RotatingFooter() {
  return (
    <footer className="border-t border-border p-3 text-center text-sm bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
      <a
        href="https://dodoinvoice.com?ref=iconstack"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors group"
      >
        <img src={dodoLogo} alt="Dodo Invoice" className="h-4 w-4 rounded-sm" />
        <span>
          <strong className="text-zinc-900 dark:text-white">Dodo Invoice</strong> — AI invoicing for freelancers and agencies.
        </span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </footer>
  );
}
