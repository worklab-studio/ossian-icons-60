export function getIconAriaLabel(iconName: string, isSelected?: boolean): string {
  const baseLabel = `Copy icon: ${iconName}`;
  return isSelected ? `${baseLabel} (selected)` : baseLabel;
}

export function getGridAriaLabel(totalIcons: number, filteredIcons?: number): string {
  if (filteredIcons !== undefined && filteredIcons !== totalIcons) {
    return `Icon grid showing ${filteredIcons} of ${totalIcons} icons`;
  }
  return `Icon grid with ${totalIcons} icons`;
}