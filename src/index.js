export { buildMission, readMission, MISSION_TYPES, REWARD_KINDS, WonderMailError } from './mission.js';
export { encodePassword, decodePassword, formatPasswordForDisplay, normalizePasswordInput } from './codec.js';
export { getDifficulty, isAboveGround, floorCount } from './difficulty.js';
export { isItemInDungeon } from './dungeon-items.js';
export { isBadDungeon, isBadItem, isBadPokemon, getBaseSpecies } from './filters.js';

import { ITEMS, DUNGEONS } from './data/items.js';
import { POKEMON } from './data/pokemon.js';
import { FRIEND_AREAS } from './data/friend-areas.js';
import { isBadDungeon, isBadItem, isBadPokemon } from './filters.js';
import { floorCount } from './difficulty.js';
import { isItemInDungeon } from './dungeon-items.js';

/* Basic thrown weapons (Stick..Geo Pebble), the Poké currency icon, and
   "Used TM" are all real items but none of them are things an NPC would ever
   ask you to find or deliver. */
const NON_OBJECTIVE_ITEM_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 105, 124]);

/** Selectable dungeons, in game order: {id, name, floors}. */
export function listDungeons() {
  const out = [];
  for (let id = 0; id < DUNGEONS.length; id++) {
    if (isBadDungeon(id)) continue;
    out.push({ id, name: DUNGEONS[id], floors: floorCount(id) });
  }
  return out;
}

/** Selectable items (id 0 = "Nothing", used as a "no item" placeholder). */
export function listItems({ includeNothing = true } = {}) {
  const out = [];
  for (let id = includeNothing ? 0 : 1; id < ITEMS.length; id++) {
    if (isBadItem(id)) continue;
    out.push({ id, name: ITEMS[id] });
  }
  return out;
}

/**
 * Selectable "find item" / "deliver item" objectives. When `dungeonId` is
 * given, results are further restricted to items that actually spawn in
 * that dungeon (matches the "find item" mission type's own rule; "deliver
 * item" has no such restriction, so omit `dungeonId` for that case).
 */
export function listObjectiveItems({ dungeonId } = {}) {
  const out = [];
  for (let id = 1; id < ITEMS.length; id++) {
    if (isBadItem(id) || NON_OBJECTIVE_ITEM_IDS.has(id)) continue;
    if (dungeonId !== undefined && !isItemInDungeon(id, dungeonId)) continue;
    out.push({ id, name: ITEMS[id] });
  }
  return out;
}

/** Selectable Pokémon (id 0 is a placeholder meaning "none chosen"), sorted by name. */
export function listPokemon() {
  const out = [{ id: 0, name: POKEMON[0] }];
  const rest = [];
  for (let id = 1; id < POKEMON.length; id++) {
    if (isBadPokemon(id)) continue;
    rest.push({ id, name: POKEMON[id] });
  }
  rest.sort((a, b) => a.name.localeCompare(b.name));
  return out.concat(rest);
}

/** Selectable Friend Areas; only the ones the reference tool exposes (id 0 = "None"). */
export function listFriendAreas() {
  const allowed = [0, 10, 14, 35, 36];
  return allowed.map((id) => ({ id, name: FRIEND_AREAS[id] }));
}
