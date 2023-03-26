import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

const statusURI = 'https://cas.byu.edu/cas/serviceValidate';

const statuses = {
	down: {
		message: 'CAS is down again.',
		color: 0xdc2626,
	},
	up: { message: 'CAS is running, for now.', color: 0x16a34a },
};

const builder = new SlashCommandBuilder()
	.setName('iscasdown')
	.setDescription('Checks if CAS is down');

export const isCASDown: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply }) {
		const embed = new EmbedBuilder().setTitle('Is CAS Down?');

		let status = statuses.down;

		const req = await axios.get(statusURI).catch(() => null);

		if (req?.status === 200) {
			status = statuses.up;
		}

		embed.setColor(status.color);
		embed.setDescription(status.message);

		await reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};
