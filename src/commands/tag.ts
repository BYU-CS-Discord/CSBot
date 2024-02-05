import { SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

import { error, info } from '../logger';

const prisma = new PrismaClient();

async function main(name: string, content: string): Promise<string> {
	const tag = await prisma.tag.create({
		data: {
			name: name,
			content: content,
		},
	});
	info(tag);
	return 'tag created';
}

const builder = new SlashCommandBuilder()
	.setName('tag')
	.setDescription('Adds a Tag to the Database!')
	.addStringOption(option =>
		option.setName('tag').setDescription('The name of the tag').setMaxLength(100).setRequired(true)
	)
	.addStringOption(option =>
		option
			.setName('embed')
			.setDescription('The content to be embeded')
			// Ensure the text will fit in an embed description, if the user chooses that option
			.setMaxLength(2000)
			.setRequired(true)
	);

export const tag: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	execute({ options, reply }) {
		const tagname = options.getString('tag', true);
		const embed = options.getString('embed', true);

		main(tagname, embed)
			.then(async () => {
				await reply({ content: 'Tagged!', ephemeral: true });
				await prisma.$disconnect();
				return;
			})
			.catch(async error_ => {
				error(error_);
				await reply({ content: 'Something Went Wrong!', ephemeral: true });
				await prisma.$disconnect();
				process.exit(1);
			});
	},
};
