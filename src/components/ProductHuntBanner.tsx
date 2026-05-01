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
    root.style.setProperty("--ph-banner-h", visible ? "64px" : "0px");
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
      className="fixed top-0 right-0 left-0 md:left-[16rem] md:right-[20rem] z-[60] border-b border-border/60 text-foreground backdrop-blur-md"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--ph-orange) / 0.22) 0%, hsl(var(--ph-orange) / 0.08) 30%, hsl(var(--background) / 0.85) 70%, hsl(var(--background) / 0.85) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(600px 60px at 18% 50%, hsl(var(--ph-orange) / 0.25), transparent 70%)",
        }}
      />
      <div className="relative flex h-9 items-center justify-center gap-2.5 px-3 pr-10 text-xs sm:text-[13px]">
        <span
          className="inline-flex h-5 items-center gap-1 rounded-full border border-[hsl(var(--ph-orange)/0.4)] bg-[hsl(var(--ph-orange)/0.15)] px-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--ph-orange))]"
        >
          <PHIcon className="h-3 w-3" />
          {isLive ? "Live" : "Soon"}
        </span>
        {isLive ? (
          <span className="truncate">
            <span className="font-medium">We&apos;re live on Product Hunt</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}— help us reach #1 today 🎉
            </span>
          </span>
        ) : (
          <span className="truncate">
            <span className="font-medium">Launching on Product Hunt</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}in {daysToGo} {daysToGo === 1 ? "day" : "days"}
            </span>
          </span>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="group ml-1 inline-flex h-6 items-center gap-1 rounded-full border border-[hsl(var(--ph-orange)/0.35)] bg-[hsl(var(--ph-orange)/0.1)] px-2.5 text-[11px] font-medium text-[hsl(var(--ph-orange))] transition-colors hover:bg-[hsl(var(--ph-orange)/0.18)]"
        >
          {isLive ? (
            <>
              <span className="hidden sm:inline">Upvote</span>
              <span className="sm:hidden">Upvote</span>
            </>
          ) : (
            <span>Notify me</span>
          )}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss Product Hunt banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default ProductHuntBanner;
