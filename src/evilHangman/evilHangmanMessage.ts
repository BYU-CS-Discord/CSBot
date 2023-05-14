import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	Message,
	MessageReplyOptions,
} from 'discord.js';
import { hangmanLessButton } from '../buttons/hangmanLessButton';
import { hangmanMoreButton } from '../buttons/hangmanMoreButton';
import { appVersion } from '../constants/meta';
import { getHangmanArt } from './evilHangmanAsciiArt';
import { EvilHangmanDisplayInfo, EvilHangmanGame, EvilHangmanWinState } from './evilHangmanGame';
import { getButtonsForAllLettersExcept } from './hangmanLetterButtons';

type Page = 0 | 1;
const GAME_INFO_FORMAT = 'Remaining Guesses: {0}\nWord: {1}\nLetters Guessed: {2}';
export async function buildEvilHangmanMessage(
	gameInfo: EvilHangmanDisplayInfo,
	page: Page = 0
): Promise<Omit<MessageReplyOptions, 'flags'>> {
	const mainDescription = `${format(
		GAME_INFO_FORMAT,
		gameInfo.guessesRemaining.toString(),
		gameInfo.word,
		[...gameInfo.guessesSoFar].join()
	)}_ _`; // The italic space here is a bit of a hack, but it prevents discord from trimming the message which messes up the regex match
	const totalGuesses = gameInfo.guessesRemaining + gameInfo.guessesSoFar.size;
	const hangmanArt = `\`\`\`${await getHangmanArt(gameInfo.guessesRemaining, totalGuesses)}\`\`\``;

	const embed = new EmbedBuilder()
		.setTitle('Evil Hangman')
		.setFooter({ text: `v${appVersion}` })
		.addFields(
			{
				name: '_ _', // italicized space. We don't want a title, this prevents anything from rendering
				value: hangmanArt,
				inline: true,
			},
			{ name: '_ _', value: mainDescription, inline: true }
		);
	switch (gameInfo.winState) {
		case EvilHangmanWinState.WON:
			embed.setDescription('You win!');
			break;
		case EvilHangmanWinState.LOST:
			embed.setDescription(`You Lose! The correct word was ${gameInfo.correctWord}.`);
			break;
	}

	const components =
		gameInfo.winState === EvilHangmanWinState.IN_PROGRESS
			? getButtons(gameInfo.guessesSoFar, page)
			: [];
	return {
		embeds: [embed],
		components,
	};
}

/**
 * Discord only allows a 5x5 grid of buttons, so we need to bucket them into
 * 5 rows of 5, and include a more/less button when we have all 26 letters
 */
const MAX_BUTTONS_PER_ROW = 5;
const MAX_BUTTON_ROWS = 5;
const MAX_BUTTONS_TOTAL = MAX_BUTTONS_PER_ROW * MAX_BUTTON_ROWS;
function getButtons(
	guessesSoFar: ReadonlySet<string>,
	page: Page
): Array<ActionRowBuilder<ButtonBuilder>> {
	const letterButtons = getButtonsForAllLettersExcept(guessesSoFar);
	if (letterButtons.length > MAX_BUTTONS_TOTAL) {
		if (page === 0) {
			letterButtons.splice(MAX_BUTTONS_TOTAL - 1, Number.POSITIVE_INFINITY, hangmanMoreButton);
		} else {
			letterButtons.splice(
				0,
				Number.POSITIVE_INFINITY,
				hangmanLessButton,
				...letterButtons.slice(MAX_BUTTONS_TOTAL - 1)
			);
		}
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

const FORMAT_ERROR_MESSAGE = 'Incorrect message format for Evil Hangman';
const parser = new RegExp(format(GAME_INFO_FORMAT, '(\\d*)', '([\\w-]*)', '([a-z,]*)'), 'u');
export function parseEvilHangmanMessage(message: Message): EvilHangmanGame {
	const gameStateString = message.embeds[0]?.data?.fields?.[1]?.value;
	if (gameStateString === undefined) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}
	const parseResult = parser.exec(gameStateString);
	if (parseResult === null) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}

	const [, guessesRemainingString, word, guessedLettersString] = parseResult;
	if (
		guessesRemainingString === undefined ||
		word === undefined ||
		guessedLettersString === undefined
	) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}

	const guessesRemaining = Number.parseInt(guessesRemainingString, 10);
	const guessedLetters = new Set(
		guessedLettersString?.split(',').filter(letter => letter.length === 1)
	);
	return new EvilHangmanGame(word, guessesRemaining, guessedLetters);
}

function format(source: string, ...args: Array<string>): string {
	return source.replace(/\{(\d+)\}/gu, (match, number: number) => {
		return (args[number] !== 'undefined' ? args[number] : match) ?? '';
	});
}
