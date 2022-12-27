import { SlashCommandBuilder } from 'discord.js';
import { buildEvilHangmanMessage } from '../evilHangman/evilHangmanMessage';
import { EvilHangmanGame } from '../evilHangman/evilHangmanGame';

const LengthOption = 'wordlength';
const GuessesOption = 'numguesses';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman')
	.addIntegerOption(option =>
		option.setName(LengthOption).setDescription('The number of letters in the word to guess')
	)
	.addIntegerOption(option =>
		option.setName(GuessesOption).setDescription('The number of allowed incorrect guesses')
	);

export const toTheGallows: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, interaction }): Promise<void> {
		const wordLength = interaction.options.getInteger(LengthOption);
		const numGuesses = interaction.options.getInteger(GuessesOption);

		const game = EvilHangmanGame.newGame(wordLength, numGuesses);
		const response = await buildEvilHangmanMessage(game.getDisplayInfo());

		await reply(response);
	},
};
