import type { Client } from 'discord.js';

import * as logger from '../../logger';

/**
 * Unregisters all command interactions globally and in each guild for this account.
 */
export async function revokeCommands(client: Client<true>): Promise<void> {
	logger.info('Revoking global commands...');
	await client.application.commands.set([]);
	logger.info('Revoked global commands');

	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));

	logger.info(`Revoking commands in ${guilds.length} guild(s)...`);
	for (const guild of guilds) {
		await guild.commands.set([]);
		logger.info(`Revoked commands in guild ${guild.id}`);
	}
}
