// External dependencies
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import axios from 'axios';

// Internal dependencies
import logger from '../logger';

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

/**
 * a quick call to see the latest comic.
 * @return the data of the most recent comic, or an empty response with num set to -1 to indicate an error.
 */
async function _latestCheck(): Promise<GetComicResponse> {
	const response = _getComic('latest');
	return await response;
}

/**
 * The actual function call to the API.
 * @param endpoint: either a string or number that is the location of the comic.
 * @return data- either a -1 in num to signify failure or the contents of the request.
 */

async function _getComic(endpoint: string | number): Promise<GetComicResponse> {
	try {
		const { data, status } = await axios.get<GetComicResponse>(
			`https://xkcd.now.sh/?comic=${endpoint}`
		);
		// TODO: BUILD A TYPE GUARD AROUND THIS
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		logger.error('Error in getting an XKCD comic:');
		logger.error(error_);
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
			img: 'ERR',
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
		/**
		 * Sends an ephemeral message to the user.]
		 * @param content: the string that should be sent to the client to let them know the error.
		 */
		async function _sendErr(content: string): Promise<void> {
			await reply({ content: content, ephemeral: true });
		}
		let comic: string = '';
		// not making this nullable, instead filling with dummy data to be later filled.
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

		// let the users know that we are getting a post, and determine which comic to get.
		sendTyping();
		const latestComic = await _latestCheck(); // a sanity check, getting the most recent comic to know the valid range of comics.

		if (latestComic.num === -1) {
			await _sendErr('XKCD call failed. Please try again later.');
			return;
		}

		// determining if a number was passed as an argument.
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
			// no number given, just get the latest comic.
			comic = 'latest';
		}
		if (comic !== 'latest') {
			// get the comic from the API.
			const requestedComic = await _getComic(comic);
			if (requestedComic.num === -1) {
				await _sendErr('XKCD call failed. Please try again later.');
				return;
			}
			results = requestedComic;
		} else {
			// just use the OG call to build the embed, since they want the latest.
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

		// send the embed back to the client.
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
