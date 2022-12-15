import type { Snowflake } from 'discord.js';
import type { EvilHangmanGame } from './evilHangmanGame';

export class GameStore {
	public readonly games: Map<Snowflake, EvilHangmanGame> = new Map();
}
