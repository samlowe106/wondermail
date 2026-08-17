import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMission,
  readMission,
  REWARD_KINDS,
  WonderMailError,
  listDungeons,
  listItems,
  listObjectiveItems,
  listPokemon,
  getDungeonDifficultyRange,
  getDifficultyLetter
} from '../src/index.js';

/* Golden fixtures: known-good (input, expected password) pairs. If one of
   these starts failing, either a data table changed or the codec broke --
   both are worth stopping and looking at, not "fixing" by updating the
   fixture. */
const FIXTURES = [
  {
    input: { missionType: 0, dungeon: 0, floor: 3, client: 25, reward: { kind: REWARD_KINDS.MONEY_ONLY } },
    password: '??JNS4+?4P6?2F?864?6P??W',
    mailTitle: 'Help!'
  },
  {
    input: {
      missionType: 1,
      dungeon: 2,
      floor: 7,
      client: 25,
      target: 133,
      reward: { kind: REWARD_KINDS.MONEY_PLUS_ITEM, item: 55 }
    },
    password: '??-.S4T?4RN?XF?664?R%??W',
    mailTitle: 'Hurry, save Eevee!'
  },
  {
    input: {
      missionType: 2,
      dungeon: 5,
      floor: 10,
      client: 1,
      target: 4,
      reward: { kind: REWARD_KINDS.ITEM_PLUS_MYSTERY, item: 79 }
    },
    password: '??1K?4S?4PR?2??66?609??W',
    mailTitle: 'I want to see Charmander.'
  },
  {
    input: {
      missionType: 3,
      dungeon: 4,
      floor: 5,
      client: 1,
      item: 55,
      reward: { kind: REWARD_KINDS.ITEM_PLUS_MYSTERY, item: 57 }
    },
    password: '??1C?4+?437?5F??84?T3??W',
    mailTitle: 'One Oran Berry wanted!'
  },
  {
    input: { missionType: 4, dungeon: 7, floor: 12, client: 216, item: 79, reward: { kind: REWARD_KINDS.MONEY_ONLY } },
    password: '??JWS40??Q8?6N?-0??5P??W',
    mailTitle: 'Deliver one Calcium.'
  },
  {
    input: { missionType: 0, dungeon: 5, floor: 10, client: 350, reward: { kind: REWARD_KINDS.FRIEND_AREA, friendArea: 10 } },
    password: '6?2KY4X??8R?FJ?K6?F6P??W',
    mailTitle: "I'm lost."
  },
  {
    /* Nidoran's client name renders with the real ♂ glyph, not a "#" placeholder. */
    input: { missionType: 2, dungeon: 1, floor: 4, client: 29, target: 32, reward: { kind: REWARD_KINDS.MONEY_ONLY } },
    password: '??J9X4X?1P7?Y??F6??0P??W',
    mailTitle: 'Please save my love!'
  }
];

test('buildMission produces the expected password and mail text for known inputs', () => {
  for (const fixture of FIXTURES) {
    const result = buildMission(fixture.input);
    assert.equal(result.password, fixture.password, `password for ${JSON.stringify(fixture.input)}`);
    assert.equal(result.mailTitle, fixture.mailTitle);
  }
});

test('buildMission is deterministic: identical inputs always produce the identical password', () => {
  const input = { missionType: 1, dungeon: 6, floor: 8, client: 6, target: 9, reward: { kind: REWARD_KINDS.MONEY_ONLY } };
  const first = buildMission(input);
  for (let i = 0; i < 20; i++) {
    assert.equal(buildMission(input).password, first.password);
  }
});

test('a different variant can change the password without changing the mission', () => {
  const base = { missionType: 0, dungeon: 10, floor: 15, client: 143, reward: { kind: REWARD_KINDS.MONEY_ONLY } };
  const a = buildMission({ ...base, variant: 0 });
  const b = buildMission({ ...base, variant: 200 });
  assert.notEqual(a.password, b.password);
  assert.equal(a.dungeon.id, b.dungeon.id);
  assert.equal(a.reward, b.reward);
  assert.equal(a.difficulty, b.difficulty);
});

