## Plan

1. **Move the Product Hunt banner out of the left sidebar area**
   - Keep it fixed at the top, but start it after the desktop sidebar width.
   - On mobile, keep it full width.
   - Set its width to the remaining content area so it does not cover the Iconstack logo/sidebar header.

2. **Keep the desktop shell aligned under the fixed banner**
   - Remove the global top margin behavior from `.h-app-shell` that currently pushes the sidebar down.
   - Keep the shell height compensation so the visible viewport still accounts for the banner.
   - Apply the banner top offset only to the main desktop content and right control panel, not the left sidebar.

3. **Make the footer visible at the bottom**
   - Ensure the center column uses the available viewport height below the banner.
   - Keep the icon grid as the only scrollable middle area so `RotatingFooter` remains pinned and visible.

4. **Mobile remains safe**
   - Preserve the mobile banner/header stacking so the mobile header starts below the banner.