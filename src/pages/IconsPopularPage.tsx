import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Home } from "lucide-react";
import { Header } from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import { ControlPanel } from "@/components/control-panel";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { iconLibraryManager } from "@/services/IconLibraryManager";
import { useToast } from "@/hooks/use-toast";
import { copyIcon } from "@/lib/copy";
import type { IconItem } from "@/types/icon";

export function IconsPopularPage() {
  const [popularIcons, setPopularIcons] = useState<IconItem[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<IconItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { customization } = useIconCustomization();
  const { toast } = useToast();

  // Load popular icons on component mount
  useEffect(() => {
    async function loadPopularIcons() {
      try {
        setLoading(true);
        const icons = await iconLibraryManager.getPopularIcons();
        setPopularIcons(icons);
        setFilteredIcons(icons);
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

  // Filter icons based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIcons(popularIcons);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = popularIcons.filter(icon =>
      icon.name.toLowerCase().includes(query) ||
      icon.id.toLowerCase().includes(query) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredIcons(filtered);
  }, [searchQuery, popularIcons]);

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

  const handleSearchClear = () => {
    setSearchQuery("");
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
            <AppSidebar selectedSet="popular" onSetChange={() => {}} />
            
            <div className="flex-1 flex flex-col h-screen">
              <Header 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchClear={handleSearchClear}
              />
              
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
              <div className="border-b px-6 py-4">
                <h1 className="text-2xl font-bold">Popular Icons</h1>
                <p className="text-muted-foreground mt-1">
                  Top {popularIcons.length} most popular icons across all libraries
                  {searchQuery && ` (${filteredIcons.length} matching "${searchQuery}")`}
                </p>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading popular icons...</p>
                    </div>
                  </div>
                ) : filteredIcons.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-lg font-medium">No icons found</p>
                      <p className="text-muted-foreground mt-1">
                        {searchQuery ? `No icons match "${searchQuery}"` : "No popular icons available"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <IconGrid
                    items={filteredIcons}
                    selectedId={selectedIcon?.id}
                    onCopy={handleIconCopy}
                    onIconClick={handleIconClick}
                    color={customization.color}
                    strokeWidth={customization.strokeWidth}
                    ariaLabel={`Popular icons grid with ${filteredIcons.length} icons`}
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