import { toast } from "@/hooks/use-toast";
import { AnimatedBookmarkIcon } from "@/components/animated-bookmark-icon";

interface FirstCopyNudgeProps {
  keyboardShortcut: string;
}

export function showFirstCopyNudge({ keyboardShortcut }: FirstCopyNudgeProps) {
  toast({
    description: (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
          <AnimatedBookmarkIcon className="text-primary/70 w-6 h-6" />
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Bookmark Iconstack ({keyboardShortcut}) to come back anytime.
          </div>
        </div>
      </div>
    ),
    duration: 7000,
    className: "min-h-[100px] p-4"
  });
}