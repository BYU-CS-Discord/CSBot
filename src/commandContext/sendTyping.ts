import type { RepliableInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

import { debug } from '../logger.js';

export function sendTypingFactory(interaction: RepliableInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		if (interaction.channel?.type === ChannelType.GuildStageVoice) {
			debug(
				`Tried to type in channel ${
					interaction.channelId ?? 'null'
				} but we cannot type in GuildStageVoice channels`
			);
			return;
		}
		void interaction.channel?.sendTyping();
		debug(`Typing in channel ${interaction.channelId ?? 'null'}`);
	};
}
