import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import {
	scrapeRoomData,
	getCurrentYearTerm,
	isValidYearTerm,
	getScraperStatus,
} from '../roomFinder/scraper.js';
import { error, info } from '../logger.js';

const builder = new SlashCommandBuilder()
	.setName('scraperooms')
	.setDescription('[ADMIN] Scrape BYU class schedule data into the room finder database')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addStringOption(option =>
		option
			.setName('year_term')
			.setDescription('Semester to scrape (YYYYT format: 1=Winter , 3=Spring , 4=Summer , 5=Fall)')
			.setRequired(false)
	);

export const scrapeRooms: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ replyPrivately, options }): Promise<void> {
		const inputYearTerm = options.getString('year_term');
		const yearTerm = inputYearTerm ?? getCurrentYearTerm();

		// Check if scraper is already running
		const status = getScraperStatus();
		if (status.isRunning) {
			const elapsed = status.startTime
				? Math.floor((Date.now() - status.startTime.getTime()) / 1000 / 60)
				: 0;

			const logsText =
				status.recentLogs.length > 0
					? '```\n' + status.recentLogs.join('\n') + '\n```'
					: 'No recent logs available.';

			await replyPrivately({
				embeds: [
					new EmbedBuilder()
						.setTitle('⚠️ Scraper Already Running')
						.setDescription(
							`A scrape is currently in progress!\n\n` +
								`**Year/Term**: ${status.yearTerm}\n` +
								`**Running for**: ${elapsed} minutes\n\n` +
								`**Recent Activity**:\n${logsText}\n\n` +
								`Please wait for the current scrape to complete before starting another.`
						)
						.setColor(0xff_a5_00) // Orange
						.setTimestamp()
						.setFooter({
							text: 'Check console for full logs',
						}),
				],
			});
			return;
		}

		// Validate year_term format
		if (!isValidYearTerm(yearTerm)) {
			await replyPrivately({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ Invalid Year/Term')
						.setDescription(
							`Invalid format: \`${yearTerm}\`\n\n` +
								`**Format**: YYYYT where T is:\n` +
								`• 1 = Winter\n` +
								`• 3 = Spring\n` +
								`• 4 = Summer\n` +
								`• 5 = Fall\n\n` +
								`**Examples**:\n` +
								`• \`20251\` = Winter 2025\n` +
								`• \`20253\` = Spring 2025\n` +
								`• \`20255\` = Fall 2025`
						)
						.setColor(0xff_00_00)
						.setTimestamp(),
				],
			});
			return;
		}

		// Reply immediately - don't wait for scraper
		await replyPrivately({
			embeds: [
				new EmbedBuilder()
					.setTitle('🔄 Room Scraper Started')
					.setDescription(
						`**Year/Term**: ${yearTerm}\n\n` +
							`The scraper is now running in the background.\n` +
							`This will take **10-15 minutes** on first run.\n\n` +
							`Check the logs or run \`/scraperooms\` again to check progress.`
					)
					.setColor(0xff_a5_00) // Orange
					.setTimestamp()
					.setFooter({
						text: 'Check console logs for progress',
					}),
			],
		});

		// Start scraper in background (don't await)
		info(`[SCRAPER] Starting scrape for ${yearTerm}...`);
		scrapeRoomData(yearTerm, progress => {
			if (progress.buildings % 5 === 0 && progress.buildings > 0) {
				info(
					`[SCRAPER] Progress: Buildings=${progress.buildings}, Rooms=${progress.rooms}, Events=${progress.events}, Current=${progress.currentBuilding}`
				);
			}
		})
			.then(result => {
				info(
					`[SCRAPER] ✅ Complete! Buildings: ${result.buildings}, Rooms: ${result.rooms}, Events: ${result.events}`
				);
				return;
			})
			.catch((error_: unknown) => {
				error('[SCRAPER] ❌ Error during scrape:');
				error(error_);
				// Error already logged to buffer by scraper
			});
	},
};
