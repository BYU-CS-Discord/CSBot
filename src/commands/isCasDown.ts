import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const statusURI = 'https://cas.byu.edu/cas/serviceValidate';

const statuses = {
	down: {
		message: 'CAS is down again.',
		color: 0xdc_26_26,
	},
	up: { message: 'CAS is running, for now.', color: 0x16_a3_4a },
};

const builder = new SlashCommandBuilder()
	.setName('iscasdown')
	.setDescription('Checks if CAS is down');

export const isCasDown: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply }) {
		const embed = new EmbedBuilder().setTitle('Is CAS Down?');

		let status = statuses.down;

		const res = await fetch(statusURI);

		if (res.status === 200) {
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
