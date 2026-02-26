

# "Free [Brand] Icon" Title Pattern for Brand Icons

## Overview

Update the title generation logic in `IconMetaService` so that brand icon pages (Simple Icons library) use the pattern **"Free [Brand] Icon - SVG Download | Simple Icons"** instead of the generic pattern. This targets high-volume searches like "free amazon icon", "free spotify icon", etc.

## Changes

### File: `src/services/IconMetaService.ts`

**`generateTitle` method** (line 132): Add `libraryId` parameter and use conditional logic:
- If `libraryId === 'simple'`: return `"Free {iconName} Icon - SVG Download | Simple Icons"`
- Otherwise: keep current pattern `"{iconName} Icon - Free SVG Download | {libraryName} Icons"`

**`generateOGTitle` method** (line 202): Same conditional logic for Open Graph titles.

**`generateEnhancedMeta` method** (line 109): Pass `libraryId` to both `generateTitle` and `generateOGTitle`.

**`generateDescription` method**: For Simple Icons, adjust description to lead with "Free {iconName} brand icon..." instead of "Download {iconName} icon..."

### No other files need changes

