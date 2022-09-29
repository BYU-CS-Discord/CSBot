import type { Client } from 'discord.js';
import { allCommands } from '../../commands';

/**
 * Verify that the deployed command list is up-to-date, and yell in the console if it's not.
 *
 * @param client The Discord.js client whose commands to validate.
 * @param logger The place to send error messages
 */
export async function verifyCommandDeployments(
	client: Client<true>,
	logger: Console
): Promise<void> {
	await verifyGlobalCommandDeployments(client, logger);
	await verifyGuildCommandDeployments(client, logger);
}

async function verifyGuildCommandDeployments(client: Client<true>, logger: Console): Promise<void> {
	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));

	const expectedCommandNames = Array.from(allCommands.values())
		.filter(c => c.requiresGuild === true)
		.map(c => c.name)
		.sort(sortAlphabetically);

	for (const guild of guilds) {
		const actualCommandNames = (await guild.commands.fetch())
			.map(c => c.name)
			.sort(sortAlphabetically);

		if (actualCommandNames.length !== expectedCommandNames.length) {
			logger.warn(
				`The deployed commands in guild '${guild.id}' differ from the expected command list: Expected ${expectedCommandNames.length} command(s), but Discord returned ${actualCommandNames.length}. Please redeploy.`
			);
			return;
		}

		for (let idx = 0; idx < actualCommandNames.length; idx++) {
			const deployedName = actualCommandNames[idx] ?? '';
			const expectedName = expectedCommandNames[idx] ?? '';
			if (deployedName !== expectedName) {
				logger.warn(
					`The deployed commands in guild '${guild.id}' differ from the expected command list: Expected a command named '${expectedName}', but found '${deployedName}'. Please redeploy.`
				);
				break;
			}
		}
	}
}

async function verifyGlobalCommandDeployments(
	client: Client<true>,
	logger: Console
): Promise<void> {
	const expectedCommandNames = Array.from(allCommands.values())
		.filter(c => c.requiresGuild === false)
		.map(c => c.name)
		.sort(sortAlphabetically);

	const actualCommandNames = (await client.application.commands.fetch())
		.map(c => c.name)
		.sort(sortAlphabetically);

	if (actualCommandNames.length !== expectedCommandNames.length) {
		logger.warn(
			`The deployed commands differ from the expected command list: Expected ${expectedCommandNames.length} global command(s), but Discord returned ${actualCommandNames.length}. Please redeploy.`
		);
		return;
	}

	for (let idx = 0; idx < actualCommandNames.length; idx++) {
		const deployedName = actualCommandNames[idx] ?? '';
		const expectedName = expectedCommandNames[idx] ?? '';
		if (deployedName !== expectedName) {
			logger.warn(
				`The deployed commands differ from the expected command list: Expected a command named '${expectedName}', but found '${deployedName}'. Please redeploy.`
			);
			break;
		}
	}
}

function sortAlphabetically(a: string, b: string): number {
	return a.localeCompare(b);
}
