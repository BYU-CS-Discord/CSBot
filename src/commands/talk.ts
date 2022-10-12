// External dependencies
import { SlashCommandBuilder, AttachmentPayload } from 'discord.js';
import { say } from '../../dectalk';

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription('Uses Dectalk to speak the given message')
	.addStringOption(option => option.setName('message').setDescription('The message to speak'));

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ options, prepareForLongRunningTasks, reply }) {
		// this shouldn't happen, but it's good to have error checking anyway
		if (options === undefined || options?.length === 0) {
			throw new Error('No options provided');
		}

		const param = options[0];

		// if no message was provided
		if (param === undefined || param?.value === undefined) {
			throw new Error('No message provided');
		}

		const message = param.value as string;

		await prepareForLongRunningTasks(true);

		const wavData: Buffer = await say(message);

		const attachment: AttachmentPayload = {
			name: 'talk.wav',
			attachment: wavData,
		};

		// TODO figure out why it always sends ephemeral
		await reply({
			ephemeral: false,
			files: [attachment],
		});
	},
};
