import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";

export function StrokeSlider() {
  const { customization, updateStrokeWidth, resetToDefaults } = useIconCustomization();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Stroke Width</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-3">
        <Slider
          value={[customization.strokeWidth]}
          onValueChange={(value) => updateStrokeWidth(value[0])}
          min={0.5}
          max={3}
          step={0.25}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5</span>
          <span className="font-medium text-foreground">
            {customization.strokeWidth}px
          </span>
          <span>3.0</span>
        </div>
      </div>
    </div>
  );
}