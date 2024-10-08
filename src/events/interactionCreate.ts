import type {
	AutocompleteInteraction,
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
	RepliableInteraction,
} from 'discord.js';
import { EmbedBuilder, Colors, ApplicationCommandType, ChannelType } from 'discord.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { allButtons } from '../buttons/index.js';
import { allCommands } from '../commands/index.js';
import { followUpFactory } from '../commandContext/followUp.js';
import { prepareForLongRunningTasksFactory } from '../commandContext/prepareForLongRunningTasks.js';
import { replyFactory } from '../commandContext/reply.js';
import { replyPrivatelyFactory } from '../commandContext/replyPrivately.js';
import { sendTypingFactory } from '../commandContext/sendTyping.js';
import { DISCORD_API_MAX_CHOICES } from '../constants/apiLimitations.js';
import { logUser } from '../helpers/logUser.js';
import { onEvent } from '../helpers/onEvent.js';
import { UserMessageError } from '../helpers/UserMessageError.js';
import { debug, error, warn } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
				const context = await generateContext(interaction);
				await handleCommandInteraction(context, interaction);
			} else if (interaction.isButton()) {
				const context = await generateContext(interaction);
				await handleButtonInteraction(context, interaction);
			} else if (interaction.isAutocomplete()) {
				await handleAutocompleteInteraction(interaction);
			}
		} catch (error_) {
			error('Failed to handle interaction:', error_);
		}
	},
});

/**
 * Performs actions from a Discord command interaction.
 *
 * Constructs a context object to send to command executors.
 * This context handles many edge cases and gotchas with
 * interactions, including follow-up responses, long-running
 * commands, typing indicators, ephemeral replies, partial
 * fields, and error handling.
 *
 * The goal is for us devs to not have to worry about how exactly
 * things get done when we're writing command handlers, only
 * that what we say goes.
 */
async function handleCommandInteraction(
	vagueContext: InteractionContext,
	interaction: CommandInteraction
): Promise<void> {
	debug(`User ${logUser(interaction.user)} sent command: '${interaction.commandName}'`);

	const command = allCommands.get(interaction.commandName);
	if (!command) {
		warn(`Received request to execute unknown command named '${interaction.commandName}'`);
		// Fixes weird hangs when the command list is out of date:
		await sendErrorMessage(
			interaction,
			`Unknown command name '${interaction.commandName}'. Contact the bot operator and make sure they deployed the latest set of commands.`
		);
		return;
	}

	debug(`Calling command handler '${command.info.name}'`);

	let context: CommandContext;

	// The following assertions assume that discord.js behaves consistently,
	// checking the `guild` and `member` fields. See for reference
	// https://github.com/discordjs/discord.js/blob/14.5.0/packages/discord.js/src/structures/BaseInteraction.js#L176

	if (interaction.inGuild()) {
		context = {
			...vagueContext,
			source: 'guild',
			options: interaction.options,
		} as GuildedCommandContext;
	} else {
		context = {
			...vagueContext,
			source: 'dm',
			options: interaction.options,
		} as DMCommandContext;
	}

	if (interaction.isChatInputCommand()) {
		context = { ...context, interaction, options: interaction.options };
	}

	if (!command.requiresGuild) {
		// No guild required
		debug(`Command '${command.info.name}' does not require guild information.`);
		debug('Proceeding...');

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
				options: interaction.options,
			};

			try {
				await command.execute(messageContextMenuCommandContext);
				return;
			} catch (error_) {
				await sendErrorMessage(interaction, error_);
				return;
			}
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
				options: interaction.options,
			};

			try {
				await command.execute(userContextMenuCommandContext);
				return;
			} catch (error_) {
				await sendErrorMessage(interaction, error_);
				return;
			}
		}

		try {
			await command.execute(context);
			return;
		} catch (error_) {
			await sendErrorMessage(interaction, error_);
			return;
		}
	}

	if (context.source === 'dm') {
		// No guild found
		debug(`Command '${command.info.name}' requires guild information, but none was found.`);
		await context.reply({
			content: "Can't do that here",
			ephemeral: true,
		});
		return;
	}

	try {
		await command.execute(context);
		return;
	} catch (error_) {
		await sendErrorMessage(interaction, error_);
	}
}

/**
 * Finds results for a Discord autocomplete request.
 */
