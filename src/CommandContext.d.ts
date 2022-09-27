import type {
	Client,
	CommandInteraction,
	CommandInteractionOption,
	DMChannel,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	InteractionReplyOptions,
	Message,
	MessageReplyOptions,
	User,
} from 'discord.js';

/** Information relevant to a command invocation. */
export interface CommandContext {
	/** The command invocation interaction. */
	readonly interaction: CommandInteraction;

	/** Our own signed-in Discord client. */
	readonly client: Client<true>;

	/** The place to submit informative debug messages. */
	readonly logger: Console; // TODO: More extensible logger than `console`?

	/** The guild in which the command was invoked. */
	readonly guild: Guild | null;

	/** The channel in which the command was invoked. */
	readonly channel: GuildTextBasedChannel | DMChannel | null;

	/** The user who invoked the command. */
	readonly user: User;

	/** The guild member who invoked the command. */
	readonly member: GuildMember | null;

	/** The UNIX time at which the command was invoked. */
	readonly createdTimestamp: number;

	/** The options that were given to the command. */
	readonly options: ReadonlyArray<CommandInteractionOption<'cached'>>; // TODO: Make this a generic tuple

	/** Instructs Discord to keep interaction handles open long enough for long-running tasks to complete. */
	prepareForLongRunningTasks: (ephemeral?: boolean) => void | Promise<void>;

	/** Sends a typing indicator that ends in about 10 seconds or when a new message is sent. */
	sendTyping: () => void;

	/**
	 * Sends a DM or ephemeral reply to the command's sender.
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

/**
 * Information relevant to a command invocation.
 */
export type GuildedCommandContext = CommandContext & {
	readonly guild: Guild;
	readonly member: GuildMember;
	readonly channel: GuildTextBasedChannel | null;
};
