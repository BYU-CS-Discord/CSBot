import { EmbedBuilder } from 'discord.js';

export const help: GlobalCommand = {
	name: 'help',
	description: 'Prints the list of commands',
	requiresGuild: false,
	async execute({ guild, reply }) {
		// Dynamic import here b/c ./index depends on this file
		const { allCommands } = await import('./index');

		const embed = new EmbedBuilder() //
			.setTitle('All commands');

		function embedCommand(command: Command): void {
			embed.addFields({
				name: `\`/${command.name}\``, // i.e. `/help`
				value: command.description,
			});
		}

		for (const command of allCommands.values()) {
			if (guild) {
				// We're in a guild. We should check the user's permissions,
				// and skip this command if they aren't allowed to use it.
				// TODO: Grab the guild's configured permissions for this channel
				embedCommand(command);
				continue;
			}

			// We're in DMs; command should have dmPermission if we're to print it.
			// Discord defaults dmPermission to `true`, so `undefined` should behave that way.
			// See https://discordjs.guide/interactions/slash-commands.html#dm-permission
			if (command.dmPermission === false) continue;

			embedCommand(command);
		}

		await reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};
