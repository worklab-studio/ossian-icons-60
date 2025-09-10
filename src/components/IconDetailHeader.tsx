import { ThemeToggle } from "@/components/theme-toggle";
import { IconstackLogo } from "@/components/iconstack-logo";

export function IconDetailHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <IconstackLogo />
        <ThemeToggle />
      </div>
    </header>
  );
}