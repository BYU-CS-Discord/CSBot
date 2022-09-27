import type { CommandContext, GuildedCommandContext } from '../../CommandContext';
import { ChannelType } from 'discord.js';

export function isGuildedCommandContext(tbd: CommandContext): tbd is GuildedCommandContext {
	return (
		tbd.guild !== null &&
		tbd.member !== null &&
		tbd.channel !== null &&
		tbd.channel.type !== ChannelType.DM
	);
}
