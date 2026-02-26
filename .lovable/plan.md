

# Make FAQ Section Collapsible

## Overview

Wrap the entire FAQ section in a collapsible container so it starts collapsed and doesn't take up space by default. Users can expand it with a single click.

## Changes

### File: `src/components/LibraryFAQ.tsx`

- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Import `ChevronDown` from `lucide-react`
- Wrap the entire section in a `Collapsible` (defaultOpen={false})
- The heading "Frequently Asked Questions about {Library} Icons" becomes the `CollapsibleTrigger` with a chevron indicator that rotates on open
- The accordion content goes inside `CollapsibleContent`
- This way the FAQ is hidden by default, showing only the clickable title bar

### No other files need changes

