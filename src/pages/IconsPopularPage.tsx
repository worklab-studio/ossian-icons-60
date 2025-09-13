import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Home, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconstackLogo } from "@/components/iconstack-logo";
import { ControlPanel } from "@/components/control-panel";
import { SectionedIconGrid } from "@/components/icon-grid/SectionedIconGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { useToast } from "@/hooks/use-toast";
import { copyIcon } from "@/lib/copy";
import type { IconItem, LibrarySection } from "@/types/icon";

export function IconsPopularPage() {
  const [popularSections, setPopularSections] = useState<LibrarySection[]>([]);
  const [totalIconCount, setTotalIconCount] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { customization } = useIconCustomization();
  const { toast } = useToast();

  // Load popular icons on component mount
  useEffect(() => {
    async function loadPopularIcons() {
      try {
        setLoading(true);
        const sections = await iconLibraryManager.getPopularIconsGrouped();
        setPopularSections(sections);
        const total = sections.reduce((sum, section) => sum + section.icons.length, 0);
        setTotalIconCount(total);
        console.log(`Loaded ${total} total popular icons across ${sections.length} libraries`);
      } catch (error) {
        console.error("Failed to load popular icons:", error);
        toast({
          title: "Error loading icons",
          description: "Failed to load popular icons. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadPopularIcons();
  }, [toast]);

  const handleIconCopy = async (icon: IconItem) => {
    try {
      await copyIcon(icon, customization.color, customization.strokeWidth);
      
      toast({
        title: "Icon copied!",
        description: `${icon.name} has been copied to your clipboard.`,
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy icon. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIconClick = (icon: IconItem) => {
    setSelectedIcon(icon);
  };

  return (
    <>
      <Helmet>
        <title>Popular Icons - Top 1000 Free SVG Icons | Iconstack</title>
        <meta 
          name="description" 
          content="Browse the most popular 1000 SVG icons from top icon libraries. Free to download and customize. Perfect for web design, apps, and presentations." 
        />
        <meta property="og:title" content="Popular Icons - Top 1000 Free SVG Icons | Iconstack" />
        <meta property="og:description" content="Browse the most popular 1000 SVG icons from top icon libraries. Free to download and customize." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Popular Icons - Top 1000 Free SVG Icons" />
        <meta name="twitter:description" content="Browse the most popular 1000 SVG icons from top icon libraries. Free to download and customize." />
        <link rel="canonical" href="https://iconstack.io/icons/popular" />
      </Helmet>

      <SidebarProvider>
        <div className="h-screen w-full overflow-hidden">
          <div className="flex h-screen w-full overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen">
              {/* Header with Logo and Theme Toggle */}
              <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                      <IconstackLogo className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-primary">Iconstack</span>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Beta</span>
                      </div>
                      <span className="text-xs text-muted-foreground">50,000+ icons</span>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </header>
              
              {/* Breadcrumb Navigation */}
              <div className="border-b px-6 py-3">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        Home
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Popular Icons</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Page Title */}
              <div className="border-b px-6 py-6">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">Popular Icons</h1>
                    <p className="text-muted-foreground mt-1">
                      Top {totalIconCount} most popular icons across all libraries
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="shrink-0"
                  >
                    Explore All 50,000+ Icons
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
                  Browse the top 1,000 most popular icons from leading libraries like Tabler, Heroicons, Material, Lucide, Phosphor, Bootstrap Icons, Iconoir, Octicons, Solar Icons, and Mingcute. Explore even more with 50,000+ free SVG icons across 21 additional libraries on Iconstack.
                </p>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64 px-6">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading popular icons...</p>
                    </div>
                  </div>
                ) : popularSections.length === 0 ? (
                  <div className="flex items-center justify-center h-64 px-6">
                    <div className="text-center">
                      <p className="text-lg font-medium">No icons found</p>
                      <p className="text-muted-foreground mt-1">No popular icons available</p>
                    </div>
                  </div>
                ) : (
                  <SectionedIconGrid
                    sections={popularSections}
                    selectedId={selectedIcon?.id}
                    onCopy={handleIconCopy}
                    onIconClick={handleIconClick}
                    color={customization.color}
                    strokeWidth={customization.strokeWidth}
                    ariaLabel={`Popular icons grid with ${totalIconCount} icons organized by library`}
                  />
                )}
              </div>

              {/* Footer */}
              <footer className="border-t px-6 py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p>© 2024 Iconstack. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <a href="/license" className="hover:text-foreground transition-colors">
                      License
                    </a>
                    <a href="/" className="hover:text-foreground transition-colors">
                      Browse All Icons
                    </a>
                  </div>
                </div>
              </footer>
            </div>

            {/* Right Control Panel */}
            <ControlPanel 
              selectedIcon={selectedIcon} 
              selectedSet="popular"
            />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}