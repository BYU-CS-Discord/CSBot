import { describe, expect, test, vi } from 'vitest';

import type { ApplicationCommand, Guild } from 'discord.js';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	SlashCommandBuilder,
} from 'discord.js';

import { areCommandsRegistered } from './areCommandsRegistered.ts';

describe('Check if commands are registered', () => {
	const mockGuild = {
		id: 'test-guild1',
	} as Guild;

	// Covers description, options
	const actualGlobalCommand1 = {
		name: 'zaphod',
		description: 'description',
		type: ApplicationCommandType.ChatInput,
		nsfw: false,
		options: [
			{
				name: 'mock_option',
				description: 'option_description',
				type: ApplicationCommandOptionType.String,
				required: false,
			},
		],
	} as ApplicationCommand;

	const expectedGlobalCommand1 = {
		info: new SlashCommandBuilder()
			.setName('zaphod')
			.setDescription('description')
			.addStringOption(option =>
				option.setName('mock_option').setDescription('option_description')
			),
		type: ApplicationCommandType.ChatInput,
		requiresGuild: false,
		execute: vi.fn(),
	};

	// Covers unset description, nsfw, unset options
	const actualGlobalCommand2 = {
		name: 'beeblebrox',
		description: '',
		type: ApplicationCommandType.ChatInput,
		nsfw: true,
		options: [] as Array<object>,
	} as ApplicationCommand;

	const expectedGlobalCommand2 = {
		info: new SlashCommandBuilder().setName('beeblebrox').setNSFW(true),
		type: ApplicationCommandType.ChatInput,
		requiresGuild: false,
		execute: vi.fn(),
	};

	// Covers subcommands, subcommand options
	const actualGuildedCommand1 = {
		name: 'arthur',
		description: '',
		type: ApplicationCommandType.ChatInput,
		nsfw: false,
		options: [
			{
				name: 'sub1',
				description: 'sub1 description',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'sub1_option',
						description: 'sub1_option description',
						type: ApplicationCommandOptionType.Boolean,
						required: false,
					},
				] as Array<object>,
			},
		] as ApplicationCommand['options'],
	} as ApplicationCommand;

	const expectedGuildedCommand1 = {
		info: new SlashCommandBuilder().setName('arthur').addSubcommand(subcommand =>
			subcommand
				.setName('sub1')
				.setDescription('sub1 description')
				.addBooleanOption(option =>
					option.setName('sub1_option').setDescription('sub1_option description')
				)
		),
		type: ApplicationCommandType.ChatInput,
		requiresGuild: true,
		execute: vi.fn(),
	};

	// Covers subcommand groups
	const actualGuildedCommand2 = {
		name: 'dent',
		description: 'dent description',
		type: ApplicationCommandType.ChatInput,
		nsfw: false,
		options: [
			{
				name: 'group1',
				description: 'group1 description',
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: [
					{
						name: 'sub1',
						description: 'sub1 description',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'sub1_option',
								description: 'sub1_option description',
								type: ApplicationCommandOptionType.String,
								required: false,
							},
						],
					},
					{
						name: 'sub2',
						description: 'sub2 description',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'sub2_option',
								description: 'sub2_option description',
								type: ApplicationCommandOptionType.Number,
								required: false,
							},
						],
					},
				],
			},
		] as ApplicationCommand['options'],
	} as ApplicationCommand;

	const expectedGuildedCommand2 = {
		info: new SlashCommandBuilder()
			.setName('dent')
			.setDescription('dent description')
			.addSubcommandGroup(subcommandGroup =>
				subcommandGroup
					.setName('group1')
					.setDescription('group1 description')
					.addSubcommand(subcommand =>
						subcommand
							.setName('sub1')
							.setDescription('sub1 description')
							.addStringOption(option =>
								option.setName('sub1_option').setDescription('sub1_option description')
							)
					)
					.addSubcommand(subcommand =>
						subcommand
							.setName('sub2')
							.setDescription('sub2 description')
							.addNumberOption(option =>
								option.setName('sub2_option').setDescription('sub2_option description')
							)
					)
			),
		type: ApplicationCommandType.ChatInput,
		requiresGuild: true,
		execute: vi.fn(),
	};

	describe('Global commands', () => {
		test('returns true if the actual commands match expectations', () => {
			const result = areCommandsRegistered(
				{
					global: [actualGlobalCommand1, actualGlobalCommand2],
					guilded: new Map(),
				},
				{
					global: [expectedGlobalCommand1, expectedGlobalCommand2],
					guilded: [],
				}
			);
			expect(result).toBe(true);
		});

		test('returns false if the number of commands differs', () => {
			const result = areCommandsRegistered(
				{
					global: [actualGlobalCommand1],
					guilded: new Map(),
				},
				{
					global: [expectedGlobalCommand1, expectedGlobalCommand2],
					guilded: [],
				}
			);
			expect(result).toBe(false);
		});

		test('returns false if the command lists differ', () => {
			// Name differs
			let modActualGlobalCommand2 = {
				...actualGlobalCommand2,
				name: 'not_beeblebrox',
			} as ApplicationCommand;
			let result = areCommandsRegistered(
				{
					global: [actualGlobalCommand1, modActualGlobalCommand2],
					guilded: new Map(),
				},
				{
					global: [expectedGlobalCommand1, expectedGlobalCommand2],
					guilded: [],
				}
			);
			expect(result).toBe(false);

			// Options differ
			modActualGlobalCommand2 = {
				...actualGlobalCommand2,
				options: [{ name: 'new_option' }],
			} as ApplicationCommand;
			result = areCommandsRegistered(
				{
					global: [actualGlobalCommand1, modActualGlobalCommand2],
					guilded: new Map(),
				},
				{
					global: [expectedGlobalCommand1, expectedGlobalCommand2],
					guilded: [],
				}
			);
			expect(result).toBe(false);
		});
	});

	describe('Guild commands', () => {
		test('returns true if the actual commands match expectations', () => {
			const result = areCommandsRegistered(
				{
					global: [],
					guilded: new Map([[mockGuild, [actualGuildedCommand1, actualGuildedCommand2]]]),
				},
				{
					global: [],
					guilded: [expectedGuildedCommand1, expectedGuildedCommand2],
				}
			);
			expect(result).toBe(true);
		});

		test('returns false if the number of commands differs', () => {
			const result = areCommandsRegistered(
				{
					global: [],
					guilded: new Map([[mockGuild, [actualGuildedCommand1]]]),
				},
				{
					global: [],
					guilded: [expectedGuildedCommand1, expectedGuildedCommand2],
				}
			);
			expect(result).toBe(false);
		});

		test('returns false if the command lists differ', () => {
			// Name diffs
			let modActualGuildedCommand2 = {
				...actualGuildedCommand2,
				name: 'not_dent',
			} as ApplicationCommand;
			let result = areCommandsRegistered(
				{
					global: [],
					guilded: new Map([[mockGuild, [actualGuildedCommand1, modActualGuildedCommand2]]]),
				},
				{
					global: [],
					guilded: [expectedGuildedCommand1, expectedGuildedCommand2],
				}
			);
			expect(result).toBe(false);

			// Options differ
			modActualGuildedCommand2 = {
				...actualGuildedCommand2,
				options: [{ name: 'new_option' }],
			} as ApplicationCommand;
			result = areCommandsRegistered(
				{
					global: [],
					guilded: new Map([[mockGuild, [actualGuildedCommand1, modActualGuildedCommand2]]]),
				},
				{
					global: [],
					guilded: [expectedGuildedCommand1, expectedGuildedCommand2],
				}
			);
			expect(result).toBe(false);
		});
	});
});
