/**
 * URL helpers for converting between icon names and URL-safe formats
 */

export function iconNameToUrlSafe(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^a-z0-9-]/g, '')     // remove special chars except hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

export function urlSafeToIconName(urlSafe: string): string {
  return urlSafe
    .replace(/-/g, ' ')              // hyphens to spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // capitalize words
}

export function generateIconUrl(libraryId: string, iconName: string): string {
  const safeName = iconNameToUrlSafe(iconName);
  return `/icon/${libraryId}/${safeName}`;
}

export function parseIconUrl(libraryId: string, iconNameParam: string): { libraryId: string; iconName: string } {
  return {
    libraryId,
    iconName: urlSafeToIconName(iconNameParam)
  };
}