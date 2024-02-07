import type { Client } from 'discord.js';

import { info } from '../../logger.js';

/**
 * Unregisters all command interactions globally and in each guild for this account.
 */
export async function revokeCommands(client: Client<true>): Promise<void> {
	info('Revoking global commands...');
	await client.application.commands.set([]);
	info('Revoked global commands');

	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));

	info(`Revoking commands in ${guilds.length} guild(s)...`);
	for (const guild of guilds) {
		await guild.commands.set([]);
		info(`Revoked commands in guild ${guild.id}`);
	}
}
