import { Package2, Home, Layers, Map, Grid3X3, Box, Code2, Feather, Zap, Crown, Palette, Atom, Gamepad2, Music, TestTube, Circle, Table, Play, Globe, Minus, Hash, Bug, Workflow, GitBranch, Component, Sparkles, Sun } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AnimatedPlayIcon } from "@/components/animated-play-icon";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useIconLibraryMetadata } from "@/hooks/useAsyncIconLibrary";

// Icon mappings for UI
const iconMap = {
  material: Sparkles,
  atlas: Globe,
  lucide: Zap,
  feather: Feather,
  solar: Sun,
  phosphor: Atom,
  tabler: Table,
  bootstrap: Layers,
  remix: Music,
  boxicons: Package2,
  'css-gg': Code2,
  iconsax: Crown,
  line: Minus,
  pixelart: Hash,
  teeny: Circle,
  ant: Bug,
  fluent: Workflow,
  iconnoir: Palette,
  octicons: GitBranch,
  radix: Component,
  animated: AnimatedPlayIcon,
};

// Placeholder libraries (coming soon)
const placeholderLibraries = [
  // All libraries are now active!
];

interface AppSidebarProps {
  selectedSet: string;
  onSetChange: (setId: string) => void;
}

export function AppSidebar({ selectedSet, onSetChange }: AppSidebarProps) {
  const { libraries, totalCount } = useIconLibraryMetadata();
  
  // Create top navigation items
  const topNavItems = [
    {
      name: "All Icons",
      id: "all",
      count: totalCount,
      icon: Home
    },
    {
      name: "Animated",
      id: "animated", 
      count: libraries.find(lib => lib.id === 'animated')?.count || 0,
      icon: AnimatedPlayIcon
    }
  ];

  return (
    <Sidebar className="border-r flex flex-col">
      {/* Fixed Header - Logo Area */}
      <SidebarHeader className="flex-shrink-0 border-b h-16">
        <div className="flex items-center px-3 h-full">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <IconstackLogo className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Iconstack</span>
              <span className="text-xs text-muted-foreground">
                50,000+ icons
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Fixed Browse Section */}
      <div className="flex-shrink-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSetChange(item.id)}
                    className={cn(
                      "w-full justify-between gap-3 text-sm",
                      selectedSet === item.id && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {item.count.toLocaleString()}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </div>

      {/* Scrollable Content Area */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Icon Libraries */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Libraries
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraries
                .filter(lib => lib.id !== 'animated') // Exclude animated from main libraries
                .map((library) => {
                  const IconComponent = iconMap[library.id as keyof typeof iconMap] || Box;
                  return (
                    <SidebarMenuItem key={library.id}>
                      <SidebarMenuButton 
                        onClick={() => onSetChange(library.id)}
                        className={cn(
                          "w-full justify-between gap-3 text-sm",
                          selectedSet === library.id && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4" />
                          <span>{library.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {library.count.toLocaleString()}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}