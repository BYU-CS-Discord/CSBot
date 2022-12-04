/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */ // TODO REMOVE
import { SlashCommandBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function main(name: string) {
	const taglist = await prisma.tag.findMany();
	console.log(taglist);
	const tag = await prisma.tag.findFirst({
		where: { name: name },
	});
	console.log(tag?.content);
	if (tag?.content !== undefined) {
		return tag.content as string;
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
	async execute({ options, reply }) {
		const tagname = options[0] ? (options[0].value as string) : 'empty';

		main(tagname)
			// eslint-disable-next-line promise/prefer-await-to-then
			.then(async value => {
				await reply({ content: value, ephemeral: false });
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
