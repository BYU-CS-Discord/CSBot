import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { appVersion } from '../../constants/meta';
import { getEvilHangmanResponse } from '../../evilHangman/evilHangmanEmbedBuilder';
import { EvilHangmanGame } from '../../evilHangman/evilHangmanGame';
import { gameStore } from '../../evilHangman/gameStore';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman');

export const toTheGallows: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, channelId }): Promise<void> {
		if (gameStore.has(channelId)) {
			const embed = new EmbedBuilder()
				.setTitle('Evil Hangman')
				.setFooter({ text: `v${appVersion}` })
				.setDescription('There is already a game running in this channel')
				.setColor('DarkRed');

			await reply({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			const game = new EvilHangmanGame(10, 10); // TODO: placeholder numbers
			gameStore.set(channelId, game);
			const response = await getEvilHangmanResponse(game.getDisplayInfo());

			await reply(response);
		}
	},
};
