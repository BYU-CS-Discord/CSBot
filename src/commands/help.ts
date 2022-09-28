export const help: GlobalCommand = {
	name: 'help',
	description: 'Prints the list of commands',
	requiresGuild: false,
	async execute({ reply }) {
		await reply('Hello, world!');
	},
};
