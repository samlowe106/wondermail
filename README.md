# wondermail

A dependency-free JS library for building and reading **Wonder Mail S**
passwords for *Pokémon Mystery Dungeon: Red Rescue Team* / *Blue Rescue Team*
(GBA/DS) — the 24-character codes players type in to receive a rescue
mission.

```js
import { buildMission, REWARD_KINDS } from 'wondermail';

const mission = buildMission({
  missionType: 0, // Help me
  dungeon: 0, // Tiny Woods
  floor: 3,
  client: 25, // Pikachu
  reward: { kind: REWARD_KINDS.MONEY_ONLY }
});

mission.password; // "??JNS4+?4P6?2F?864?6P??W"
mission.mailTitle; // "Help!"
mission.mailBody; // ["I don't know how I did it, but I can't exit!", "I feel faint... Please help..."]
```

Passwords decode back the same way:

```js
import { readMission } from 'wondermail';

readMission('??JNS4+?4P6?2F?864?6P??W');
```

## Why this exists

A handful of Wonder Mail generator sites have existed for years, all
descending from the same reverse-engineered format. Two things bothered me
about them:

- **They're non-deterministic.** One field in the password (which specific
  line of in-mission flavor text gets shown) is picked with `Math.random()`
  at generation time, so typing in the exact same mission twice produces a
  different password each time. That field turns out to have **zero effect**
  on the mission itself — dungeon, floor, client, reward, all of it stay
  identical — it only reshuffles which line of filler dialog shows up. This
  library makes that byte a deterministic function of the mission (defaulting
  to a fixed value), with an optional `variant` (0-255) if you want to see a
  different valid line on purpose.
- **They render male/female/ellipsis Pokémon names and dialog as ASCII
  placeholders** (`#`, `%`, `.`) instead of the real symbols (♂, ♀, …) the
  password's own character set actually represents, and that the DS's own
  font — and keyboard — render/support directly.

## What this is not

This only covers Wonder Mail S for Red/Blue Rescue Team. It doesn't cover the
Nintendo DS Wonder Mail (Explorers of Time/Darkness/Sky) or Gates to
Infinity's Wonder Mail RR format — those are different, unrelated password
schemes.

## API

See [`src/index.js`](src/index.js) for the full surface. The short version:

- `buildMission(input)` — build a mission and get back `{ password,
  passwordDisplay, mailTitle, mailBody, reward, difficulty, ... }`.
- `readMission(password)` — decode a password into the same shape.
- `listDungeons()`, `listItems()`, `listPokemon()`, `listFriendAreas()` —
  menu-ready option lists, already filtered down to what's actually legal
  (some ids in the raw game data are unused engine slots or alternate
  formes).
- `encodePassword` / `decodePassword` — the raw codec, if you already have a
  mission encoded as a 20-element array.

## Testing

```
npm test
```

The test suite includes golden fixtures (known inputs -> known passwords)
and round-trip checks. The codec and flavor-text logic were additionally
cross-checked field-for-field against a reference implementation across
thousands of randomized cases during development.

## License

MIT. See [LICENSE](LICENSE).
