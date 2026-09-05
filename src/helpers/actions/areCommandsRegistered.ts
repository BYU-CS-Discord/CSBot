import { isDeepStrictEqual } from 'node:util';

import type {
	ApplicationCommandType,
	ApplicationCommand,
	Guild,
	ApplicationCommandOptionType,
} from 'discord.js';

/**
 * @param actualCommands Commands currently registered, pulled from the Discord API
 * @param expectedCommands Command handlers from local definitions
 * @returns Whether the registered and local command definitions agree
 */
export function areCommandsRegistered(
	actualCommands: {
		global: Array<ApplicationCommand>;
		guilded: Map<Guild, Array<ApplicationCommand>>;
	},
	expectedCommands: {
		global: Array<GlobalCommand | ContextMenuCommand>;
		guilded: Array<GuildedCommand>;
	}
): boolean {
	return (
		areGlobalCommandRegistered(actualCommands.global, expectedCommands.global) &&
		areGuildedCommandsRegistered(actualCommands.guilded, expectedCommands.guilded)
	);
}

function areGlobalCommandRegistered(
	actualCommands: Array<ApplicationCommand>,
	expectedCommands: Array<GlobalCommand | ContextMenuCommand>
): boolean {
	if (actualCommands.length !== expectedCommands.length) {
		return false;
	}
	const actualCommandsComparable = actualCommands
		.map(getCommandComparableValues)
		.toSorted((a, b) => a.name.localeCompare(b.name));
	const expectedCommandsComparable = expectedCommands
		.map(getCommandComparableValues)
		.toSorted((a, b) => a.name.localeCompare(b.name));
	return isDeepStrictEqual(actualCommandsComparable, expectedCommandsComparable);
}

function areGuildedCommandsRegistered(
	actualCommands: Map<Guild, Array<ApplicationCommand>>,
	expectedCommands: Array<GuildedCommand>
): boolean {
	const expectedCommandsComparable = expectedCommands
		.map(getCommandComparableValues)
		.toSorted((a, b) => a.name.localeCompare(b.name));
	for (const actualCommandsOfGuild of actualCommands.values()) {
		if (actualCommandsOfGuild.length !== expectedCommands.length) {
			return false;
		}
		const actualCommandsComparable = actualCommandsOfGuild
			.map(getCommandComparableValues)
			.toSorted((a, b) => a.name.localeCompare(b.name));
		if (!isDeepStrictEqual(actualCommandsComparable, expectedCommandsComparable)) {
			return false;
		}
	}
	return true;
}

/** The comparable values of {@link ApplicationCommand} and {@link Command} */
interface CommandComparableValues {
	name: string;
	description: string;
	type: ApplicationCommandType;
	nsfw: boolean;
	options: Array<OptionComparableValues>;
}

interface OptionComparableValues {
	name: string;
	description: string;
	type: ApplicationCommandOptionType;
	required?: boolean;
	options: Array<OptionComparableValues>; // Subcommands
}

/**
 * @returns An object of the comparable values between {@link ApplicationCommand} and {@link Command}
 *
 * Currently only considers name, description, type, nfsw, and options
 * (including subcommand group and subcommands) for comparison,
 * but can be extended as needed.
 */
function getCommandComparableValues(
	command: ApplicationCommand | Command
): CommandComparableValues {
	const name = 'info' in command ? command.info.name : command.name;
	const description =
		'info' in command
			? 'description' in command.info
				? // Types are wrong - `SlashCommandBuilder#description` is undefined if not set
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					(command.info.description ?? '')
				: ''
			: command.description;
	const type = command.type;
	const nsfw =
		'info' in command
			? 'nsfw' in command.info
				? (command.info.nsfw ?? false)
				: false
			: command.nsfw;
	const options =
		'info' in command
			? 'options' in command.info
				? command.info.options.map(opt => opt.toJSON())
				: []
			: command.options;

	/** Recursive to handle options and subcommands with options */
	function getOptionComparableValues(opt: (typeof options)[number]): OptionComparableValues {
		const subOptions = 'options' in opt ? (opt.options ?? []) : [];
		const required = 'required' in opt ? opt.required : undefined;
		return {
			name: opt.name,
			description: opt.description,
			type: opt.type,
			required,
			options: subOptions.map(getOptionComparableValues),
		};
	}

	return {
		name,
		description,
		type,
		nsfw,
		options: options.map(getOptionComparableValues),
	};
}
