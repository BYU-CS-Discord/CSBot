import { PartialGroupDMChannel } from 'discord.js';
import type { RepliableInteraction } from 'discord.js';

import { debug } from '../logger.js';

export function sendTypingFactory(interaction: RepliableInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		if (interaction.channel instanceof PartialGroupDMChannel) {
			debug(
				`Tried to type in channel ${
					interaction.channelId ?? 'null'
				} but we cannot type in PartialGroupDMChannels`
			);
			return;
		}
		void interaction.channel?.sendTyping();
		debug(`Typing in channel ${interaction.channelId ?? 'null'}`);
	};
}
