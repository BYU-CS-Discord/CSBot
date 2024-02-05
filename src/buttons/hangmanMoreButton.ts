import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import { parseEvilHangmanMessage } from '../evilHangman/parseEvilHangmanMessage';

const customId = 'hangmanMoreButton';
export const hangmanMoreButton: Button = {
	customId,
	async execute({ message, interaction }): Promise<void> {
		const { buildEvilHangmanMessage } = await import('../evilHangman/evilHangmanMessage');
		const game = parseEvilHangmanMessage(message);

		const displayInfo = game.getDisplayInfo();
		const response = await buildEvilHangmanMessage(displayInfo, 1);
		await interaction.update(response);
	},
	makeBuilder(): ButtonBuilder {
		return new ButtonBuilder().setCustomId(customId).setLabel('->').setStyle(ButtonStyle.Primary);
	},
};