test('readMission round-trips every fixture password back to the same fields', () => {
  for (const fixture of FIXTURES) {
    const built = buildMission(fixture.input);
    const read = readMission(built.password);
    assert.equal(read.password, built.password);
    assert.equal(read.mailTitle, built.mailTitle);
    assert.deepEqual(read.mailBody, built.mailBody);
  }
});

test('readMission rejects garbage input', () => {
  assert.throws(() => readMission('not a real password'), WonderMailError);
  assert.throws(() => readMission('AAAA AAAA AAAA AAAA AAAA'), WonderMailError);
});

test('buildMission validates required fields', () => {
  assert.throws(() => buildMission({ missionType: 1, dungeon: 0, floor: 1, client: 25 }), WonderMailError);
  assert.throws(() => buildMission({ missionType: 3, dungeon: 0, floor: 1, client: 25 }), WonderMailError);
});

test('buildMission rejects an item that cannot appear in the chosen dungeon', () => {
  assert.throws(
    () => buildMission({ missionType: 3, dungeon: 0, floor: 1, client: 25, item: 240, reward: { kind: REWARD_KINDS.MONEY_ONLY } }),
    WonderMailError
  );
});

test('getDungeonDifficultyRange matches known dungeon difficulty ranges', () => {
  const dungeons = listDungeons();
  const tinyWoods = dungeons.find((d) => d.name === 'Tiny Woods');
  const fantasyStrait = dungeons.find((d) => d.name === 'Fantasy Strait');

  assert.deepEqual(getDungeonDifficultyRange(0, tinyWoods.id), {
    min: 0,
    max: 0,
    minLetter: 'E',
    maxLetter: 'E',
    label: 'E'
  });
  assert.deepEqual(getDungeonDifficultyRange(0, fantasyStrait.id), {
    min: 3,
    max: 4,
    minLetter: 'B',
    maxLetter: 'A',
    label: 'B-A'
  });

  // Escort missions run two notches harder throughout, so the range shifts up.
  const escortRange = getDungeonDifficultyRange(2, fantasyStrait.id);
  assert.equal(escortRange.min, 4);
  assert.equal(escortRange.max, 5);
  assert.equal(escortRange.label, 'A-S');
});

test('getDifficultyLetter matches the in-game E..S/* scale', () => {
  assert.equal(getDifficultyLetter(0), 'E');
  assert.equal(getDifficultyLetter(4), 'A');
  assert.equal(getDifficultyLetter(5), 'S');
  assert.equal(getDifficultyLetter(6), '*');
});

test('listDungeons carries a difficulty range per dungeon that reflects mission type', () => {
  const helpMe = listDungeons({ missionType: 0 });
  const escort = listDungeons({ missionType: 2 });
  const tinyWoodsHelp = helpMe.find((d) => d.name === 'Tiny Woods');
  const tinyWoodsEscort = escort.find((d) => d.name === 'Tiny Woods');
  assert.equal(tinyWoodsHelp.difficulty.label, 'E');
  assert.equal(tinyWoodsEscort.difficulty.min > tinyWoodsHelp.difficulty.min, true);
});

test('listing helpers return non-empty, well-formed data', () => {
  const dungeons = listDungeons();
  assert.ok(dungeons.length > 0);
  for (const d of dungeons) assert.ok(d.floors > 0, `${d.name} should have floors`);

  const items = listItems();
  assert.ok(items.some((item) => item.name === 'Oran Berry'));

  const pokemon = listPokemon();
  assert.ok(pokemon.some((p) => p.name === 'Nidoran♂'));
  assert.ok(pokemon.some((p) => p.name === 'Nidoran♀'));
});

test('listObjectiveItems excludes basic thrown weapons and Poké/Used TM, and can restrict to a dungeon', () => {
  const all = listObjectiveItems();
  assert.ok(!all.some((item) => item.id >= 1 && item.id <= 8));
  assert.ok(!all.some((item) => item.name === 'POKé'));
  assert.ok(!all.some((item) => item.name === 'Used TM'));
  assert.ok(all.some((item) => item.name === 'Oran Berry'));

  const inSilentChasm = listObjectiveItems({ dungeonId: 4 });
  assert.ok(inSilentChasm.length < all.length);
  assert.ok(inSilentChasm.every((item) => all.some((a) => a.id === item.id)));
});
