import { DiscordAPIError } from 'discord.js';

/**
 * Asserts that a value is a Discord API error.
 */
export function isDiscordError(tbd: unknown): tbd is DiscordAPIError {
	return tbd instanceof DiscordAPIError;
}
