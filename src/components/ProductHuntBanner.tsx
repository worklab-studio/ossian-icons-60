import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { PRODUCT_HUNT } from "@/config/productHunt";

const DISMISS_KEY = "iconstack_ph_banner_dismissed";

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

function formatCountdown(ms: number): { d: number; h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s };
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

export function ProductHuntBanner() {
  const [state, setState] = useState<State>("hidden");
  const [dismissed, setDismissed] = useState(false);
  // Defer rendering until after the page content has had a chance to paint.
  // Without this, the banner (rendered outside <Suspense>) flashes in before
  // the lazy-loaded route content arrives, which looks broken.
  const [ready, setReady] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

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

  useEffect(() => {
    // Wait for the page to be fully loaded (and idle) before showing the banner
    // so it never appears before the underlying content is rendered.
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const reveal = () => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(() => setReady(true), 600);
      }
    };

    if (document.readyState === "complete") {
      reveal();
    } else {
      window.addEventListener("load", reveal, { once: true });
    }

    return () => {
      window.removeEventListener("load", reveal);
      if (timeoutId) window.clearTimeout(timeoutId);
      const w = window as unknown as { cancelIdleCallback?: (id: number) => void };
      if (idleId && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
    };
  }, []);

  // Expose banner height as a CSS variable so the app shell can subtract it
  // from 100vh and keep the footer pinned to the bottom of the viewport.
  const visible =
    ready && isHome && PRODUCT_HUNT.enabled && state !== "hidden" && !dismissed;
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
      <div className="relative flex h-16 items-center justify-center gap-3 px-3 pr-10 text-xs sm:text-[13px]">
        <PHIcon className="h-7 w-7 shrink-0 drop-shadow-[0_0_12px_hsl(var(--ph-orange)/0.5)]" />
        {isLive ? (
          <span className="truncate">
            <span className="font-semibold">We&apos;re live on Product Hunt</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}— help us reach #1 today 🎉
            </span>
          </span>
        ) : (
          <span className="truncate">
            <span className="font-semibold">Launching on Product Hunt</span>
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
          className="group ml-1 inline-flex h-7 items-center gap-1.5 rounded-full border border-[hsl(var(--ph-orange)/0.4)] bg-[hsl(var(--ph-orange)/0.12)] px-3 text-[11px] font-medium text-[hsl(var(--ph-orange))] transition-colors hover:bg-[hsl(var(--ph-orange)/0.2)]"
        >
          <span>{isLive ? "Upvote" : "Notify me"}</span>
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
