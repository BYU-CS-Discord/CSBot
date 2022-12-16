import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import { getEvilHangmanResponse } from '../evilHangman/evilHangmanEmbedBuilder';
import { gameStore } from '../evilHangman/gameStore';
import { UserMessageError } from '../helpers/UserMessageException';

const customId = 'hangmanMoreButton';
export const hangmanMoreButton: Button = {
	customId,
	async execute({ channelId, interaction }): Promise<void> {
		const game = gameStore.get(channelId);

		if (game === undefined) {
			throw new UserMessageError('There is no Evil Hangman game running in this channel');
		}

		const displayInfo = game.getDisplayInfo();
		const response = await getEvilHangmanResponse(displayInfo, 1);
		await interaction.update(response);
	},
	makeBuilder(): ButtonBuilder {
		return new ButtonBuilder().setCustomId(customId).setLabel('->').setStyle(ButtonStyle.Primary);
	},
};
