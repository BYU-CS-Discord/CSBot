import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import axios from 'axios';

// defining the response
interface GetComicResponse {
	month: string;
	num: number;
	year: string;
	title: string;
	day: string;
}

export const xkcd: GlobalCommand = {
	name: 'xkcd',
	description: 'Fetches the most recent xkcd comic, or a selected ',
	requiresGuild: false,
	options: [
		{
			name: 'number',
			description: 'The index number of the comic you would like to have',
			type: ApplicationCommandOptionType.Integer,
		},
	],
	async execute({ options, reply, sendTyping }) {
		let comic: string = '';
		let results: GetComicResponse = {
			month: '',
			num: 0,
			year: '',
			title: '',
			day: '',
		};
		sendTyping;
		const param = options[0];
		if (param?.value !== undefined) {
			comic = `${param.value as number}`;
			// await reply(`You sent a param! ${param.value as number}`);
		} else {
			comic = 'latest';
			// await reply('You did not send a param.');
		}
		try {
			const { data, status } = await axios.get<GetComicResponse>(
				`https://xkcd.now.sh/?comic=${comic}`
			);
			if (status !== 200) {
				console.log('Axios failed to get a comic');
				await reply('Oopsie! I did a poopie.');
				return;
			}
			results = data;
		} catch {
			console.log('Axios failed to get due to exception');
			await reply('Oopsie! I did a poopie.');
			return;
		}

		// we should have the data in response, build the embed.
		// TODO: POST MERGE WITH MAIN, ADD THE FOOTER APPVERSION
		const embed = new EmbedBuilder().setTitle(results.title).setColor(0x2b96f3);
	},
};
