import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';

const customId = 'hangmanMoreButton';
export const hangmanMoreButton: Button = {
	customId,
	execute(): void {
		// placeholder
	},
	makeBuilder(): ButtonBuilder {
		return new ButtonBuilder().setCustomId(customId).setLabel('y/z').setStyle(ButtonStyle.Primary);
	},
};
