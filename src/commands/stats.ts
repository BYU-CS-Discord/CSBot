import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UserMessageError } from '../helpers/UserMessageError';
import { db } from '../database';
import { sanitize } from '../helpers/sanitize';

const StatNameOption = 'statname';
const AmountOption = 'amount';

const TrackSubcommand = 'track';
const UpdateSubcommand = 'update';

const builder = new SlashCommandBuilder()
	.setName('stats')
	.setDescription('Track and display stats and leaderboards')
	.addSubcommand(subcommand =>
		subcommand
			.setName(TrackSubcommand)
			.setDescription('Begin tracking a stat for you')
			.addStringOption(option =>
				option
					.setName(StatNameOption)
					.setDescription('The name of the stat you would like to track')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(UpdateSubcommand)
			.setDescription("Adds to a stat you're tracking")
			.addStringOption(option =>
				option
					.setName(StatNameOption)
					.setDescription('The name of the stat to update')
					.setRequired(true)
			)
			.addNumberOption(option =>
				option
					.setName(AmountOption)
					.setDescription('The amount to update the stat')
					.setRequired(true)
			)
	);

export const stats: GuildedCommand = {
	info: builder,
	requiresGuild: true,

	async execute({ reply, interaction }): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case TrackSubcommand:
				await track(reply, interaction);
				break;
			case UpdateSubcommand:
				await update(reply, interaction);
				break;
		}
	},
};

async function track(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const scoreName = sanitize(interaction.options.getString(StatNameOption));

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
}

async function update(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const scoreName = sanitize(interaction.options.getString(StatNameOption));
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
			`I'm not currently tracking "${scoreName}" for you. Use /track to begin tracking that score.`
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

	await reply(`Updated your score for "${scoreName}" to ${newScore}`);
}
