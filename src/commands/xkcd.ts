import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { appVersion } from '../constants/meta';

// defining the response
interface GetComicResponse {
	month: string;
	num: number;
	link: string;
	news: string;
	safe_title: string;
	transcript: string;
	alt: string;
	year: string;
	title: string;
	day: string;
	img: string;
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
		// not making this nullable, instead filling with dummy data to be later filled
		let results: GetComicResponse = {
			month: '',
			num: 0,
			year: '',
			title: '',
			day: '',
			img: '',
			link: '',
			news: '',
			safe_title: '',
			alt: '',
			transcript: '',
		};

		// let the users know that we are getting a post, and determine which to get
		sendTyping;
		const param = options[0];
		if (param?.value !== undefined) {
			comic = `${param.value as number}`;
			if (param.value < 0) {
				// error checking, no negative comics
				comic = 'latest';
			}
		} else {
			// no number given, just get the latest
			comic = 'latest';
		}

		// get the comic from the API
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
		const embed = new EmbedBuilder()
			.setTitle(results.safe_title)
			.setAuthor({ name: `${results.month} - ${results.day} ${results.year}` })
			.setDescription(`${results.alt}`)
			.setURL(`https://xkcd.com/${comic}/`)
			.setColor(0x2b96f3)
			.setTimestamp()
			.setFooter({ text: `v${appVersion}` });

		// send the embed back
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
