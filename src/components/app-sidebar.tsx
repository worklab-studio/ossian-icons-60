import { Home, ArrowUpRight, Code2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { useFakeAudienceCount } from "@/hooks/useFakeAudienceCount";
import { cn } from "@/lib/utils";
import { IconstackLogo } from "@/components/iconstack-logo";
import { useIconLibraryMetadata } from "@/hooks/useAsyncIconLibrary";
import { type IconItem } from "@/types/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  selectedSet: string;
  onSetChange: (setId: string) => void;
  icons?: IconItem[];
  onIconClick?: (icon: IconItem) => void;
}

function LiveCounter() {
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

/* Compact icon grid for the sidebar */
function SidebarIconGrid({ icons, onIconClick }: { icons: IconItem[]; onIconClick?: (icon: IconItem) => void }) {
  const visibleIcons = icons.slice(0, 48);

  const handleClick = (icon: IconItem) => {
    onIconClick?.(icon);
  };

  return (
    <div className="grid grid-cols-5 gap-1 p-1">
      {visibleIcons.map((icon) => (
        <button
          key={icon.id}
          onClick={() => handleClick(icon)}
          className="flex items-center justify-center aspect-square rounded-md hover:bg-accent/60 transition-colors"
          title={icon.name}
        >
          {typeof icon.svg === 'string' ? (
            <div
              dangerouslySetInnerHTML={{ __html: icon.svg }}
              className="[&>svg]:w-4 [&>svg]:h-4 text-muted-foreground"
            />
          ) : React.isValidElement(icon.svg) || typeof icon.svg === 'function' ? {
            const IconComponent = icon.svg as React.ComponentType<any>;
            return <IconComponent size={16} className="text-muted-foreground" />;
          } : null}
        </button>
      ))}
    </div>
  );
}

export function AppSidebar({
  selectedSet,
  onSetChange,
  icons = [],
  onIconClick,
}: AppSidebarProps) {
  const { libraries, totalCount } = useIconLibraryMetadata();

  const selectedLibrary = libraries.find((l) => l.id === selectedSet);

  const topNavItems = [
    {
      name: "All Icons",
      id: "all",
      count: totalCount,
      icon: Home,
    },
  ];

  return (
    <Sidebar className="border-r flex flex-col">
      {/* Fixed Header - Logo Area */}
      <SidebarHeader className="flex-shrink-0 border-b h-16">
        <div className="flex items-center px-3 h-full">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <IconstackLogo className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Iconstack</span>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">
                  Beta
                </span>
              </div>
              <span className="text-xs text-muted-foreground">50,000+ icons</span>
            </div>
          </Link>
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
                      selectedSet === item.id &&
                        "bg-accent text-accent-foreground font-medium"
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full justify-between gap-3 text-sm"
                >
                  <a href="/api" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4" />
                      <span>API &amp; MCP</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </div>

      {/* Scrollable Content Area */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Library Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Library
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button class-t                 className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium truncate">
                    {selectedSet === "all"
                      ? "All Icons"
                      : selectedLibrary?.name || selectedSet}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-56 max-h-80 overflow-y-auto"
              >
                <DropdownMenuItem
                  onClick={() => onSetChange("all")}
                  className={cn(
                    "cursor-pointer",
                    selectedSet === "all" && "bg-accent"
                  )}
                >
                  <Home className="h-4 w-4 mr-2" />
                  All Icons
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {totalCount.toLocaleString()}
                  </span>
                </DropdownMenuItem>
                {libraries.map((library) => (
                  <DropdownMenuItem
                    key={library.id}
                    onClick={() => onSetChange(library.id)}
                    className={cn(
                      "cursor-pointer",
                      selectedSet === library.id && "bg-accent"
                    )}
                  >
                    <span className="truncate">{library.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {library.count.toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mini icon grid when a library is selected */}
        {selectedSet !== "all" && icons.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {selectedLibrary?.name || selectedSet} Icons
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarIconGrid icons={icons} onIconClick={onIconClick} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="h-5 flex items-center">
          <LiveCounter />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
