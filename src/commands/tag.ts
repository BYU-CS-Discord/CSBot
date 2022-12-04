/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */ // TODO REMOVE
import { SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function main(name: string, content: string) {
	const tag = await prisma.tag.create({
		data: {
			name: name,
			content: content,
		},
	});
	console.log(tag);
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
	async execute({ options, reply }) {
		const tagname = options[0] ? (options[0].value as string) : 'empty';
		const embed = options[1] ? (options[1].value as string) : 'empty';

		main(tagname, embed)
			// eslint-disable-next-line promise/prefer-await-to-then
			.then(async () => {
				await reply({ content: 'Tagged!', ephemeral: true });
				await prisma.$disconnect();
			})
			// eslint-disable-next-line promise/prefer-await-to-then
			.catch(async e => {
				console.error(e);
				await reply({ content: 'Something Went Wrong!', ephemeral: true });
				await prisma.$disconnect();
				process.exit(1);
			});
	},
};
