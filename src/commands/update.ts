import { SlashCommandBuilder } from 'discord.js';
import { exec } from 'node:child_process';

const info = new SlashCommandBuilder()
	.setName('update')
	.setDescription('Pulls the latest changes and restarts the bot')
	.setDefaultMemberPermissions('0');

export const update: GlobalCommand = {
	info,
	requiresGuild: false,
	async execute({ replyPrivately, interaction }) {
		const admin_ids = process.env['ADMINISTRATORS']?.split(',');
		if (!admin_ids) {
			// TODO: make this a UserMessageException
			throw new Error('There is no ADMINISTRATORS variable. You must set ADMINISTRATORS in .env');
		}

		if (!admin_ids.includes(interaction.user.id)) {
			// TODO: make this a UserMessageException
			throw new Error(
				'You do not have permission to perform this command. Contact the bot administrator.'
			);
		}

		await replyPrivately('Updating...');
		exec('npm run update', err => {
			void (async (): Promise<void> => {
				if (err) {
					throw err;
				}
				await interaction.editReply('Finished updating. Restarting now.');
				exec('npm run restart', err => {
					if (err) {
						throw err;
					}
				});
			})();
		});
	},
};
