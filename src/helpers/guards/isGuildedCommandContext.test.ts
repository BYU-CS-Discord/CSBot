import 'jest-extended';
import type { CommandContext, GuildedCommandContext } from '../../CommandContext';
import type { Guild, GuildMember } from 'discord.js';
import { ChannelType } from 'discord.js';
import { isGuildedCommandContext } from './isGuildedCommandContext';

describe('isGuildedCommandContext', () => {
	test('returns true for GuildedCommandContext instances', () => {
		const context: GuildedCommandContext = {
			guild: {},
			member: {},
			channel: {
				type: ChannelType.GuildText,
			},
		} as unknown as GuildedCommandContext;
		expect(isGuildedCommandContext(context)).toBeTrue();
	});

	test('returns false for DM CommandContext instances', () => {
		let context: CommandContext = {
			guild: null,
			member: null,
			channel: {
				type: ChannelType.DM,
			},
		} as unknown as CommandContext;
		expect(isGuildedCommandContext(context)).toBeFalse();

		const guild: Guild = {} as unknown as Guild;
		context = { ...context, guild, member: null };
		expect(isGuildedCommandContext(context)).toBeFalse();

		const member: GuildMember = {} as unknown as GuildMember;
		context = { ...context, guild: null, member };
		expect(isGuildedCommandContext(context)).toBeFalse();
	});
});
