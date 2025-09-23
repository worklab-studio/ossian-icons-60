import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIconCustomization } from "@/contexts/IconCustomizationContext";
import { useTheme } from "next-themes";

const presetColors = [
  // Row 1 - Grayscale
  "#000000", "#FFFFFF", "#4A4A4A", "#B0B0B0",
  // Row 2 - Blues/Purples  
  "#3B82F6", "#6366F1", "#A855F7", "#EC4899",
  // Row 3 - Reds/Oranges/Browns
  "#EF4444", "#F97316", "#F59E0B", "#8B5E3C", 
  // Row 4 - Greens/Teals/Blues
  "#22C55E", "#14B8A6", "#06B6D4", "#0EA5E9"
];

// Convert Hex to HSV
const hexToHsv = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return [h, s, v];
};

// Convert HSV to RGB
const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

export function ColorPicker() {
  const { customization, updateColor } = useIconCustomization();
  const { theme } = useTheme();
  const [hexInput, setHexInput] = useState(customization.color);
  
  // Initialize HSV values based on the current customization color
  const initialHsv = useMemo(() => hexToHsv(customization.color), []);
  const [hue, setHue] = useState(initialHsv[0]);
  const [saturation, setSaturation] = useState(initialHsv[1]);
  const [value, setValue] = useState(initialHsv[2]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'color-area' | 'hue-slider' | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoize the current HSL color for the gradient
  const hslColor = useMemo(() => `hsl(${hue}, 100%, 50%)`, [hue]);

  const handleHexChange = (inputValue: string) => {
    // Normalize input - add # if missing
    const normalizedValue = inputValue.startsWith('#') ? inputValue : `#${inputValue}`;
    setHexInput(normalizedValue);
    
    // Validate hex color (accepts both #RRGGBB and #RGB formats)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(normalizedValue)) {
      updateColor(normalizedValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setHexInput(color);
    updateColor(color);
    
    // Convert hex to HSV and update the picker position
    const [h, s, v] = hexToHsv(color);
    setHue(h);
    setSaturation(s);
    setValue(v);
  };

  // Debounced color update
  const debouncedUpdateColor = useCallback((h: number, s: number, v: number) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const [r, g, b] = hsvToRgb(h, s, v);
      const hexColor = rgbToHex(r, g, b);
      setHexInput(hexColor);
      updateColor(hexColor);
    }, 8); // Reduced from 16ms to 8ms for smoother updates
  }, [updateColor]);

  const handleCanvasInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!target || isDragging) return; // Prevent interaction if already dragging something else
    
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const newSaturation = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.max(0, Math.min(1, 1 - (y / rect.height)));
    
    setSaturation(newSaturation);
    setValue(newValue);
    
    debouncedUpdateColor(hue, newSaturation, newValue);
  }, [hue, isDragging, debouncedUpdateColor]);

  const handleHueSliderInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const slider = hueSliderRef.current;
    if (!slider || isDragging) return; // Prevent interaction if already dragging something else
    
    const rect = slider.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const x = clientX - rect.left;
    const newHue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    
    setHue(newHue);
    debouncedUpdateColor(newHue, saturation, value);
  }, [saturation, value, isDragging, debouncedUpdateColor]);

  // Handle mouse and touch events for smooth dragging
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragTarget) return;
      
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;
      
      // Only handle the specific drag target to prevent cross-interaction
      if (dragTarget === 'hue-slider') {
        const hueSlider = hueSliderRef.current;
        if (!hueSlider) return;
        
        const hueRect = hueSlider.getBoundingClientRect();
        const x = clientX - hueRect.left;
        const newHue = Math.max(0, Math.min(360, (x / hueRect.width) * 360));
        setHue(newHue);
        debouncedUpdateColor(newHue, saturation, value);
      } else if (dragTarget === 'color-area') {
        const colorArea = document.querySelector('[data-color-area]') as HTMLDivElement;
        if (!colorArea) return;
        
        const rect = colorArea.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const newSaturation = Math.max(0, Math.min(1, x / rect.width));
        const newValue = Math.max(0, Math.min(1, 1 - (y / rect.height)));
        
        setSaturation(newSaturation);
        setValue(newValue);
        debouncedUpdateColor(hue, newSaturation, newValue);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setDragTarget(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragTarget, hue, saturation, value, debouncedUpdateColor]);

  // Sync HSV values when customization color changes externally
  useEffect(() => {
    const [h, s, v] = hexToHsv(customization.color);
    setHue(h);
    setSaturation(s);
    setValue(v);
    setHexInput(customization.color);
  }, [customization.color]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Color</Label>
      
      {/* Main color picker area */}
      <div className="space-y-6">
        <div className="relative select-none">
          <div
            data-color-area
            className="w-full h-48 md:h-40 rounded-lg cursor-crosshair touch-none"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hslColor})`
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragTarget('color-area');
              handleCanvasInteraction(e);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsDragging(true);
              setDragTarget('color-area');
              handleCanvasInteraction(e);
            }}
            onClick={handleCanvasInteraction}
          />
          {/* Picker indicator */}
          <div
            className="absolute w-4 h-4 md:w-3 md:h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${saturation * 100}%`,
              top: `${(1 - value) * 100}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>
        
        {/* Hue slider */}
        <div
          ref={hueSliderRef}
          className="relative w-full h-6 md:h-4 rounded-lg cursor-pointer select-none touch-none"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragTarget('hue-slider');
            handleHueSliderInteraction(e);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
            setDragTarget('hue-slider');
            handleHueSliderInteraction(e);
          }}
          onClick={handleHueSliderInteraction}
        >
          <div
            className="absolute w-6 h-6 md:w-4 md:h-4 bg-white border-2 border-gray-300 rounded-full shadow-lg"
            style={{
              left: `${(hue / 360) * 100}%`,
              transform: 'translateX(-50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* Color display - hidden on mobile */}
      <div className="space-y-3 hidden md:block">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md border border-border shadow-sm flex-shrink-0"
            style={{ backgroundColor: customization.color }}
          />
          <div className="flex-1">
            <Input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#4F46E5"
              className="text-sm font-mono h-8"
            />
          </div>
        </div>
      </div>
      
      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Presets</Label>
        <div className="grid grid-cols-8 gap-2 md:gap-1.5">
          {presetColors.map((color) => (
            <Button
              key={color}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetClick(color)}
              className="h-9 w-9 md:h-7 md:w-7 p-0 rounded-full border-2 hover:scale-110 transition-transform duration-150"
              style={{ 
                backgroundColor: color,
                borderColor: customization.color === color ? '#ffffff' : (color === '#FFFFFF' && theme !== 'dark' ? 'rgba(128, 128, 128, 0.5)' : 'transparent'),
                boxShadow: customization.color === color ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}