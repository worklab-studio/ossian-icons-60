import React from "react";
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
import Sitemap from "./components/Sitemap";

const queryClient = new QueryClient();

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
                <Route path="/library/:libraryId" element={<LibraryPage />} />
                <Route path="/sitemap.xml" element={<Sitemap />} />
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
