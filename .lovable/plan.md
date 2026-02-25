

# Add "Dodo Invoice" Link in Sidebar

## Change

**File: `src/components/app-sidebar.tsx`**

Add a "Dodo Invoice" menu item inside the Browse section (lines 80-93), right after the "All Icons" item and before the `SidebarSeparator`. It will use the same `SidebarMenuButton` styling but render as an `<a>` tag opening in a new tab, with `FileText` icon on the left and `ArrowUpRight` icon on the right.

```tsx
// After the All Icons map, add:
<SidebarMenuItem>
  <SidebarMenuButton asChild className="w-full justify-between gap-3 text-sm">
    <a href="https://dodoinvoice.com" target="_blank" rel="noopener noreferrer">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4" />
        <span>Dodo Invoice</span>
      </div>
      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
    </a>
  </SidebarMenuButton>
</SidebarMenuItem>
```

Also import `FileText` and `ArrowUpRight` from `lucide-react`.

