export const EARLYBIRD_DEADLINE_MS = new Date(
  "2026-04-06T23:59:59+09:00",
).getTime();

/** 마감일 기준 남은 일 수 (0 이상, 마감 지나면 0) */
export function getEarlybirdDDay(): number {
  const diff = EARLYBIRD_DEADLINE_MS - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
