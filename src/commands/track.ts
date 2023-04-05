import { SlashCommandBuilder } from 'discord.js';
import { db } from '../database';
import { UserMessageError } from '../helpers/UserMessageError';
import { sanitize } from '../helpers/sanitize';

const ScoreNameOption = 'scorename';

const builder = new SlashCommandBuilder()
	.setName('track')
	.setDescription('Begin tracking a score for you')
	.addStringOption(option =>
		option
			.setName(ScoreNameOption)
			.setDescription('The name of the score you would like to track')
			.setRequired(true)
	);

export const track: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute({ reply, interaction }): Promise<void> {
		const scoreName = sanitize(interaction.options.getString(ScoreNameOption));

		if (scoreName === undefined) {
			throw new UserMessageError('Must include score-name');
		}

		const scoreExists = Boolean(
			await db.scoreboard.count({
				where: {
					name: scoreName,
					userId: interaction.user.id,
				},
			})
		);

		if (scoreExists) {
			throw new UserMessageError("I'm already tracking that score for you");
		}

		await db.scoreboard.create({
			data: {
				userId: interaction.user.id,
				name: scoreName,
				score: 0,
			},
		});

		await reply(`Now tracking "${scoreName}" for you`);
	},
};
