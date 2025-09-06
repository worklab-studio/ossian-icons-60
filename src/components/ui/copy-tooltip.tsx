import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyTooltipProps {
  children: React.ReactNode;
  showCopied: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CopyTooltip({ children, showCopied, onOpenChange }: CopyTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip open={showCopied} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-foreground text-background text-xs py-1 px-2"
          aria-live="polite"
        >
          <p>Copied!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}