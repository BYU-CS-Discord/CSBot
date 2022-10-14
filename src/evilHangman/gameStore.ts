import type { Snowflake } from 'discord.js';

export class GameStore {
	public readonly games: Map<Snowflake, number> = new Map(); // TODO: number is just a placeholder for game
}
