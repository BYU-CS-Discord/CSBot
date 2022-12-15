import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, MessageReplyOptions } from 'discord.js';
import { hangmanLetterButton, Letter } from '../buttons/hangmanLetterButton';
import { hangmanMoreButton } from '../buttons/hangmanMoreButton';
import { appVersion } from '../constants/meta';
import type { EvilHangmanDisplayInfo } from './evilHangmanGame';

export function getEvilHangmanEmbedBuilder(
	gameInfo: EvilHangmanDisplayInfo
): Omit<MessageReplyOptions, 'flags'> {
	const embed = new EmbedBuilder()
		.setTitle('Evil Hangman')
		.setDescription(`guesses: ${gameInfo.guessesRemaining}\nword: ${gameInfo.word}`)
		.setFooter({ text: `v${appVersion}` });

	return {
		embeds: [embed],
		components: getButtons(gameInfo.word),
	};
}

const alphabet: Array<Letter> = new Array(26)
	.fill(null)
	.map((x, i) => String.fromCharCode(i + 97) as Letter);

function getLetterOptions(word: string): Array<Letter> {
	const characters = new Set(word.split(''));
	return alphabet.filter(letter => !characters.has(letter));
}

// Discord enforces these maxs, you can't have more per message
const MAX_BUTTONS_PER_ROW = 5;
const MAX_BUTTON_ROWS = 5;
const MAX_BUTTONS_TOTAL = MAX_BUTTONS_PER_ROW * MAX_BUTTON_ROWS;
function getButtons(word: string): Array<ActionRowBuilder<ButtonBuilder>> {
	const letterOptions = getLetterOptions(word);
	const letterButtons = letterOptions.map(letter => hangmanLetterButton(letter));
	if (letterButtons.length > MAX_BUTTONS_TOTAL) {
		letterButtons.splice(MAX_BUTTONS_TOTAL - 1, Number.POSITIVE_INFINITY, hangmanMoreButton);
	}

	const rows: Array<ActionRowBuilder<ButtonBuilder>> = [];
	for (let i = 0; i < MAX_BUTTON_ROWS; i++) {
		const buttonsInRow = letterButtons.slice(
			i * MAX_BUTTONS_PER_ROW,
			(i + 1) * MAX_BUTTONS_PER_ROW
		);

		if (buttonsInRow.length === 0) {
			break;
		}

		rows.push(
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				...buttonsInRow.map(button => button.makeBuilder())
			)
		);
	}

	return rows;
}
