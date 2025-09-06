import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIconLibraryMetadata } from "@/hooks/useAsyncIconLibrary";
import { Layers, Zap } from "lucide-react";

const iconMap: Record<string, any> = {
  lucide: Zap,
};

interface MobileLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSet: string;
  onSetChange: (setId: string) => void;
}

export function MobileLibraryDrawer({
  isOpen,
  onClose,
  selectedSet,
  onSetChange,
}: MobileLibraryDrawerProps) {
  const { libraries } = useIconLibraryMetadata();

  const handleSetChange = (setId: string) => {
    onSetChange(setId);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <div className="shrink-0 bg-background border-b">
          <DrawerHeader>
            <DrawerTitle>Icon Libraries</DrawerTitle>
          </DrawerHeader>
        </div>
        
        {/* Browse Section - Fixed/Sticky */}
        <div className="shrink-0 px-4 pt-4 pb-2 bg-background border-b">
          <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Browse
          </h3>
          <div className="space-y-1">
            <Button
              variant={selectedSet === "all" ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
              onClick={() => handleSetChange("all")}
            >
              <Layers className="mr-3 h-4 w-4" />
              All Icons
            </Button>
          </div>
        </div>

        {/* Libraries Section - Scrollable */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-4 pb-6 pt-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Libraries
            </h3>
            <div className="space-y-1">
              {libraries.map((library) => {
                const IconComponent = iconMap[library.id] || Zap;
                return (
                  <Button
                    key={library.id}
                    variant={selectedSet === library.id ? "secondary" : "ghost"}
                    className="w-full justify-between h-10"
                    onClick={() => handleSetChange(library.id)}
                  >
                    <div className="flex items-center">
                      <IconComponent className="mr-3 h-4 w-4" />
                      {library.name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {library.count.toLocaleString()}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}