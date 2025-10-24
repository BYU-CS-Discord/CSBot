/**
 * Optional Cron Scheduler for Room Scraper
 *
 * Automatically runs the room scraper on a schedule.
 * Import and call setupScraperCron() in your main bot file to enable.
 */

import { CronJob } from 'cron';
import { scrapeRoomData, getCurrentYearTerm } from './scraper.js';
import { info, error } from '../logger.js';

/**
 * Sets up automatic room scraping on a schedule
 *
 * @param cronSchedule - Cron schedule string (default: '0 2 * * 0' = 2 AM every Sunday)
 * @param yearTerm - Optional specific year/term, or auto-detect current semester
 * @returns The CronJob instance (in case you want to stop it later)
 *
 * Common cron schedules:
 * - '0 2 * * 0' = 2 AM every Sunday
 * - '0 3 * * 1' = 3 AM every Monday
 * - '0 0 1 * *' = Midnight on the 1st of every month
 * - '0 2 1,15 * *' = 2 AM on the 1st and 15th of every month
 */
export function setupScraperCron(cronSchedule: string = '0 2 * * 0', yearTerm?: string): CronJob {
	info(`[CRON] Setting up room scraper cron: ${cronSchedule}`);

	const job = new CronJob(
		cronSchedule,
		async () => {
			const term = yearTerm ?? getCurrentYearTerm();
			info(`[CRON] Starting scheduled room scrape for ${term}...`);

			try {
				const result = await scrapeRoomData(term, progress => {
					if (progress.buildings % 5 === 0 && progress.buildings > 0) {
						info(
							`[CRON] Progress: ${progress.buildings} buildings, ${progress.rooms} rooms, ${progress.events} events`
						);
					}
				});

				info(
					`[CRON] Scheduled scrape complete! Buildings: ${result.buildings}, Rooms: ${result.rooms}, Events: ${result.events}`
				);
			} catch (error_) {
				error('[CRON] Scheduled scrape failed:');
				error(error_);
			}
		},
		null, // onComplete
		true, // start now
		'America/Denver' // timezone (Mountain Time for BYU)
	);

	info('[CRON] Room scraper cron job started');
	return job;
}

/**
 * Example usage - add to your main bot startup file (index.ts or similar):
 *
 * ```typescript
 * import { setupScraperCron } from './roomFinder/cron.js';
 *
 * // Run scraper every Sunday at 2 AM Mountain Time
 * setupScraperCron();
 *
 * // Or with custom schedule (every day at 3 AM):
 * setupScraperCron('0 3 * * *');
 *
 * // Or with specific year_term:
 * setupScraperCron('0 2 * * 0', '20251');
 * ```
 */
