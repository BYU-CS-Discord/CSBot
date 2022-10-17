import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Client,
	CommandInteraction,
	CommandInteractionOption,
	ContextMenuCommandInteraction,
	DMChannel,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	InteractionReplyOptions,
	Message,
	MessageContextMenuCommandInteraction,
	MessageReplyOptions,
	RepliableInteraction,
	Snowflake,
	User,
	UserContextMenuCommandInteraction,
} from 'discord.js';

declare global {
	interface InteractionContext {
		/** Where the command was invoked. */
		readonly source: 'guild' | 'dm';

		/** The triggering interaction. */
		readonly interaction: RepliableInteraction;

		/** Our own signed-in Discord client. */
		readonly client: Client<true>;

		/** The guild in which the interaction was invoked. */
		readonly guild: Guild | null;

		/** The ID of the channel in which the interaction was invoked. */
		readonly channelId: Snowflake | null;

		/** The channel in which the interaction was invoked. */
		readonly channel: GuildTextBasedChannel | DMChannel | null;

		/** The user who invoked the interaction. */
		readonly user: User;

		/** The guild member who invoked the interaction. */
		readonly member: GuildMember | null;

		/** The UNIX time at which the interaction was invoked. */
		readonly createdTimestamp: number;

		/** Instructs Discord to keep interaction handles open long enough for long-running tasks to complete. */
		prepareForLongRunningTasks: (ephemeral?: boolean) => void | Promise<void>;

		/** Sends a typing indicator that ends in about 10 seconds or when a new message is sent. */
		sendTyping: () => void;

		/**
		 * Sends a DM or ephemeral reply to the command's sender. The default
		 * behavior is an ephemeral reply.
		 *
		 * In the case of an interaction that was publicly deferred (e.g.
		 * using `prepareForLongRunningTasks(false)`), this function will
		 * edit the public reply. The message sent here will then be public.
		 *
		 * @param options The message payload to send.
		 * @param viaDM Whether we should reply in DMs.
		 */
		replyPrivately: (
			options:
				| string //
				| Omit<MessageReplyOptions, 'flags'>
				| Omit<InteractionReplyOptions, 'flags'>,
			viaDM?: true
		) => Promise<void>;

		/** Replies to the command invocation, optionally pinging the command's sender. */
		reply: (
			options:
				| string
				| Omit<MessageReplyOptions, 'flags'>
				| (Omit<InteractionReplyOptions, 'flags'> & {
						shouldMention?: boolean;
				  })
		) => Promise<void>;

		/**
		 * Sends a message in the same channel to the user who invoked the command.
		 *
		 * @returns a `Promise` that resolves with a reference to the message sent,
		 * or a boolean value indicating whether an ephemeral reply succeeded or failed.
		 */
		followUp: (
			options:
				| string
				| Omit<MessageReplyOptions, 'flags'>
				| (Omit<InteractionReplyOptions, 'flags'> & {
						reply?: boolean;
				  })
		) => Promise<Message | boolean>;
	}

	interface BaseCommandContext extends InteractionContext {
		/** The command invocation interaction. */
		readonly interaction: CommandInteraction;

		/** The ID of the channel in which the command was invoked. */
		readonly channelId: Snowflake;

		/** The ID of the interaction target. Only available for context menu commands. */
		readonly targetId: Snowflake | null;

		/** The user that the interaction targets. Only available for context menu commands. */
		readonly targetUser: User | null;

		/** The guild member that the interaction targets. Only available for context menu commands. */
		readonly targetMember: GuildMember | null;

		/** The message that the interaction targets. Only available for context menu commands. */
		readonly targetMessage: Message | null;

		/** The options that were given to the command. Not available for context menu commands. */
		readonly options: ReadonlyArray<CommandInteractionOption<'cached'>> | null;
	}

	/** Information relevant to a command invocation in a DM. */
	interface DMCommandContext extends BaseCommandContext {
		/** Where the command was invoked. */
		readonly source: 'dm';

		/** The command invocation interaction. */
		readonly interaction: ChatInputCommandInteraction;

		/** The guild in which the command was invoked. */
		readonly guild: null;

		/** The guild member who invoked the command. */
		readonly member: null;

		/** The channel in which the command was invoked. */
		readonly channel: DMChannel | null;

		/** The ID of the interaction target. Only available for context menu commands. */
		readonly targetId: null;

		/** The user that the interaction targets. Only available for context menu commands. */
		readonly targetUser: null;

		/** The guild member that the interaction targets. Only available for context menu commands. */
		readonly targetMember: null;

		/** The message that the interaction targets. Only available for context menu commands. */
		readonly targetMessage: null;

		/** The options that were given to the command. Not available for context menu commands. */
		readonly options: ReadonlyArray<CommandInteractionOption<'cached'>>;
	}

	/** Information relevant to a command invocation in a guild.*/
	interface GuildedCommandContext extends BaseCommandContext {
		/** Where the command was invoked. */
		readonly source: 'guild';

		/** The command invocation interaction. */
		readonly interaction: ChatInputCommandInteraction;

		/** The guild in which the command was invoked. */
		readonly guild: Guild;

		/** The guild member who invoked the command. */
		readonly member: GuildMember;

		/** The channel in which the command was invoked. */
		readonly channel: GuildTextBasedChannel | null;

		/** The ID of the interaction target. Only available for context menu commands. */
		readonly targetId: null;

		/** The user that the interaction targets. Only available for context menu commands. */
		readonly targetUser: null;

		/** The guild member that the interaction targets. Only available for context menu commands. */
		readonly targetMember: null;

		/** The message that the interaction targets. Only available for context menu commands. */
		readonly targetMessage: null;

		/** The options that were given to the command. Not available for context menu commands. */
		readonly options: ReadonlyArray<CommandInteractionOption<'cached'>>;
	}

	interface BaseContextMenuCommandContext extends BaseCommandContext {
		/** Where the command was invoked. */
		readonly source: 'guild' | 'dm';

		/** The command invocation interaction. */
		readonly interaction: ContextMenuCommandInteraction;

		/** The ID of the interaction target. Only available for context menu commands. */
		readonly targetId: Snowflake;

		/** The options that were given to the command. Not available for context menu commands. */
		readonly options: null;
	}

	/** Information relevant to a user context menu command invocation.*/
	interface UserContextMenuCommandContext extends BaseContextMenuCommandContext {
		/** The command invocation interaction. */
		readonly interaction: UserContextMenuCommandInteraction;

		/** The user that the interaction targets. Only available for context menu commands. */
		readonly targetUser: User;

		/** The guild member that the interaction targets. Only available for context menu commands. */
		readonly targetMember: GuildMember | null;
	}

	/** Information relevant to a user context menu command invocation.*/
	interface MessageContextMenuCommandContext extends BaseContextMenuCommandContext {
		/** The command invocation interaction. */
		readonly interaction: MessageContextMenuCommandInteraction;

		/**  The message that the interaction targets. Only available for context menu commands. */
		readonly targetMessage: Message;
	}

	/** Information relevant to button presses */
	interface ButtonContext extends InteractionContext {
		component: APIButtonComponent;
		message: Message;
	}

	/** Information relevant to a command invocation. */
	type CommandContext = TextInputCommandContext | ContextMenuCommandContext;

	/** Information relevant to a slash-command invocation. */
	type TextInputCommandContext = DMCommandContext | GuildedCommandContext;

	/** Information relevant to a context menu command invocation. */
	type ContextMenuCommandContext = UserContextMenuCommandContext | MessageContextMenuCommandContext;
}
