/** @deprecated Check `tbd.source === 'guild'` instead. */
export function isGuildedCommandContext(tbd: CommandContext): tbd is GuildedCommandContext {
	return tbd.source === 'guild';
}
