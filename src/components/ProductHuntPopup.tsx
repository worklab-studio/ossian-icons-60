import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PRODUCT_HUNT } from "@/config/productHunt";
import phCat from "@/assets/ph-cat.png";

const DISMISS_KEY = "iconstack_ph_popup_dismissed";
const DELAY_MS = 10_000;

type State = "coming-soon" | "live" | "hidden";

function getLaunchMs(): number {
  const cfg = PRODUCT_HUNT as { launchDateTime?: string; launchDate: string };
  const iso = cfg.launchDateTime ?? cfg.launchDate + "T00:00:00Z";
  return new Date(iso).getTime();
}

function computeState(): State {
  const now = Date.now();
  const launch = getLaunchMs();
  const liveEnd = launch + PRODUCT_HUNT.liveWindowHours * 60 * 60 * 1000;
  if (now < launch) return "coming-soon";
  if (now < liveEnd) return "live";
  return "hidden";
}

function PHIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="hsl(var(--ph-orange))" />
      <path
        d="M22.667 20H17.5v-5.333h5.167a2.667 2.667 0 0 1 0 5.333zm0-8H14.5v16h3v-5h5.167a5.333 5.333 0 0 0 0-10.667z"
        fill="#fff"
      />
    </svg>
  );
}

export function ProductHuntPopup() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!PRODUCT_HUNT.enabled || !isHome) return;
    const state = computeState();
    if (state === "hidden") return;
    try {
      const v = localStorage.getItem(DISMISS_KEY);
      if (v === PRODUCT_HUNT.launchDate) return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setOpen(true);
      try {
        // @ts-expect-error optional analytics
        window.umami?.track?.("ph_popup_shown", { state });
      } catch {
        /* ignore */
      }
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, [isHome]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(DISMISS_KEY, PRODUCT_HUNT.launchDate);
      } catch {
        /* ignore */
      }
    }
  };

  const state = computeState();
  const isLive = state === "live";
  const href = isLive ? PRODUCT_HUNT.postUrl : PRODUCT_HUNT.upcomingUrl;

  const handleClick = () => {
    try {
      // @ts-expect-error optional analytics
      window.umami?.track?.("ph_popup_click", { state });
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(DISMISS_KEY, PRODUCT_HUNT.launchDate);
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md overflow-hidden border-border/60 p-0"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--ph-orange) / 0.18) 0%, hsl(var(--background)) 60%)",
        }}
      >
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(400px 160px at 20% 0%, hsl(var(--ph-orange) / 0.25), transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center px-6 pb-6 pt-8 text-center">
            <img
              src={phCat}
              alt=""
              aria-hidden="true"
              className="mb-2 h-24 w-auto select-none object-contain drop-shadow-lg"
            />
            <div className="mb-3 flex items-center gap-2">
              <PHIcon className="h-6 w-6 drop-shadow-[0_0_12px_hsl(var(--ph-orange)/0.5)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--ph-orange))]">
                Product Hunt
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {isLive
                ? "We're live on Product Hunt! 🎉"
                : "We're launching on Product Hunt"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLive
                ? "Your upvote helps Iconstack reach #1 today and brings better icon tooling to thousands of designers and developers."
                : "Help us launch with a bang — get notified and support us on launch day. Every upvote counts."}
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[hsl(var(--ph-orange)/0.5)] bg-[hsl(var(--ph-orange))] px-5 text-sm font-semibold text-white shadow-lg shadow-[hsl(var(--ph-orange)/0.3)] transition-transform hover:scale-[1.02]"
            >
              <span>{isLive ? "Upvote on Product Hunt" : "Support us on Product Hunt"}</span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductHuntPopup;
