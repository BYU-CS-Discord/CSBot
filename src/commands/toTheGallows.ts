import { SlashCommandBuilder } from 'discord.js';
import { buildEvilHangmanMessage } from '../evilHangman/evilHangmanMessage.js';
import { EvilHangmanGame } from '../evilHangman/evilHangmanGame.js';

const LengthOption = 'wordlength';
const GuessesOption = 'numguesses';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman')
	.addIntegerOption(option =>
		option
			.setName(LengthOption)
			.setDescription('The number of letters in the word to guess')
			.setMinValue(1)
	)
	.addIntegerOption(option =>
		option
			.setName(GuessesOption)
			.setDescription('The number of allowed incorrect guesses')
			.setMinValue(1)
			.setMaxValue(25)
	);

export const toTheGallows: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, options }): Promise<void> {
		const wordLength = options.getInteger(LengthOption);
		const numGuesses = options.getInteger(GuessesOption);

		const game = EvilHangmanGame.newGame(wordLength, numGuesses);
		const response = await buildEvilHangmanMessage(game.getDisplayInfo());

		await reply(response);
	},
};
