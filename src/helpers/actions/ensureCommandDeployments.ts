import type { ApplicationCommand, Client, Guild } from 'discord.js';

import { allCommands } from '../../commands/index.js';
import { deployableCommand } from './deployableCommand.js';
import { warn } from '../../logger.js';

/**
 * Verify that the deployed command list is up-to-date, and yell in the console if it's not.
 *
 * @param client The Discord.js client whose commands to validate.
 * @param logger The place to send error messages
 */
export async function ensureCommandDeployments(client: Client<true>): Promise<void> {
	const expectedCommands = Array.from(allCommands.values());
	const expectedGlobalCommands = expectedCommands.filter(c => !c.requiresGuild);
	const expectedGuildCommands = expectedCommands.filter(c => c.requiresGuild);

	// Check global commands
	const deployedGlobalCommandsMap = await client.application.commands.fetch();
	const deployedGlobalCommands = Array.from(deployedGlobalCommandsMap.values());

	// If any are missing, deploy them:
	const toDeploy: Array<GlobalCommand | UserContextMenuCommand | MessageContextMenuCommand> = [];
	for (const expectedGlobalCommand of expectedGlobalCommands) {
		if (!deployedGlobalCommands.some(cmd => cmd.name === expectedGlobalCommand.info.name)) {
			toDeploy.push(expectedGlobalCommand);
		}
	}
	for (const cmd of toDeploy) {
		await client.application.commands.create(deployableCommand(cmd));
	}

	const toDelete: Array<ApplicationCommand> = [];
	for (const deployedGlobalCommand of deployedGlobalCommands) {
		const expectation = allCommands.get(deployedGlobalCommand.name);
		// If unknown to us, revoke:
		if (!expectation) {
			toDelete.push(deployedGlobalCommand);
			continue;
		}
		// If different from what we know, edit:
		if (!deployedGlobalCommand.equals(expectation.info, true)) {
			await deployedGlobalCommand.edit(expectation.info);
			continue;
		}
	}
	for (const cmd of toDelete) {
		await cmd.delete();
	}

	// TODO: For known guilds, run `ensureCommandDeploymentsForGuild`

	const globalDiff = await diffGlobalCommandDeployments(client);
	if (globalDiff) {
		const issue = globalDiff.issue;
		const expected = globalDiff.expected;
		const actual = globalDiff.actual;
		switch (issue) {
			case 'content': {
				warn(
					`The deployed commands differ from the expected command list: Expected a command named '${expected}', but found '${actual}'. Please redeploy.`
				);
				break;
			}
			case 'length': {
				warn(
					`The deployed commands differ from the expected command list: Expected ${expected} global command(s), but Discord returned ${actual}. Please redeploy.`
				);
				break;
			}
			default: {
				/* istanbul ignore next */
				assertUnreachable(issue);
			}
		}
	}

	const guildedDiff = await diffGuildCommandDeployments(client);
	if (guildedDiff) {
		const issue = guildedDiff.issue;
		const expected = guildedDiff.expected;
		const actual = guildedDiff.actual;
		const guildId = guildedDiff.guild.id;
		switch (issue) {
			case 'content': {
				warn(
					`The deployed commands in guild '${guildId}' differ from the expected command list: Expected a command named '${expected}', but found '${actual}'. Please redeploy.`
				);
				break;
			}
			case 'length': {
				warn(
					`The deployed commands in guild '${guildId}' differ from the expected command list: Expected ${expected} command(s), but Discord returned ${actual}. Please redeploy.`
				);
				break;
			}
			default: {
				/* istanbul ignore next */
				assertUnreachable(issue);
			}
		}
	}
}

export async function ensureCommandDeploymentsForGuild(guild: Guild): Promise<void> {
	// TODO: Check commands.
	// TODO:   If any are missing, deploy them.
	// TODO:   If any differ from what we know, edit them.
	// TODO:   If any are unknown to us, revoke them.
}

async function diffGuildCommandDeployments(
	client: Client<true>
): Promise<(Diff & { guild: Guild }) | null> {
	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));

	const expectedCommandNames = Array.from(allCommands.values())
		.filter(c => c.requiresGuild)
		.map(c => c.info.name)
		.sort(sortAlphabetically);

	for (const guild of guilds) {
		const commands = await guild.commands.fetch();
		const actualCommandNames = commands.map(c => c.name).sort(sortAlphabetically);

		const diff = diffArrays(expectedCommandNames, actualCommandNames);
		if (diff) return { ...diff, guild };
	}

	return null; // all clear!
}

async function diffGlobalCommandDeployments(client: Client<true>): Promise<Diff | null> {
	const expectedCommandNames = Array.from(allCommands.values())
		.filter(c => !c.requiresGuild)
		.map(c => c.info.name)
		.sort(sortAlphabetically);

	const commands = await client.application.commands.fetch();
	const actualCommandNames = commands.map(c => c.name).sort(sortAlphabetically);

	return diffArrays(expectedCommandNames, actualCommandNames);
}

// MARK: - Difference between arrays

interface Diff {
	readonly issue: 'length' | 'content';
	readonly expected: string | number;
	readonly actual: string | number;
}

function diffArrays(expected: ReadonlyArray<string>, actual: ReadonlyArray<string>): Diff | null {
	if (actual.length !== expected.length) {
		return {
			issue: 'length',
			expected: expected.length,
			actual: actual.length,
		};
	}

	for (const [idx, element] of actual.entries()) {
		const deployedName = element;
		const expectedName = expected[idx] ?? '';
		if (deployedName !== expectedName) {
			return {
				issue: 'content',
				expected: expectedName,
				actual: deployedName,
			};
		}
	}

	return null; // all clear!
}

function sortAlphabetically(a: string, b: string): number {
	return a.localeCompare(b);
}

/* istanbul ignore next */
function assertUnreachable(value: never): never {
	throw new EvalError(`Unreachable case: ${JSON.stringify(value)}`);
}
