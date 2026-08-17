# Wondermail

A dependency-free JavaScript library for building and reading Wonder Mail passwords from *Pokémon Mystery Dungeon: Red Rescue Team* / *Blue Rescue Team*. Other Mystery Dungeon games are currently **not supported**, although I may choose to support them in the future.

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

## Features

- **No dependencies**: the JavaScript ecosystem is [not very good](https://en.wikipedia.org/wiki/Npm#Package_controversies) (to put it lightly), so I've written this package with no dependencies.
- **Deterministic**: all fields are generated deterministically, so the same inputs yield the same outputs every time. (Some other websites choose the flavor text randomly each time.)
- **Proper rendering** of the game's symbols (♂, ♀, …).
- **Alphabetical sorting** of mission rewards for convenience.

## API

See [`src/index.js`](src/index.js) for the full surface. The short version:

- `buildMission(input)` to build a mission and get back `{ password, passwordDisplay, mailTitle, mailBody, reward, difficulty, ... }`.
- `readMission(password)` decodes a password into the same shape.
- `listDungeons()`, `listItems()`, `listPokemon()`, `listFriendAreas()` are menu-ready option lists, already filtered down to what's actually legal (some ids in the raw game data are unused engine slots or alternate forms).
- `encodePassword` / `decodePassword` is the raw codec, if you already have a mission encoded as a 20-element array.

## Testing

```
npm test
```

The test suite includes golden fixtures (known inputs -> known passwords) and round-trip checks. The codec and flavor-text logic were additionally cross-checked field-for-field against a reference implementation across thousands of randomized cases during development. Obviously, nothing replaces human testing and inputting the codes into the games yourself.

## License

Wondermail is licensed under the [MIT license](LICENSE).
