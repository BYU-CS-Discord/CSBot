import type { ClientEvents } from 'discord.js';

export function onEvent<K extends keyof ClientEvents>(
	name: K,
	params: Omit<EventHandler<K>, 'name'>
): EventHandler<K> {
	return {
		name,
		once: params.once,
		execute: params.execute,
	};
}
