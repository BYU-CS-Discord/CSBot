import { SlashCommandBuilder } from 'discord.js';
import { getEvilHangmanResponse } from '../../evilHangman/evilHangmanEmbedBuilder';
import { EvilHangmanGame } from '../../evilHangman/evilHangmanGame';
import { gameStore } from '../../evilHangman/gameStore';
import { UserMessageError } from '../../helpers/UserMessageException';

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
	async execute({ reply, channelId, interaction }): Promise<void> {
		if (gameStore.has(channelId)) {
			throw new UserMessageError('There is already a game running in this channel');
		}
		const wordLength = interaction.options.getInteger(LengthOption);
		const numGuesses = interaction.options.getInteger(GuessesOption);

		const game = new EvilHangmanGame(wordLength, numGuesses);
		gameStore.set(channelId, game);
		const response = await getEvilHangmanResponse(game.getDisplayInfo());

		await reply(response);
	},
};
