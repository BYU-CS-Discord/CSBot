import type { Snowflake } from 'discord.js';
import type { EvilHangmanGame } from './evilHangmanGame';

type GameStore = Map<Snowflake, EvilHangmanGame>;

export const gameStore: GameStore = new Map();
