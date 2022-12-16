import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { getEvilHangmanResponse } from '../evilHangman/evilHangmanEmbedBuilder';
import { gameStore } from '../evilHangman/gameStore';

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
		async execute({ channelId, reply }): Promise<void> {
			const game = gameStore.get(channelId);

			if (game === undefined) {
				throw new Error('There is no Evil Hangman game running in this channel');
			}

			const guessErrorMessage = game.checkGuess(letter);
			if (guessErrorMessage !== null) {
				throw new Error(guessErrorMessage);
			}

			const displayInfo = game.makeGuess(letter);
			const response = getEvilHangmanResponse(displayInfo);
			await reply(response);
		},
		makeBuilder(): ButtonBuilder {
			return new ButtonBuilder()
				.setCustomId(customId)
				.setLabel(letter)
				.setStyle(ButtonStyle.Primary);
		},
	};
}
