import { Home, Zap, Feather, Table, Sun, Globe } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AnimatedPlayIcon } from "@/components/animated-play-icon";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useIconLibraryMetadata } from "@/hooks/useAsyncIconLibrary";

// Icon mappings for UI
const iconMap = {
  lucide: Zap,
  feather: Feather,
  tabler: Table,
  solar: Sun,
};

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
                55,000+ icons
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
              {libraries.map((library) => {
                const IconComponent = iconMap[library.id as keyof typeof iconMap] || Zap;
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