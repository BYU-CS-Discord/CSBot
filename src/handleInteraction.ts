import type { CommandInteraction, DMChannel, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { allCommands } from './commands';
import { ChannelType } from 'discord.js';
import { isGuildedCommandContext } from './helpers/guards/isGuildedCommandContext';
import { logUser } from './helpers/logUser';
import { replyPrivately, sendMessageInChannel } from './helpers/actions/messages/replyToMessage';

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
 *
 * @param logger The place to write system messages.
 */
export async function handleInteraction(
	interaction: CommandInteraction,
	logger: Console
): Promise<void> {
	// Don't respond to bots or ourselves
	if (interaction.user.bot) return;
	if (interaction.user.id === interaction.client.user.id) return;

	logger.debug(`User ${logUser(interaction.user)} sent command: '${interaction.commandName}'`);

	const command = allCommands.get(interaction.commandName);
	if (!command) return;

	const SPACES_TO_INDENT = 2;
	logger.debug(
		`Calling command handler '${command.name}' with options ${JSON.stringify(
			interaction.options,
			undefined, // plain results
			SPACES_TO_INDENT
		)}`
	);

	let member: GuildMember | null;
	if (interaction.inCachedGuild()) {
		member = interaction.member;
	} else {
		member = (await interaction.guild?.members.fetch(interaction.user)) ?? null;
	}

	let channel: GuildTextBasedChannel | DMChannel | null;
	if (interaction.channel?.type === ChannelType.DM && interaction.channel.partial) {
		channel = await interaction.channel.fetch();
	} else {
		channel = interaction.channel;
	}

	const context: CommandContext = {
		createdTimestamp: interaction.createdTimestamp,
		user: interaction.user,
		member,
		guild: interaction.guild,
		channel,
		client: interaction.client,
		interaction,
		options: interaction.options.data,
		logger,
		async prepareForLongRunningTasks(ephemeral) {
			try {
				await interaction.deferReply({ ephemeral });
			} catch (error) {
				logger.error('Failed to defer reply to interaction:', error);
			}
		},
		async replyPrivately(options, viaDm: boolean = false) {
			if (viaDm) {
				// We need to say *something* to the interaction itself, or Discord will think we died.
				const content = ':paperclip: Check your DMs';
				if (interaction.deferred) {
					try {
						await interaction.editReply(content);
					} catch (error) {
						logger.error('Failed to edit reply to interaction:', error);
					}
				} else {
					try {
						await interaction.reply({ content, ephemeral: true });
					} catch (error) {
						logger.error('Failed to reply to interaction:', error);
					}
				}
			}
			if (interaction.deferred && !viaDm) {
				try {
					if (typeof options === 'string') {
						await interaction.followUp({ ephemeral: true, content: options });
					} else {
						await interaction.followUp({ ...options, ephemeral: true });
					}
				} catch (error) {
					logger.error('Failed to follow up on interaction:', error);
				}
			} else {
				const reply = await replyPrivately(interaction, options, viaDm);
				if (reply === false) {
					logger.info(`User ${logUser(interaction.user)} has DMs turned off.`);
				}
			}
		},
		async reply(options) {
			if (interaction.deferred) {
				try {
					await interaction.editReply(options);
				} catch (error) {
					logger.error('Failed to edit reply to interaction:', error);
					await interaction.followUp(options);
				}
			} else {
				try {
					if (typeof options === 'string') {
						await interaction.reply(options);
					} else if (
						!('shouldMention' in options) ||
						options.shouldMention === undefined ||
						options.shouldMention
					) {
						// Doesn't say whether to mention, default to `true`
						await interaction.reply(options);
					} else {
						// Really shouldn't mention
						await interaction.reply({
							...options,
							allowedMentions: { users: [] },
						});
					}
				} catch (error) {
					logger.error('Failed to reply to interaction:', error);
				}
			}

			if (typeof options !== 'string' && 'ephemeral' in options && options?.ephemeral === true) {
				// FIXME: We didn't actually send the reply if we errored out
				logger.info(
					`Sent ephemeral reply to User ${logUser(interaction.user)}: ${JSON.stringify(options)}`
				);
			}
		},
		async followUp(options) {
			if (
				typeof options !== 'string' &&
				(!('reply' in options) || options.reply === false || options.reply === undefined) &&
				interaction.channel?.isTextBased() === true
			) {
				return (
					(await sendMessageInChannel(interaction.channel, { ...options, reply: undefined })) ??
					false
				);
			}
			try {
				return await interaction.followUp(options);
			} catch (error) {
				logger.error('Failed to follow up on interaction:', error);
				return false;
			}
		},
		sendTyping() {
			void interaction.channel?.sendTyping();
			logger.debug(
				`Typing in channel ${interaction.channel?.id ?? 'nowhere'} due to Context.sendTyping`
			);
		},
	};

	if (!command.requiresGuild) {
		// No guild required
		logger.debug(`Command '${command.name}' does not require guild information.`);
		logger.debug('Proceeding...');
		return await command.execute(context);
	}

	if (!isGuildedCommandContext(context)) {
		// No guild found
		logger.debug(`Command '${command.name}' requires guild information, but none was found.`);
		return await context.reply({
			content: "Can't do that here",
			ephemeral: true,
		});
	}

	return await command.execute(context);
}