async function handleAutocompleteInteraction(interaction: AutocompleteInteraction): Promise<void> {
	debug(
		`User ${logUser(interaction.user)} requested autocomplete for command: '${
			interaction.commandName
		}'`
	);

	try {
		const command = allCommands.get(interaction.commandName);
		if (!command) {
			warn(
				`Received request to execute autocomplete handler for unknown command named '${interaction.commandName}'`
			);
			// Return no results
			await interaction.respond([]);
			return;
		}

		// Command must be a chat-input command
		if (command.type !== ApplicationCommandType.ChatInput && command.type !== undefined) {
			warn(
				`Received an autocomplete request for command '${command.info.name}'. This command must be of type 'ChatInput', but was found instead to be of a different type (${command.type}).`
			);
			// Return no results
			await interaction.respond([]);
			return;
		}

		// Command must have an autocomplete handler
		if (!command.autocomplete) {
			warn(
				`Received an autocomplete request for command '${command.info.name}'. This command must have an autocomplete handler method, but none was found.`
			);
			// Return no results
			await interaction.respond([]);
			return;
		}

		debug(`Calling autocomplete handler for command '${command.info.name}'`);
		const options = command.autocomplete(interaction);

		// Return results (limited because of API reasons)
		// Seriously, Discord WILL throw errors and refuse to deliver ANY
		// options if the list we give them exceeds 25
		await interaction.respond(options.slice(0, DISCORD_API_MAX_CHOICES));
	} catch (error_) {
		// We cannot directly reply, since this interaction is only for autocomplete.
		error(error_);

		// Return no results if we've not yet responded
		if (!interaction.responded) {
			try {
				await interaction.respond([]);
			} catch (secondError) {
				error('Failed to return empty result set due to error:', secondError);
			}
		}
	}
}

/**
 * Universal command error handling.
 * Sends an ephemeral error message with pretty formatting to the user who used the command.
 * The purpose of this method is to simplify error reporting, so that each command
 * doesn't have to implement error messages individually.
 * Only exported for testing purposes. Do not use outside of this file.
 *
 * @param interaction The interaction that invoked the command
 * @param error The error that the command threw
 * @private
 */
export async function sendErrorMessage(
	interaction: CommandInteraction | ButtonInteraction,
	error_: unknown
): Promise<void> {
	const errorMessage = error_ instanceof Error ? error_.message : JSON.stringify(error_);
	// for privacy, strip out any mention of the internal directory
	const privateDir = __dirname.slice(0, __dirname.lastIndexOf('dist'));
	const safeErrorMessage = errorMessage.replace(privateDir, '...');

	const embed = new EmbedBuilder().setTitle('Error');
	if (error_ instanceof UserMessageError) {
		embed.setDescription(error_.message).setColor(Colors.Yellow);
	} else {
		const interactionDescription = interaction.isButton()
			? `\`${interaction.customId}\` button`
			: `\`/${interaction.commandName}\` command`;
		embed
			.setDescription(
				`The ${interactionDescription} encountered an error during execution.\n\n\`\`${safeErrorMessage}\`\``
			)
			.setColor(Colors.Red);

		error('Sent error message to user:');
		error(error_);
	}

	try {
		if (interaction.replied) {
			await interaction.editReply({
				content: '',
				embeds: [embed],
			});
		} else {
			// Using the raw interaction here, since any errors that happen while trying to send the error are moot
			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	} catch (secondError) {
		error('Error while sending error response:', secondError);
	}
}

async function handleButtonInteraction(
	context: InteractionContext,
	interaction: ButtonInteraction
): Promise<void> {
	debug(`User ${logUser(interaction.user)} pressed button: '${interaction.customId}'`);

	const button = allButtons.get(interaction.customId);
	if (!button) {
		warn(`Received request to execute unknown button with id '${interaction.customId}'`);
		await sendErrorMessage(
			interaction,
			`Unknown button '${interaction.customId}'. Contact the bot operator and make sure they deployed the latest set of commands.`
		);
		return;
	}

	debug(`Calling button handler '${button.customId}'`);

	const buttonContext = {
		...context,
		interaction,
		component: interaction.component,
		message: interaction.message,
		channelId: interaction.channelId,
	};
	try {
		await button.execute(buttonContext);
		return;
	} catch (error_) {
		await sendErrorMessage(interaction, error_);
	}
}

async function generateContext(interaction: RepliableInteraction): Promise<InteractionContext> {
	const guild = interaction.guild;

	let member: GuildMember | null;
	if (interaction.inCachedGuild()) {
		member = interaction.member;
	} else {
		member = (await guild?.members.fetch(interaction.user)) ?? null;
	}

	let channel: InteractionContext['channel'];
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
