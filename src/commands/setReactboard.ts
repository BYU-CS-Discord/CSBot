import { Client, GuildEmoji, SlashCommandBuilder } from 'discord.js';
import { UserMessageError } from '../helpers/UserMessageError';

const channelOption = 'channel';
const thresholdOption = 'threshold';
const reactOption = 'react';

const builder = new SlashCommandBuilder()
	.setName('setreactboard')
	.setDescription('Creates or modifies reaction board in this server')
	.addChannelOption(option =>
		option
			.setName(channelOption)
			.setDescription('The channel where reactboard posts will be posted')
			.setRequired(true))
	.addIntegerOption(option =>
		option
			.setName(thresholdOption)
			.setDescription(
				'The minimum number of reacts a message should receive before being put on the board'
			)
			.setRequired(true))
	.addStringOption(option =>
		option.setName(reactOption).setDescription('The react to be tracked (defaults to ⭐)')
	);

export const setReactboard: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute({ client, options }) {
		const channel = options.getChannel(channelOption, true);
		const threshold = options.getInteger(thresholdOption, true);
		const react = options.getString(reactOption) ?? '⭐';

		if (threshold < 1) {
			throw new UserMessageError('Threshold must be at least one');
		}

		if (isUnicodeEmoji(react)) {
			
		} else {
			const customReact = getCustomReact(client, react);
			if (customReact === undefined) {
				throw new UserMessageError('React option must be a valid reaction');
			}
		}
	},
};

function isUnicodeEmoji(str: string): boolean {
	return Boolean(str.match(/^\p{Extended_Pictographic}$/u));
}

function getCustomReact(client: Client<true>, str: string): GuildEmoji | undefined {
	const reactId = str.match(/^<a?:.+?:(\d+?)>$/u)?.[1];
	if (reactId === undefined) {
		return undefined;
	}
	return client.emojis.cache.get(reactId);
}
