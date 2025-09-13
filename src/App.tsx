import React from "react";
import { useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme-provider";
import { IconCustomizationProvider } from "@/contexts/IconCustomizationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import IconsDemo from "./app/demo/icons/page";
import LibraryPage from "./pages/LibraryPage";
import IconDetailPage from "./pages/IconDetailPage";
import { IconsPopularPage } from "./pages/IconsPopularPage";
import LicensePage from "./pages/LicensePage";
import Sitemap from "./components/Sitemap";
import { SitemapService } from "./services/SitemapService";

const queryClient = new QueryClient();

// Dynamic sitemap component
function DynamicLibrarySitemap() {
  const { libraryId } = useParams<{ libraryId: string }>();
  const [sitemapContent, setSitemapContent] = React.useState<string>('');
  
  React.useEffect(() => {
    if (libraryId) {
      SitemapService.generateLibrarySitemap(libraryId).then(setSitemapContent);
    }
  }, [libraryId]);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sitemapContent }} />
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <IconCustomizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo/icons" element={<IconsDemo />} />
            <Route path="/icons/popular" element={<IconsPopularPage />} />
            <Route path="/library/:libraryId" element={<LibraryPage />} />
            <Route path="/icon/:libraryId/:iconName" element={<IconDetailPage />} />
            <Route path="/license" element={<LicensePage />} />
                <Route path="/404" element={<NotFound />} />
                
                {/* Dynamic sitemap routes */}
                <Route path="/sitemap.xml" element={<Sitemap />} />
                <Route 
                  path="/sitemap-main.xml" 
                  element={
                    <div dangerouslySetInnerHTML={{ 
                      __html: SitemapService.generateMainSitemap() 
                    }} />
                  } 
                />
                <Route 
                  path="/sitemap-:libraryId.xml" 
                  element={<DynamicLibrarySitemap />} 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </IconCustomizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
