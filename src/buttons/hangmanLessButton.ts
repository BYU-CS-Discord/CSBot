import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import { parseEvilHangmanMessage } from '../evilHangman/parseEvilHangmanMessage';

const customId = 'hangmanLessButton';
export const hangmanLessButton: Button = {
	customId,
	async execute({ interaction, message }): Promise<void> {
		const { buildEvilHangmanMessage } = await import('../evilHangman/evilHangmanMessage');
		const game = parseEvilHangmanMessage(message);

		const displayInfo = game.getDisplayInfo();
		const response = await buildEvilHangmanMessage(displayInfo);
		await interaction.update(response);
	},
	makeBuilder(): ButtonBuilder {
		return new ButtonBuilder().setCustomId(customId).setLabel('<-').setStyle(ButtonStyle.Primary);
	},
};
