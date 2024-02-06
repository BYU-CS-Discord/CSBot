import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { parseEvilHangmanMessage } from '../evilHangman/parseEvilHangmanMessage.js';
import { UserMessageError } from '../helpers/UserMessageError.js';

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
		async execute({ interaction, message }): Promise<void> {
			const { buildEvilHangmanMessage } = await import('../evilHangman/evilHangmanMessage');
			const game = parseEvilHangmanMessage(message);

			const guessErrorMessage = game.checkGuess(letter);
			if (guessErrorMessage !== null) {
				throw new UserMessageError(guessErrorMessage);
			}

			const displayInfo = game.makeGuess(letter);

			const response = await buildEvilHangmanMessage(displayInfo);
			await interaction.update(response);
		},
		makeBuilder(): ButtonBuilder {
			return new ButtonBuilder()
				.setCustomId(customId)
				.setLabel(letter)
				.setStyle(ButtonStyle.Primary);
		},
	};
}
