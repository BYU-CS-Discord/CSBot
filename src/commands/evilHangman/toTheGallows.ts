import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { appVersion } from '../../constants/meta';
import type { GameStore } from '../../evilHangman/gameStore';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman');

export function toTheGallows(gameStore: GameStore): GlobalCommand {
	return {
		info: builder,
		requiresGuild: false,
		async execute({ reply, channelId }): Promise<void> {
			const generalEmbed = new EmbedBuilder()
				.setTitle('Evil Hangman')
				.setFooter({ text: `v${appVersion}` });

			if (gameStore.games.has(channelId)) {
				const embed = generalEmbed
					.setDescription('There is already a game running in this channel')
					.setColor('DarkRed');

				await reply({
					embeds: [embed],
					ephemeral: true,
				});
			} else {
				const embed = generalEmbed.setDescription('Placeholder');
				gameStore.games.set(channelId, 0); // TODO: 0 is a placeholder

				await reply({
					embeds: [embed],
				});
			}
		},
	};
}
