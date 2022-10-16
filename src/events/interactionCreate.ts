// External dependencies
import type { CommandInteraction, DMChannel, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { ApplicationCommandType, ChannelType } from 'discord.js';

// Internal dependencies
import * as logger from '../logger';
import { logUser } from '../helpers/logUser';
import { allCommands } from '../commands';
import { followUpFactory } from '../commandContext/followUp';
import { prepareForLongRunningTasksFactory } from '../commandContext/prepareForLongRunningTasks';
import { replyFactory } from '../commandContext/reply';
import { replyPrivatelyFactory } from '../commandContext/replyPrivately';
import { sendTypingFactory } from '../commandContext/sendTyping';
import { onEvent } from '../helpers/onEvent';

/**
 * The event handler for Discord Interactions (usually chat commands)
 */
export const interactionCreate = onEvent('interactionCreate', {
	once: false,
	async execute(interaction) {
		try {
			// Don't respond to bots or ourselves
			if (interaction.user.bot) return;
			if (interaction.user.id === interaction.client.user.id) return;

			if (interaction.isCommand()) {
				const context = await handleInteraction(interaction);
				await handleCommandInteraction(context, interaction);
			}
		} catch (error) {
			logger.error('Failed to handle interaction:', error);
		}
	},
});

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
async function handleCommandInteraction(
	vagueContext: InteractionContext,
	interaction: CommandInteraction
): Promise<void> {
	logger.debug(`User ${logUser(interaction.user)} sent command: '${interaction.commandName}'`);

	const command = allCommands.get(interaction.commandName);
	if (!command) {
		logger.warn(`Received request to execute unknown command named '${interaction.commandName}'`);
		return;
	}

	logger.debug(`Calling command handler '${command.info.name}'`);

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
		logger.debug(`Command '${command.info.name}' does not require guild information.`);
		logger.debug('Proceeding...');

		if ('type' in command && command.type === ApplicationCommandType.Message) {
			if (!interaction.isMessageContextMenuCommand()) {
				throw new TypeError('Expected a Message Context Menu Command interaction');
			}
			const messageContextMenuCommandContext: MessageContextMenuCommandContext = {
				...context,
				interaction,
				targetId: interaction.targetId,
				targetMessage: interaction.targetMessage,
				targetUser: null,
				targetMember: null,
				options: null,
			};
			return await command.execute(messageContextMenuCommandContext);
		} else if ('type' in command && command.type === ApplicationCommandType.User) {
			if (!interaction.isUserContextMenuCommand()) {
				throw new TypeError('Expected a User Context Menu Command interaction');
			}
			let targetMember: GuildMember | null = null;
			if (interaction.inCachedGuild()) {
				targetMember = interaction.targetMember;
			} else {
				// Fetch the guild member if it's partial
				targetMember = (await context.guild?.members.fetch(interaction.targetId)) ?? null;
			}
			const userContextMenuCommandContext: UserContextMenuCommandContext = {
				...context,
				interaction,
				targetId: interaction.targetId,
				targetMember,
				targetUser: interaction.targetUser,
				targetMessage: null,
				options: null,
			};
			return await command.execute(userContextMenuCommandContext);
		}

		return await command.execute(context);
	}

	if (context.source === 'dm') {
		// No guild found
		logger.debug(`Command '${command.info.name}' requires guild information, but none was found.`);
		return await context.reply({
			content: "Can't do that here",
			ephemeral: true,
		});
	}

	return await command.execute(context);
}

async function handleInteraction(interaction: RepliableInteraction): Promise<InteractionContext> {
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

	const context: InteractionContext = {
		source: interaction.inGuild() ? 'guild' : 'dm',
		createdTimestamp: interaction.createdTimestamp,
		user: interaction.user,
		member,
		guild,
		channelId: interaction.channelId,
		channel,
		client: interaction.client,
		interaction,
		prepareForLongRunningTasks: prepareForLongRunningTasksFactory(interaction),
		replyPrivately: replyPrivatelyFactory(interaction),
		reply: replyFactory(interaction),
		followUp: followUpFactory(interaction),
		sendTyping: sendTypingFactory(interaction),
	};

	return context;
}
