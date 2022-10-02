import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import axios from 'axios';

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

// a quick call to see the latest comic.
// @return the data of the most recent comic, or an empty response with num set to -1 to indicate an error.
async function _latestCheck(): Promise<GetComicResponse> {
	try {
		const { data, status } = await axios.get<GetComicResponse>('https://xkcd.now.sh/?comic=latest');
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		console.log(error_);
		const error: GetComicResponse = {
			month: '',
			num: -1,
			link: '',
			news: '',
			safe_title: '',
			transcript: '',
			alt: '',
			year: '',
			title: '',
			day: '',
			img: '',
		};
		return error;
	}
}

export const xkcd: GlobalCommand = {
	name: 'xkcd',
	description: 'Fetches the most recent xkcd comic, or a selected one.',
	requiresGuild: false,
	options: [
		{
			name: 'number',
			description: 'The index number of the comic you would like to have',
			type: ApplicationCommandOptionType.Integer,
		},
	],

	// entry point for command execution
	async execute({ options, reply, sendTyping }) {
		// sends an ephemeral message to the user
		// @param reply: the reply method given in the execute method's CommandContext
		// @param content: the string that should be sent to the client to let them know the error.
		const _sendErr = async (content: string): Promise<void> => {
			await reply({ content: content, ephemeral: true });
		};
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
		sendTyping();
		const latestComic = await _latestCheck(); // a  sanity check, getting the most recent comic to know the valid range of comics

		if (latestComic.num === -1) {
			await _sendErr('XKCD call failed. Please try again later.');
			return;
		}

		// determinining if a number was passed as an arg
		const param = options[0];
		if (param?.value !== undefined) {
			// number was provided in the command
			comic = `${param.value as number}`;
			if (param.value < 1 || param.value > latestComic.num) {
				// error checking, no negative comics or comic 0. Instead send an error message
				await _sendErr(`Please insert a valid comic number. The range is 1-${latestComic.num}.`);
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
					throw new Error(`${status}`);
				}
				results = data;
			} catch (error) {
				console.log('Axios failed to get due to exception, or a non-200 status code.');
				console.log(error);
				await _sendErr('XKCD call failed. Please try again later.');
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
			.setTimestamp()
			.setFooter({ text: `Posted ${results.month}-${results.day}-${results.year}` });

		// send the embed back
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
