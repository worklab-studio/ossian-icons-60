import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { IconGrid } from "@/components/icon-grid/IconGrid";
import { Header } from "@/components/header";
import { ControlPanel } from "@/components/control-panel";
import { RotatingFooter } from "@/components/RotatingFooter";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { useFakeAudienceCount } from "@/hooks/useFakeAudienceCount";
import { IconstackLogo } from "@/components/iconstack-logo";
import { type IconItem } from "@/types/icon";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Home as HomeIcon, User, Settings, Search, Menu, Heart, Star, Check, Plus,
  Minus, Edit, Download, Upload, Mail, Phone, Calendar, Clock,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Play,
  Camera, Image, File, Globe, Lock, Eye, EyeOff, Bell,
  Send, Share, Archive, Bookmark, Sun, Activity, AlertCircle,
  Circle, Square, Triangle, Zap, Wifi, Battery, Volume2, Music
} from "lucide-react";

// Create sample data with 1200 icons
const sampleIcons: IconItem[] = [];
const iconComponents = [
  HomeIcon, User, Settings, Search, Menu, Heart, Star, Check, Plus,
  Minus, Edit, Download, Upload, Mail, Phone, Calendar, Clock,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Play,
  Camera, Image, File, Globe, Lock, Eye, EyeOff, Bell,
  Send, Share, Archive, Bookmark, Sun, Activity, AlertCircle,
  Circle, Square, Triangle, Zap, Wifi, Battery, Volume2, Music
];

const iconNames = [
  "home", "user", "settings", "search", "menu", "heart", "star", "check", "plus",
  "minus", "edit", "download", "upload", "mail", "phone", "calendar", "clock",
  "arrow-right", "arrow-left", "arrow-up", "arrow-down", "play",
  "camera", "image", "file", "globe", "lock", "eye", "eye-off", "bell",
  "send", "share", "archive", "bookmark", "sun", "activity", "alert-circle",
  "circle", "square", "triangle", "zap", "wifi", "battery", "volume", "music"
];

for (let i = 0; i < 1200; i++) {
  const baseIndex = i % iconComponents.length;
  const IconComponent = iconComponents[baseIndex];
  const baseName = iconNames[baseIndex];
  sampleIcons.push({
    id: `icon-${i}`,
    name: `${baseName}-${Math.floor(i / iconComponents.length) + 1}`,
    svg: IconComponent,
    tags: [baseName, "ui", "interface"],
  });
}

function DemoLiveCounter() {
  const count = useFakeAudienceCount();
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs text-muted-foreground">
        <span className="font-bold">{count.toLocaleString()}</span> designers browsing
      </span>
    </div>
  );
}

function DemoSidebar() {
  return (
    <Sidebar className="border-r flex flex-col">
      <SidebarHeader className="flex-shrink-0 border-b h-16">
        <div className="flex items-center px-3 h-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <IconstackLogo className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Iconstack</span>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">Demo</span>
              </div>
              <span className="text-xs text-muted-foreground">Icon Browser Demo</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <div className="flex-shrink-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-between gap-3 text-sm bg-accent text-accent-foreground font-medium">
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4" />
                    <span>All Icons</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {sampleIcons.length.toLocaleString()}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </div>

      <SidebarContent className="flex-1 overflow-y-auto" />

      <SidebarFooter className="border-t p-4">
        <div className="h-5 flex items-center">
          <DemoLiveCounter />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function IconsDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { customization } = useIconCustomization();

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return sampleIcons;
    const query = searchQuery.toLowerCase();
    return sampleIcons.filter(icon =>
      icon.name.toLowerCase().includes(query) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const selectedIcon = useMemo(() => {
    if (!selectedId) return null;
    return sampleIcons.find(icon => icon.id === selectedId) || null;
  }, [selectedId]);

  const handleCopy = (icon: IconItem) => {
    // handled by IconCell internally
  };

  const handleIconClick = (icon: IconItem) => {
    setSelectedId(prev => prev === icon.id ? null : icon.id);
  };

  return (
    <>
      <Helmet>
        <title>Icon Browser Demo – Iconstack</title>
        <meta name="description" content="Browse 1,200 sample SVG icons in a professional icon browser demo. Search, customize colors & stroke width, and download icons in SVG or PNG format." />
        <link rel="canonical" href="https://iconstack.io/demo/icons" />
      </Helmet>

      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <DemoSidebar />

          <div className="flex-1 flex flex-col h-screen">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery("")}
            />

            <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-background">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Icon Browser Demo</h1>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `${filteredIcons.length.toLocaleString()} icons matching "${searchQuery}"`
                    : `${filteredIcons.length.toLocaleString()} icons`
                  }
                </p>
              </div>
            </div>

            <main className="flex-1 overflow-hidden">
              {filteredIcons.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-center px-6">
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">No icons found</p>
                    <p className="text-sm text-muted-foreground">Try a different search term</p>
                  </div>
                </div>
              ) : (
                <IconGrid
                  items={filteredIcons}
                  selectedId={selectedId}
                  onCopy={handleCopy}
                  onIconClick={handleIconClick}
                  color={customization.color}
                  strokeWidth={customization.strokeWidth}
                  libraryName="Demo Icons"
                />
              )}
            </main>

            <RotatingFooter />
          </div>

          <ControlPanel selectedIcon={selectedIcon} selectedSet="demo" />
        </div>
      </SidebarProvider>
    </>
  );
}
