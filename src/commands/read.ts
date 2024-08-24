import { SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

import { error, info } from '../logger.js';

const prisma = new PrismaClient();

async function main(name: string): Promise<string> {
	const taglist = await prisma.tag.findMany();
	info(taglist);
	const tag = await prisma.tag.findFirst({
		where: { name: name },
	});
	info(tag?.content);
	if (tag?.content !== undefined) {
		return tag.content;
	}
	return 'Tag not found!';
}

const builder = new SlashCommandBuilder()
	.setName('read')
	.setDescription('Replies with your input!')
	.addStringOption(option =>
		option.setName('tag').setDescription('The name of the tag').setMaxLength(100).setRequired(true)
	);

export const read: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	execute({ options, reply }) {
		const tagname = options.getString('tag', true);

		main(tagname)
			.then(async value => {
				await reply({ content: value, ephemeral: false });
				await prisma.$disconnect();
				return;
			})
			.catch(async (error_: unknown) => {
				error(error_);
				await reply({ content: 'Something Went Wrong!', ephemeral: true });
				await prisma.$disconnect();
			});
	},
};
