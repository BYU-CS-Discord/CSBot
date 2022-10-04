// Dependencies
import type { CommandInteraction, DMChannel, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { ChannelType } from 'discord.js';

// Internal dependencies
import { logUser } from '../helpers/logUser';
import { allCommands } from '../commands';
import { followUpFactory } from '../commandContext/followUp';
import { prepareForLongRunningTasksFactory } from '../commandContext/prepareForLongRunningTasks';
import { replyFactory } from '../commandContext/reply';
import { replyPrivatelyFactory } from '../commandContext/replyPrivately';
import { sendTypingFactory } from '../commandContext/sendTyping';
import { getLogger } from '../logger';
const logger = getLogger();

/**
 * The event handler for Discord Interactions (usually chat commands)
 */
export const interactionCreate: EventHandler<'interactionCreate'> = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		try {
			if (interaction.isCommand()) {
				await handleInteraction(interaction);
			}
		} catch (error) {
			logger.error('Failed to handle interaction:', error);
		}
	},
};

/**
 * Performs actions from a Discord command interaction.
 * The command is ignored if the interaction is from a bot.
 *
 * Constructs a context object to send to command executors.
 * This context handles many edge cases and gotchas with interactions,
 * including follow-up responses, long-running commands,
 * typing indicators, ephemeral replies, partial fields,
 * and error handling.
 *
 * The goal is for us devs to not have to worry about how exactly
 * things get done when we're writing command handlers, only
 * that what we say goes.
 */
async function handleInteraction(interaction: CommandInteraction): Promise<void> {
	// Don't respond to bots or ourselves
	if (interaction.user.bot) return;
	if (interaction.user.id === interaction.client.user.id) return;

	logger.debug(`User ${logUser(interaction.user)} sent command: '${interaction.commandName}'`);

	const command = allCommands.get(interaction.commandName);
	if (!command) {
		logger.warn(`Received request to execute unknown command named '${interaction.commandName}'`);
		return;
	}

	const SPACES_TO_INDENT = 2;
	logger.debug(
		`Calling command handler '${command.name}' with options ${JSON.stringify(
			interaction.options,
			undefined, // plain results
			SPACES_TO_INDENT
		)}`
	);

	const guild = interaction.guild;

	let member: GuildMember | null;
	if (interaction.inCachedGuild()) {
		member = interaction.member;
	} else {
		member = (await guild?.members.fetch(interaction.user)) ?? null;
	}

	let channel: GuildTextBasedChannel | DMChannel | null;
	if (interaction.channel?.type === ChannelType.DM && interaction.channel.partial) {
		channel = await interaction.channel.fetch();
	} else {
		channel = interaction.channel;
	}

	const vagueContext: Omit<CommandContext, 'source'> = {
		createdTimestamp: interaction.createdTimestamp,
		user: interaction.user,
		member,
		guild,
		channelId: interaction.channelId,
		channel,
		client: interaction.client,
		interaction,
		options: interaction.options.data,
		prepareForLongRunningTasks: prepareForLongRunningTasksFactory(interaction),
		replyPrivately: replyPrivatelyFactory(interaction),
		reply: replyFactory(interaction),
		followUp: followUpFactory(interaction),
		sendTyping: sendTypingFactory(interaction),
	};

	let context: CommandContext;

	// The following assertions assume that discord.js behaves consistently,
	// checking the `guild` and `member` fields. See for reference
	// https://github.com/discordjs/discord.js/blob/14.5.0/packages/discord.js/src/structures/BaseInteraction.js#L176

	/* eslint-disable @typescript-eslint/consistent-type-assertions */
	if (interaction.inGuild()) {
		context = { ...vagueContext, source: 'guild' } as GuildedCommandContext;
	} else {
		context = { ...vagueContext, source: 'dm' } as DMCommandContext;
	}
	/* eslint-enable @typescript-eslint/consistent-type-assertions */

	if (!command.requiresGuild) {
		// No guild required
		logger.debug(`Command '${command.name}' does not require guild information.`);
		logger.debug('Proceeding...');
		return await command.execute(context);
	}

	if (context.source === 'dm') {
		// No guild found
		logger.debug(`Command '${command.name}' requires guild information, but none was found.`);
		return await context.reply({
			content: "Can't do that here",
			ephemeral: true,
		});
	}

	return await command.execute(context);
}
