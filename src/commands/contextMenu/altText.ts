import type { Attachment } from 'discord.js';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { isNonEmptyArray } from '../../helpers/guards/isNonEmptyArray';

export const altText: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder().setName('Get Alt Text'),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	async execute({ targetMessage, replyPrivately }) {
		const attachments: ReadonlyArray<Attachment> = Array.from(targetMessage.attachments.values());

		if (!isNonEmptyArray(attachments)) {
			return await replyPrivately('This message contains no attachments.');
		}

		if (attachments.length === 1) {
			const description = attachments[0].description?.trim();
			if (description) {
				return await replyPrivately(`## Image Description\n> ${description}`);
			}
			return await replyPrivately('The attachment in this message has no text description.');
		}

		if (attachments.every(a => a.description === null || !a.description.trim())) {
			return await replyPrivately(
				`None of the ${attachments.length} attachments in this message contains a text description.`
			);
		}

		let response = '## Image Descriptions';
		let idx = 1;
		for (const attachment of attachments) {
			const description = attachment.description?.trim();
			if (description) {
				response += `\n### Image ${idx}\n> ${description}`;
			} else {
				response += `\n### Image ${idx} has no description`;
			}
			idx += 1;
		}

		return await replyPrivately(response);
	},
};
