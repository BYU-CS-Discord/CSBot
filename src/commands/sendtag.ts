import { SlashCommandBuilder } from 'discord.js';

const NameOption = 'name';

const info = new SlashCommandBuilder()
	.setName('sendtag')
	.setDescription('Posts a tagged reaction image (for testing purposes)')
	.addStringOption(option =>
		option
			.setName(NameOption)
			.setDescription('The name of the tag')
			.setRequired(true)
			.setAutocomplete(true)
	);

export const sendtag: GuildedCommand = {
	info,
	requiresGuild: true,
	autocomplete(interaction) {
		// Get the user-provided intermediate value
		const incompleteValue = interaction.options.getFocused();

		// TODO: Available tags for the guild. On startup, cache this list somewhere reasonable so we don't have to fetch from the database every time. We only have 3 seconds to respond, so we can't afford to fetch the list each time we need it.
		const tags = [
			'texans',
			'inthisphoto',
			'allstar',
			'detracted',
			'balancerestored',
			'tumblememe',
			'disappointed',
			'cleanse',
			'unsee',
			'banhammer',
			'thisisdating',
			'dosomething',
			'useless',
			'memesismemes',
			'intense',
			'politics',
			'justgetmarried',
			'what',
			'due',
			'hacc',
			'tehc',
			'futureme',
			'hco',
			'anarchy',
			'dannflorwasright',
			'thisiscs',
			'gostudy',
		];

		// Respond with the available options
		return tags
			.filter(choice => choice.startsWith(incompleteValue)) // TODO: Use something like Fuse.js for fast fuzzy search
			.map(choice => ({ name: choice, value: choice }));
	},
	async execute({ reply, options }) {
		const value = options.getString(NameOption, true);
		// Note that autocomplete does not force the user to select one of the valid values. We should check here that the given value is a known one.
		await reply(`You requested the '${value}' tag!`);
	},
};
