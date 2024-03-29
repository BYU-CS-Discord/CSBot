import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

import { speak } from '../talk.js';

const builder = new ContextMenuCommandBuilder().setName('Talk');

export const talk: MessageContextMenuCommand = {
	info: builder,
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	async execute(context) {
		await speak(context, context.targetMessage.content);
	},
};
