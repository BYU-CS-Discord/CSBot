import { ButtonBuilder, ButtonStyle } from 'discord.js';

export type Letter =
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f'
	| 'g'
	| 'h'
	| 'i'
	| 'j'
	| 'k'
	| 'l'
	| 'm'
	| 'n'
	| 'o'
	| 'p'
	| 'q'
	| 'r'
	| 's'
	| 't'
	| 'u'
	| 'v'
	| 'w'
	| 'x'
	| 'y'
	| 'z';
const customIdStem = 'hangmanLetterButton-';
export function hangmanLetterButton(letter: Letter): Button {
	const customId = customIdStem + letter;
	return {
		customId,
		execute(): void {
			// placeholder
		},
		makeBuilder(): ButtonBuilder {
			return new ButtonBuilder()
				.setCustomId(customId)
				.setLabel(letter)
				.setStyle(ButtonStyle.Primary);
		},
	};
}
