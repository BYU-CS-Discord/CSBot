// External dependencies
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

// Internal dependencies
import { speak } from '../talk';

const builder = new ContextMenuCommandBuilder().setName('Talk');

export const talk: MessageContextMenuCommand = {
	info: builder,
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	async execute(context) {
		await speak(context.targetMessage.content, undefined, context);
	},
};
