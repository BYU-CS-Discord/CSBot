import { Guild, GuildEmoji, SlashCommandBuilder } from 'discord.js';
import { UserMessageError } from '../helpers/UserMessageError';
import { db } from '../database';

const channelOption = 'channel';
const thresholdOption = 'threshold';
const reactOption = 'react';

const builder = new SlashCommandBuilder()
	.setDefaultMemberPermissions('0')
	.setName('setreactboard')
	.setDescription('Creates or modifies reaction board in this server')
	.addChannelOption(option =>
		option
			.setName(channelOption)
			.setDescription('The channel where reactboard posts will be posted')
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option
			.setName(thresholdOption)
			.setDescription(
				'The minimum number of reacts a message should receive before being put on the board'
			)
			.setMinValue(1)
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName(reactOption).setDescription('The react to be tracked (defaults to ⭐)')
	);

interface ReactboardReactInfo {
	react: string;
	isCustomReact: boolean;
}

export const setReactboard: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute({ guild, options, replyPrivately }) {
		const channel = options.getChannel(channelOption, true);
		const threshold = options.getInteger(thresholdOption, true);
		const react = options.getString(reactOption) ?? '⭐';

		if (threshold < 1) {
			throw new UserMessageError('Threshold must be at least one');
		}

		let reactboardInfo: ReactboardReactInfo;
		if (isUnicodeEmoji(react)) {
			reactboardInfo = {
				react,
				isCustomReact: false,
			};
		} else {
			const customReact = await getCustomReact(guild, react);
			if (customReact === undefined) {
				throw new UserMessageError('React option must be a valid reaction');
			}
			reactboardInfo = {
				react: customReact.id,
				isCustomReact: true,
			};
		}

		await db.reactboard.upsert({
			where: {
				location: {
					channelId: channel.id,
					guildId: guild.id,
				},
			},
			update: {
				threshold,
				...reactboardInfo,
			},
			create: {
				channelId: channel.id,
				guildId: guild.id,
				threshold,
				...reactboardInfo,
			},
		});

		await replyPrivately('Reactboard created!');
	},
};

function isUnicodeEmoji(str: string): boolean {
	return Boolean(/^\p{Extended_Pictographic}$/u.test(str));
}

async function getCustomReact(guild: Guild, str: string): Promise<GuildEmoji | undefined> {
	const reactId = str.match(/^<a?:.+?:(\d+?)>$/u)?.[1];
	if (reactId === undefined) {
		return undefined;
	}
	return guild.emojis.fetch(reactId);
}
