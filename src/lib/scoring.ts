export const POINTS_PER_CELL = 10;
export const ROOM_CLEAR_BONUS = 100;

export const COMBO_WINDOW_MS = 800;

export const COMBO_BONUSES: Record<number, number> = {
  2: 5,
  3: 10,
};
export const COMBO_BONUS_4PLUS = 20;

export function getComboBonus(streak: number): number {
  if (streak < 2) return 0;
  if (streak >= 4) return COMBO_BONUS_4PLUS;
  return COMBO_BONUSES[streak] ?? 0;
}

export function computeMultiplier(roomsCleared: number): number {
  return Math.round((1.0 + roomsCleared * 0.2) * 10) / 10;
}

export function applyMultiplier(roomPoints: number, multiplier: number): number {
  return Math.round(roomPoints * multiplier);
}
