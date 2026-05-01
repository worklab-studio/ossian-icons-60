import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { PRODUCT_HUNT } from "@/config/productHunt";

const DISMISS_KEY = "iconstack_ph_banner_dismissed";

type State = "coming-soon" | "live" | "hidden";

function computeState(): State {
  const now = Date.now();
  const launch = new Date(PRODUCT_HUNT.launchDate + "T00:00:00Z").getTime();
  const liveEnd = launch + PRODUCT_HUNT.liveWindowHours * 60 * 60 * 1000;
  if (now < launch) return "coming-soon";
  if (now < liveEnd) return "live";
  return "hidden";
}

function PHIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="hsl(var(--ph-orange))" />
      <path
        d="M13.6 7H9v10h2v-3h2.6a3.5 3.5 0 0 0 0-7zm0 5H11V9h2.6a1.5 1.5 0 0 1 0 3z"
        fill="#fff"
      />
    </svg>
  );
}

export function ProductHuntBanner() {
  const [state, setState] = useState<State>("hidden");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!PRODUCT_HUNT.enabled) return;
    setState(computeState());
    try {
      const v = localStorage.getItem(DISMISS_KEY);
      if (v === PRODUCT_HUNT.launchDate) setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Expose banner height as a CSS variable so the app shell can subtract it
  // from 100vh and keep the footer pinned to the bottom of the viewport.
  const visible = PRODUCT_HUNT.enabled && state !== "hidden" && !dismissed;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ph-banner-h", visible ? "36px" : "0px");
    return () => {
      root.style.setProperty("--ph-banner-h", "0px");
    };
  }, [visible]);

  if (!visible) return null;

  const isLive = state === "live";
  const href = isLive ? PRODUCT_HUNT.postUrl : PRODUCT_HUNT.upcomingUrl;

  const launch = new Date(PRODUCT_HUNT.launchDate + "T00:00:00Z").getTime();
  const daysToGo = Math.max(
    1,
    Math.ceil((launch - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, PRODUCT_HUNT.launchDate);
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const handleClick = () => {
    try {
      // @ts-expect-error optional analytics
      window.umami?.track?.("ph_banner_click", { state });
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="region"
      aria-label="Product Hunt launch announcement"
      className="fixed top-0 left-0 right-0 z-[60] w-full border-b border-border text-foreground"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--ph-orange) / 0.18) 0%, hsl(var(--background)) 60%)",
      }}
    >
      <div className="flex h-9 items-center justify-center gap-2 px-3 text-xs sm:text-sm md:h-9">
        <PHIcon className="h-4 w-4 shrink-0" />
        {isLive ? (
          <span className="truncate">
            <span className="hidden sm:inline">We&apos;re live on Product Hunt today 🎉 — </span>
            <span className="sm:hidden">Live on Product Hunt — </span>
            <span className="text-muted-foreground">help us reach #1</span>
          </span>
        ) : (
          <span className="truncate">
            <span className="font-medium">Coming soon on Product Hunt</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}— {daysToGo} {daysToGo === 1 ? "day" : "days"} to go
            </span>
          </span>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="ml-1 inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "hsl(var(--ph-orange))" }}
        >
          {isLive ? (
            <>
              <span className="hidden sm:inline">Upvote Iconstack</span>
              <span className="sm:hidden">Upvote</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>Notify me</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </a>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss Product Hunt banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ProductHuntBanner;
