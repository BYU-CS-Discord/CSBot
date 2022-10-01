import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import axios from 'axios';

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

async function _latestCheck(): Promise<GetComicResponse> {
	const { data } = await axios.get<GetComicResponse>('https://xkcd.now.sh/?comic=latest');
	return data;
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

		// let the users know that we are getting a post, and determine which comic to getto get
		sendTyping;
		const latestComic = await _latestCheck(); // a  sanity check, getting the most recent comic to know the valid range of comics

		const param = options[0];
		if (param?.value !== undefined) {
			// number was provided in the command
			comic = `${param.value as number}`;
			if (param.value < 1 || param.value > latestComic.num) {
				// error checking, no negative comics or comic 0. Instead get the latest
				await reply({
					ephemeral: true,
					content: `Please insert a valid comic number. The range is 1-${latestComic.num}.`,
				});
				return;
			}
		} else {
			// no number given, just get the latest
			comic = 'latest';
		}
		if (comic !== 'latest') {
			// get the comic from the API
			try {
				const { data, status } = await axios.get<GetComicResponse>(
					`https://xkcd.now.sh/?comic=${comic}`
				);
				if (status !== 200) {
					console.log('Axios failed to get a comic');
					await reply({ content: 'XKCD call failed. Please try later.', ephemeral: true });
					return;
				}
				results = data;
			} catch (error) {
				console.log('Axios failed to get due to exception');
				console.log(error);
				await reply({ content: 'XKCD call failed. Please try later.', ephemeral: true });
				return;
			}
		} else {
			// just use the OG call to build the embed
			results = latestComic;
		}

		// we should have the data in response, build the embed.
		const embed = new EmbedBuilder()
			.setTitle(results.safe_title)
			.setAuthor({
				name: `xkcd #${results.num}`,
			})
			.setURL(`https://xkcd.com/${results.num}/`)
			.setImage(results.img)
			.setDescription(`${results.alt}`)
			.setColor(0x2b96f3)
			.setTimestamp()
			.setFooter({ text: `Posted ${results.month}-${results.day}-${results.year}` });

		// send the embed back
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
