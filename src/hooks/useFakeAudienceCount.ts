import { useState, useEffect } from "react";

function getBaseCount(): number {
  const hour = new Date().getHours();
  // Seed based on hour for consistency within the same hour
  const seed = Math.sin(hour * 9301 + 49297) * 49297;
  const normalized = seed - Math.floor(seed); // 0-1
  // Higher during work hours (9-18), lower at night
  const isWorkHours = hour >= 9 && hour <= 18;
  const min = isWorkHours ? 5500 : 4100;
  const max = isWorkHours ? 8500 : 6500;
  return Math.floor(min + normalized * (max - min));
}

export function useFakeAudienceCount(): number {
  const [count, setCount] = useState(getBaseCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const base = getBaseCount();
        // Keep within ±50 of base
        const next = prev + delta;
        if (Math.abs(next - base) > 150) return base;
        return next;
      });
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
