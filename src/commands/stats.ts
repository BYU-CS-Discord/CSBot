import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { UserMessageError } from '../helpers/UserMessageError';
import { db } from '../database';
import { sanitize } from '../helpers/sanitize';

const StatNameOption = 'statname';
const AmountOption = 'amount';

const TrackSubcommand = 'track';
const UpdateSubcommand = 'update';
const ListSubcommand = 'list';
const UntrackSubcommand = 'untrack';
const LeaderboardSubcommand = 'leaderboard';

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
	)
	.addSubcommand(subcommand =>
		subcommand.setName(ListSubcommand).setDescription("List all stats I'm tracking for you")
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(UntrackSubcommand)
			.setDescription('Stops tracking a stat for you')
			.addStringOption(option =>
				option
					.setName(StatNameOption)
					.setDescription('The name of the stat you would like to stop tracking')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName(LeaderboardSubcommand)
			.setDescription('Show the leaderboard for a stat')
			.addStringOption(option =>
				option
					.setName(StatNameOption)
					.setDescription('The name of the stat for which to show the leaderboard')
					.setRequired(true)
			)
	);

export const stats: GuildedCommand = {
	info: builder,
	requiresGuild: true,

	async execute({ reply, replyPrivately, interaction, guild }): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case TrackSubcommand:
				await track(reply, interaction, guild.id);
				break;
			case UpdateSubcommand:
				await update(reply, interaction, guild.id);
				break;
			case ListSubcommand:
				await list(replyPrivately, interaction, guild.id);
				break;
			case UntrackSubcommand:
				await untrack(reply, interaction, guild.id);
				break;
			case LeaderboardSubcommand:
				await leaderboard(reply, interaction, guild.id);
				break;
			default:
				throw new Error('Invalid subcommand');
		}
	},
};

async function track(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction,
	guildId: string
): Promise<void> {
	const statName = sanitize(interaction.options.getString(StatNameOption, true));

	const statExists = Boolean(
		await db.scoreboard.count({
			where: {
				name: statName,
				userId: interaction.user.id,
				guildId,
			},
		})
	);

	if (statExists) {
		throw new UserMessageError("I'm already tracking that score for you");
	}

	await db.scoreboard.create({
		data: {
			userId: interaction.user.id,
			name: statName,
			guildId,
			score: 0,
		},
	});

	await reply(`Now tracking "${statName}" for you`);
}

async function update(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction,
	guildId: string
): Promise<void> {
	const statName = sanitize(interaction.options.getString(StatNameOption, true));
	const amount = interaction.options.getNumber(AmountOption, true);

	const scoreboardEntry = await db.scoreboard.findFirst({
		where: {
			userId: interaction.user.id,
			name: statName,
			guildId,
		},
		select: {
			score: true,
			id: true,
		},
	});

	if (scoreboardEntry === null) {
		throw notCurrentlyTrackingError(statName);
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

	await reply(`Updated your score for "${statName}" to ${newScore}`);
}

async function list(
	replyPrivately: InteractionContext['replyPrivately'],
	interaction: ChatInputCommandInteraction,
	guildId: string
): Promise<void> {
	const scoreboardEntries = await db.scoreboard.findMany({
		where: {
			userId: interaction.user.id,
			guildId,
		},
		select: {
			score: true,
			name: true,
		},
	});

	const embedDescription =
		scoreboardEntries.length > 0
			? scoreboardEntries.map(entry => `${entry.name}: ${entry.score}`).join('\n')
			: "You're not currently tracking anything!";

	const embed = new EmbedBuilder()
		.setTitle(`Stats for ${interaction.user.username}`)
		.setDescription(embedDescription);

	await replyPrivately({
		embeds: [embed],
	});
}

async function untrack(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction,
	guildId: string
): Promise<void> {
	const statName = sanitize(interaction.options.getString(StatNameOption, true));

	const scoreboardEntry = await db.scoreboard.findFirst({
		where: {
			name: statName,
			userId: interaction.user.id,
			guildId,
		},
		select: {
			id: true,
		},
	});

	if (scoreboardEntry === null) {
		throw notCurrentlyTrackingError(statName);
	}

	await db.scoreboard.delete({
		where: {
			id: scoreboardEntry.id,
		},
	});

	await reply(`Stopped tracking "${statName}" for you`);
}

async function leaderboard(
	reply: InteractionContext['reply'],
	interaction: ChatInputCommandInteraction,
	guildId: string
): Promise<void> {
	const statName = sanitize(interaction.options.getString(StatNameOption, true));

	const scoreboardEntries = await db.scoreboard.findMany({
		where: {
			name: statName,
			guildId,
		},
		select: {
			userId: true,
			score: true,
		},
	});

	if (scoreboardEntries.length === 0) {
		throw new UserMessageError(`No one is tracking the stat "${statName}"`);
	}

	const scoresSorted = scoreboardEntries.sort((a, b) => b.score - a.score);

	const embedDescription = scoresSorted
		.map(entry => {
			return `<@${entry.userId}>: ${entry.score}`;
		})
		.join('\n');

	const embed = new EmbedBuilder()
		.setTitle(`Leaderboard for ${statName}`)
		.setDescription(embedDescription);

	await reply({
		embeds: [embed],
	});
}

function notCurrentlyTrackingError(statName: string): UserMessageError {
	return new UserMessageError(
		`I'm not currently tracking "${statName}" for you. Use /track to begin tracking that score.`
	);
}
