import { IconItem } from '@/types/icon';
import { multiWordScore, extractWords } from '@/lib/search-algorithms';

export function findSimilarIcons(
  targetIcon: IconItem,
  allIcons: IconItem[],
  libraryId: string,
  maxResults: number = 12
): IconItem[] {
  if (!targetIcon) return [];

  const targetWords = extractWords(targetIcon.name);
  const targetTags = targetIcon.tags || [];

  const scored = allIcons
    .filter((icon) => 
      icon.id !== targetIcon.id && // Exclude the current icon
      icon.id.startsWith(libraryId) // Only icons from same library
    )
    .map((icon) => {
      let score = 0;

      // Name similarity (highest weight)
      const nameScore = multiWordScore(targetWords, icon.name, 1.0);
      score += nameScore * 0.6;

      // Tag similarity (medium weight)
      if (targetTags.length > 0 && icon.tags) {
        const commonTags = targetTags.filter(tag => 
          icon.tags?.some(iconTag => 
            iconTag.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(iconTag.toLowerCase())
          )
        );
        const tagScore = commonTags.length / Math.max(targetTags.length, icon.tags.length);
        score += tagScore * 0.3;
      }

      // Style similarity (low weight)
      if (targetIcon.style && icon.style && targetIcon.style === icon.style) {
        score += 0.1;
      }

      return { icon, score };
    })
    .filter(({ score }) => score > 0.1) // Only include reasonably similar icons
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ icon }) => icon);

  return scored;
}