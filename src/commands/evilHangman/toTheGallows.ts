import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { appVersion } from '../../constants/meta';
import { getEvilHangmanEmbedBuilder } from '../../evilHangman/evilHangmanEmbedBuilder';
import { EvilHangmanGame } from '../../evilHangman/evilHangmanGame';
import type { GameStore } from '../../evilHangman/gameStore';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman');

export function toTheGallows(gameStore: GameStore): GlobalCommand {
	return {
		info: builder,
		requiresGuild: false,
		async execute({ reply, channelId }): Promise<void> {
			if (gameStore.games.has(channelId)) {
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
				const game = new EvilHangmanGame(5, 5); // TODO: placeholder numbers
				gameStore.games.set(channelId, game);
				const embed = getEvilHangmanEmbedBuilder(game.getDisplayInfo());

				await reply({
					embeds: [embed],
				});
			}
		},
	};
}
