export const help: GlobalCommand = {
	name: 'help',
	description: 'Prints the list of commands',
	requiresGuild: false,
	async execute({ reply }) {
		// TODO: finish this command
		await reply('Hello, world!');
	},
};
