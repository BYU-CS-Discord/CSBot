import { CronJob } from 'cron';
import { autoUnsmiteExpiredUsers } from './smiteUtils.js';
import { info, error } from '../logger.js';

/**
 * Sets up automatic unsmiting of users after a specified duration
 * Runs on a cron schedule to check for and unsmite users who have been smitten for too long
 */
export function setupAutoUnsmiteCron(
	cronSchedule: string = '* * * * *',
	maxDurationMs: number = 3_600_000
): CronJob {
	info(`[CRON] Setting up auto-unsmite cron: ${cronSchedule} (max duration: ${maxDurationMs}ms)`);

	const job = new CronJob(
		cronSchedule,
		async () => {
			info('[CRON] Running auto-unsmite check...');

			try {
				const count = await autoUnsmiteExpiredUsers(maxDurationMs);

				if (count > 0) {
					info(`[CRON] Auto-unsmitten ${count} user(s)`);
				} else {
					info('[CRON] No users needed auto-unsmiting');
				}
			} catch (error_) {
				error('[CRON] Auto-unsmite check failed:');
				error(error_);
			}
		},
		null,
		true,
		'America/Denver'
	);

	info('[CRON] Auto-unsmite cron job started');
	return job;
}
