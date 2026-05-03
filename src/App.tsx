import React, { Suspense, lazy } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme-provider";
import { IconCustomizationProvider } from "@/contexts/IconCustomizationContext";
import Sitemap from "./components/Sitemap";
import { SitemapService } from "./services/SitemapService";
import { ProductHuntPopup } from "@/components/ProductHuntPopup";

// Code-split routes — keeps the initial JS bundle (Index + icon libs) out of
// the way when users land on lighter pages like /api or /license.
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IconsDemo = lazy(() => import("./app/demo/icons/page"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const IconDetailPage = lazy(() => import("./pages/IconDetailPage"));
const IconsPopularPage = lazy(() =>
  import("./pages/IconsPopularPage").then(m => ({ default: m.IconsPopularPage }))
);
const LicensePage = lazy(() => import("./pages/LicensePage"));
const ApiDocsPage = lazy(() => import("./pages/ApiDocsPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const CategoryLibraryPage = lazy(() => import("./pages/CategoryLibraryPage"));
const BlogIndexPage = lazy(() => import("./pages/BlogIndexPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

const queryClient = new QueryClient();

// Reset scroll on every route change so navigations don't appear "stuck".
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

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
              <ScrollToTop />
              <ProductHuntPopup />
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/demo/icons" element={<IconsDemo />} />
                  <Route path="/icons/popular" element={<IconsPopularPage />} />
                  <Route path="/library/:libraryId" element={<LibraryPage />} />
                  <Route path="/icon/:libraryId/:iconName" element={<IconDetailPage />} />
                  <Route path="/license" element={<LicensePage />} />
                  <Route path="/api" element={<ApiDocsPage />} />
                  <Route path="/icons/:category/:libraryId" element={<CategoryLibraryPage />} />
                  <Route path="/icons/:category" element={<CollectionPage />} />
                  <Route path="/compare/:slug" element={<ComparisonPage />} />
                  <Route path="/blog" element={<BlogIndexPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </IconCustomizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
