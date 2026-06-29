import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import conclickLogo from "@/assets/conclick-logo.svg.asset.json";

const DISMISS_KEY = "iconstack_conclick_popup_dismissed_v1";
const DELAY_MS = 5_000;

export function ConclickPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) return;
    } catch {
      /* ignore */
    }

    const t = window.setTimeout(() => {
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(DISMISS_KEY, "true");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm overflow-hidden border-border/60 p-0"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--peerlist-green) / 0.12) 0%, hsl(var(--background)) 60%)",
        }}
      >
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <img
            src={conclickLogo.url}
            alt="Conclick"
            className="mb-4 h-10 w-auto select-none object-contain"
          />
          <h2 className="text-lg font-bold text-foreground">
            Lightweight analytics for modern websites
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conclick gives you privacy-first, blazing-fast analytics without the bloat. See what matters.
          </p>
          <a
            href="https://conclick.io?ref=iconstack"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleOpenChange(false)}
            className="group mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[hsl(var(--peerlist-green)/0.5)] bg-[hsl(var(--peerlist-green))] px-5 text-sm font-semibold text-white shadow-lg shadow-[hsl(var(--peerlist-green)/0.3)] transition-transform hover:scale-[1.02]"
          >
            <span>Try Conclick free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConclickPopup;
