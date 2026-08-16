import { DIFFICULTIES, ABOVE_GROUND } from './data/difficulty.js';
import { FLOORS_PER_DUNGEON } from './data/tables.js';

/* Star rating (0-6) the game assigns a mission, driven by how deep the floor
   is in the dungeon; escort missions (missionType 2) get bumped up two
   notches since escorting an NPC through a whole dungeon is harder. */
export function getDifficulty(missionType, dungeonId, floor) {
  if (floor <= 0 || dungeonId >= DIFFICULTIES.length) return 0;
  const floorRatings = DIFFICULTIES[dungeonId];
  const index = floor - 1;
  if (index >= floorRatings.length) return 0;
  let rating = floorRatings[index];
  if (missionType === 2) rating += 2;
  rating = Math.min(rating, 15);
  rating = Math.floor(rating / 2);
  return Math.min(rating, 6);
}

export function isAboveGround(dungeonId) {
  if (dungeonId >= ABOVE_GROUND.length) return true;
  return Boolean(ABOVE_GROUND[dungeonId]);
}

export function floorCount(dungeonId) {
  return FLOORS_PER_DUNGEON[dungeonId] || 0;
}
