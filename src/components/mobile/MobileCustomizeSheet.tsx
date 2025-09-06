import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/components/color-picker";
import { StrokeSlider } from "@/components/stroke-slider";
import { Separator } from "@/components/ui/separator";

interface MobileCustomizeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileCustomizeSheet({
  isOpen,
  onClose,
}: MobileCustomizeSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="sticky top-0 bg-background border-b z-10">
          <DrawerHeader>
            <DrawerTitle>Customize Icons</DrawerTitle>
          </DrawerHeader>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-6 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Color</h3>
              <ColorPicker />
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}