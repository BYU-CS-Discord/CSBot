import { SlashCommandBuilder } from 'discord.js';
import { UserMessageError } from '../helpers/UserMessageError';
import { db } from '../database';
import { sanitize } from '../helpers/sanitize';

const ScoreNameOption = 'scorename';
const AmountOption = 'amount';

const builder = new SlashCommandBuilder()
	.setName('updatescore')
	.setDescription("Adds to a score you're tracking")
	.addStringOption(option =>
		option
			.setName(ScoreNameOption)
			.setDescription('The name of the score to update')
			.setRequired(true)
	)
	.addNumberOption(option =>
		option.setName(AmountOption).setDescription('The amount to update the score').setRequired(true)
	);

export const updateScore: GuildedCommand = {
	info: builder,
	requiresGuild: true,

	async execute({ reply, interaction }): Promise<void> {
		const scoreName = sanitize(interaction.options.getString(ScoreNameOption));
		const amount = interaction.options.getNumber(AmountOption);

		if (scoreName === undefined) {
			throw new UserMessageError('Must include the score name');
		}
		if (amount === null) {
			throw new UserMessageError('Must include amount');
		}

		const scoreboardEntry = await db.scoreboard.findFirst({
			where: {
				userId: interaction.user.id,
				name: scoreName,
			},
			select: {
				score: true,
				id: true,
			},
		});

		if (scoreboardEntry === null) {
			throw new UserMessageError(
				"I'm not currently tracking that score for you. Use /track to begin tracking that score."
			);
		}

		const newScore = scoreboardEntry.score + amount;
		await db.scoreboard.update({
			where: {
				id: scoreboardEntry.id,
			},
			data: {
				score: newScore,
			},
		});

		await reply(`Updated your score for ${scoreName} to ${newScore}`);
	},
};
