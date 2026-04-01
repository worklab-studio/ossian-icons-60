

# Add X-Autopilot Ad Banner in Control Panel

## What Changes

**`src/components/control-panel.tsx`** — Insert a promotional ad rectangle above the ColorPicker (between the header and the customize controls), pushing everything else down slightly.

The ad will be a clickable rectangle (~same height as the color swatches area, roughly 160px tall) styled to match the UI:
- Dark background with subtle border (`border border-border rounded-lg`)
- X-Autopilot branding with the Tabler X icon
- "20% off — Code: X20DI" badge
- "Automate your X posts" tagline
- Links to `https://xautopilot.app?ref=iconstack`
- Subtle "Ad" label in corner for transparency

## Layout

```text
┌─────────────────┐
│   Customize     │  ← header (unchanged)
├─────────────────┤
│  ┌─────────────┐│
│  │ X-Autopilot ││  ← NEW ad rectangle
│  │ 20% off     ││
│  │ Code: X20DI ││
│  └─────────────┘│
│  Color Picker   │  ← existing (shifted down)
│  Stroke Slider  │
├─────────────────┤
│  Export buttons  │  ← footer (unchanged)
└─────────────────┘
```

## Technical Details

- Add `TbBrandX` and `ArrowUpRight` imports
- Insert a styled `<a>` block inside the ScrollArea, before `<ColorPicker />`
- Use `bg-zinc-900 dark:bg-zinc-800` with orange accent for the coupon code badge (consistent with footer promo)
- Only one file modified: `src/components/control-panel.tsx`

