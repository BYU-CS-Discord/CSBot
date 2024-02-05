import type { RepliableInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

import * as logger from '../logger';

export function sendTypingFactory(interaction: RepliableInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		if (interaction.channel?.type === ChannelType.GuildStageVoice) {
			logger.debug(
				`Tried to type in channel ${
					interaction.channelId ?? 'null'
				} but we cannot type in GuildStageVoice channels`
			);
			return;
		}
		void interaction.channel?.sendTyping();
		logger.debug(`Typing in channel ${interaction.channelId ?? 'null'}`);
	};
}
