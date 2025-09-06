import React, { useState, useMemo } from "react";
import { SimpleIconGrid } from "@/components/icon-grid/SimpleIconGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { type IconItem } from "@/types/icon";
import { 
  Home, User, Settings, Search, Menu, Heart, Star, Check, Plus,
  Minus, Edit, Download, Upload, Mail, Phone, Calendar, Clock,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Play,
  Camera, Image, File, Globe, Lock, Eye, EyeOff, Bell, 
  Send, Share, Archive, Bookmark, Sun, Activity, AlertCircle,
  Circle, Square, Triangle, Zap, Wifi, Battery, Volume2, Music
} from "lucide-react";

// Create sample data with 1000+ icons
const sampleIcons: IconItem[] = [];
const iconComponents = [
  Home, User, Settings, Search, Menu, Heart, Star, Check, Plus,
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

// Generate 1200 sample icons by repeating the base set
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

export default function IconsDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("icon-42");
  const [color, setColor] = useState("#666666");
  const [strokeWidth, setStrokeWidth] = useState([1.5]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return sampleIcons;
    
    const query = searchQuery.toLowerCase();
    return sampleIcons.filter(icon => 
      icon.name.toLowerCase().includes(query) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleCopy = (icon: IconItem) => {
    console.log('Copied icon:', icon.name);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Icon Browser Demo</h1>
          <p className="text-muted-foreground">
            Professional icon grid with {sampleIcons.length} icons. Try searching, 
            adjusting colors, or clicking icons to copy them.
          </p>
        </div>

        {/* Controls */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search Icons</Label>
            <Input
              id="search"
              placeholder="Search by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Icon Color</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Stroke Width: {strokeWidth[0]}</Label>
            <Slider
              value={strokeWidth}
              onValueChange={setStrokeWidth}
              min={0.25}
              max={3}
              step={0.25}
              className="w-full"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredIcons.length.toLocaleString()} icons
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          
          <button
            onClick={() => setSelectedId(selectedId === "icon-42" ? null : "icon-42")}
            className="text-sm text-primary hover:underline"
          >
            {selectedId ? "Clear selection" : "Select featured icon"}
          </button>
        </div>

        {/* Icon Grid */}
        <SimpleIconGrid
          icons={filteredIcons}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}