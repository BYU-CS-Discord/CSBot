import { EmbedBuilder, SlashCommandBuilder, Colors } from 'discord.js';

const statusURI = 'https://cas.byu.edu/cas/serviceValidate';

const down = new EmbedBuilder()
	.setTitle('Is CAS Down?')
	.setColor(Colors.Red)
	.setDescription('CAS is down again.');

const up = new EmbedBuilder()
	.setTitle('Is CAS Down?')
	.setColor(Colors.Green)
	.setDescription('CAS is running, for now.');

const builder = new SlashCommandBuilder()
	.setName('iscasdown')
	.setDescription('Checks if CAS is down');

export const isCasDown: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply }) {
		const res = await fetch(statusURI);
		const isUp = res.status === 200;
		await reply({
			embeds: [isUp ? up : down],
			ephemeral: true,
		});
	},
};
