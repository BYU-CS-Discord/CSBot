import { SlashCommandBuilder } from 'discord.js';
import { exec as __unsafeExecuteCommand } from 'node:child_process';
import { error } from '../logger';

let numInvocations: number = 0;
const info = new SlashCommandBuilder()
	.setName('update')
	.setDescription('Pulls the latest changes and restarts the bot')
	.setDefaultMemberPermissions('0');

export const update: GlobalCommand = {
	info,
	requiresGuild: false,
	async execute({ replyPrivately, user, interaction }) {
		const admin_ids = process.env['ADMINISTRATORS']?.split(',');
		if (!admin_ids) {
			// TODO: make this a UserMessageException
			throw new Error('There is no ADMINISTRATORS variable. You must set ADMINISTRATORS in .env');
		}

		if (!admin_ids.includes(user.id)) {
			// TODO: make this a UserMessageException
			throw new Error(
				'You do not have permission to perform this command. Contact the bot administrator.'
			);
		}

		numInvocations += 1;
		try {
			if (numInvocations > 1) {
				throw new Error(
					`Cannot run update, there are already ${numInvocations - 1} update invocations running`
				);
			}

			await replyPrivately('Updating...');
			await execAsync('npm run update');
			await interaction.editReply('Finished updating. Restarting now.');
			await restart();
		} finally {
			numInvocations -= 1;
		}
	},
};

async function execAsync(command: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		__unsafeExecuteCommand(command, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * Restarts the bot.
 */
async function restart(): Promise<never> {
	await execAsync('npm run restart');
	error('The above line should have killed the process. If you got here, something went wrong');
	return undefined as never;
}
