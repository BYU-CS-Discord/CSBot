// External dependencies
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { fetchJson } from '../helpers/fetch';
import { number, string, type as schema } from 'superstruct';
import { URL } from 'node:url';

// Internal dependencies
import * as logger from '../logger';
import { UserMessageError } from '../helpers/UserMessageError';

const getComicResponse = schema({
	month: string(),
	num: number(),
	link: string(),
	news: string(),
	safe_title: string(),
	transcript: string(),
	alt: string(),
	year: string(),
	title: string(),
	day: string(),
	img: string(),
});

type GetComicResponse = typeof getComicResponse.TYPE;

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
		const url = new URL('https://xkcd.now.sh/');
		url.searchParams.set('comic', `${endpoint}`);
		return await fetchJson(url, getComicResponse);
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

const NumberOption = 'number';

const builder = new SlashCommandBuilder()
	.setName('xkcd')
	.setDescription('Fetches the most recent xkcd comic, or a selected one.')
	.addIntegerOption(option =>
		option
			.setName(NumberOption)
			.setDescription('The index number of the comic you would like to have')
			.setMinValue(1)
	);

export const xkcd: GlobalCommand = {
	requiresGuild: false,
	info: builder,

	// entry point for command execution
	async execute({ options, reply, sendTyping }) {
		let comic = '';
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
			throw new Error('XKCD call failed. Please try again later.');
		}

		// determining if a number was passed as an argument.
		const param = options.getInteger(NumberOption);
		if (param === null) {
			// no number given, just get the latest comic.
			comic = 'latest';
		} else {
			// number was provided in the command
			comic = `${param}`;
			if (param < 1 || param > latestComic.num) {
				// error checking, no negative comics or comic 0. Instead send an error message
				throw new UserMessageError(
					`Please insert a valid comic number. The range is 1-${latestComic.num}.`
				);
			}
		}
		if (comic === 'latest') {
			// just use the OG call to build the embed, since they want the latest.
			results = latestComic;
		} else {
			// get the comic from the API.
			const requestedComic = await _getComic(comic);
			if (requestedComic.num === -1) {
				throw new Error('XKCD call failed. Please try again later.');
			}
			results = requestedComic;
		}

		// we should have the data in response, build the embed.
		const embed = new EmbedBuilder()
			.setTitle(results.safe_title)
			.setAuthor({
				name: `xkcd #${results.num}`,
			})
			.setURL(`https://xkcd.com/${results.num}/`)
			.setImage(results.img)
			.setDescription(results.alt)
			.setTimestamp()
			.setFooter({ text: `Posted ${results.month}-${results.day}-${results.year}` });

		// send the embed back to the client.
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
