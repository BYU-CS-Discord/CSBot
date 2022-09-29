import type { User } from 'discord.js';

/**
 * Creates a user-identifying string that can be logged to the console.
 * @returns a string of the form `"{user ID} ({username})"`
 */
export function logUser(user: User): string {
	return `${user.id} (${user.username})`;
}
