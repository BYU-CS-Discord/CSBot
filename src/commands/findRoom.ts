import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

import * as logger from '../logger';

interface GetRoomInfoResponse {
	busySince: string;
	busyUntil: string;
	isInUse: boolean;
}

interface GetRoomsResponse {
	Rooms: Array<[string, string]> | [];
}

function convertTo12Hour(time: string): string {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	if (hours !== undefined && minutes !== undefined && seconds !== undefined) {
		const suffix = hours >= 12 ? 'PM' : 'AM';
		const convertedHours = hours % 12 || 12;
		return `${convertedHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
	}
	return 'ERR';
}

async function _getRoomsNow(search_type: string, building: string): Promise<GetRoomsResponse> {
	try {
		const { data, status } = await axios.get<GetRoomsResponse>(
			`https://pi.zyancey.com/${search_type}/${building}`
		);
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		logger.error('Error in getting Room Info:');
		logger.error(error_);
		const error: GetRoomsResponse = {
			Rooms: [],
		};
		return error;
	}
}

async function _getRoomsAt(
	search_type: string,
	building: string,
	timeA: string
): Promise<GetRoomsResponse> {
	try {
		const { data, status } = await axios.get<GetRoomsResponse>(
			`https://pi.zyancey.com/${search_type}/${building}/${timeA}`
		);
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		logger.error('Error in getting Room Info:');
		logger.error(error_);
		const error: GetRoomsResponse = {
			Rooms: [],
		};
		return error;
	}
}
async function _getRoomsBetween(
	search_type: string,
	building: string,
	timeA: string,
	timeB: string
): Promise<GetRoomsResponse> {
	try {
		const { data, status } = await axios.get<GetRoomsResponse>(
			`https://pi.zyancey.com/${search_type}/${building}/${timeA}/${timeB}`
		);
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		logger.error('Error in getting Room Info:');
		logger.error(error_);
		const error: GetRoomsResponse = {
			Rooms: [],
		};
		return error;
	}
}

async function _getWhenRoom(
	search_type: string,
	building: string,
	room: string
): Promise<GetRoomInfoResponse> {
	try {
		const { data, status } = await axios.get<GetRoomInfoResponse>(
			`https://pi.zyancey.com/${search_type}/${building}/${room}`
		);
		if (status !== 200) throw new Error(`${status}`);
		return data;
	} catch (error_) {
		logger.error('Error in getting Room Info:');
		logger.error(error_);
		const error: GetRoomInfoResponse = {
			busySince: 'Error',
			busyUntil: 'Error',
			isInUse: false,
		};
		return error;
	}
}

const builder = new SlashCommandBuilder()
	.setName('findroom')
	.setDescription('Finds you a room to study in on campus!')
	.addSubcommand(subcommand =>
		subcommand
			.setName('now')
			.setDescription('Finds you an available room on campus right now!')
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in, type any to see all options')
					.addChoices(
						{ name: 'ANY', value: 'ANY' },
						{ name: 'BNSN', value: 'BNSN' },
						{ name: 'BRMB', value: 'BRMB' },
						{ name: 'CTB', value: 'CTB' },
						{ name: 'EB', value: 'EB' },
						{ name: 'ELLB', value: 'ELLB' },
						{ name: 'ESC', value: 'ESC' },
						{ name: 'HBLL', value: 'HBLL' },
						{ name: 'JFSB', value: 'JFSB' },
						{ name: 'JKB', value: 'JKB' },
						{ name: 'JRCB', value: 'JRCB' },
						{ name: 'JSB', value: 'JSB' },
						{ name: 'KMBL', value: 'KMBL' },
						{ name: 'LSB', value: 'LSB' },
						{ name: 'MARB', value: 'MARB' },
						{ name: 'MB', value: 'MB' },
						{ name: 'MCDB', value: 'MCDB' },
						{ name: 'MCKB', value: 'MCKB' },
						{ name: 'MSRB', value: 'MSRB' },
						{ name: 'SLC', value: 'SLC' },
						{ name: 'TLRB', value: 'TLRB' },
						{ name: 'TMCB', value: 'TMCB' },
						{ name: 'TNRB', value: 'TNRB' },
						{ name: 'WSC', value: 'WSC' },
						{ name: 'WVB', value: 'WVB' }
					)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('at')
			.setDescription('Finds you an available room on campus at a given time!')
			.addStringOption(option =>
				option
					.setName('start_time')
					.setDescription('What time would you like to search for?')
					.addChoices(
						{ name: '8:00 AM', value: '08:00:00' },
						{ name: '8:30 AM', value: '08:30:00' },
						{ name: '9:00 AM', value: '09:00:00' },
						{ name: '9:30 AM', value: '09:30:00' },
						{ name: '10:00 AM', value: '10:00:00' },
						{ name: '10:30 AM', value: '10:30:00' },
						{ name: '11:00 AM', value: '11:00:00' },
						{ name: '11:30 AM', value: '11:30:00' },
						{ name: '12:00 PM', value: '12:00:00' },
						{ name: '12:30 PM', value: '12:30:00' },
						{ name: '1:00 PM', value: '13:00:00' },
						{ name: '1:30 PM', value: '13:30:00' },
						{ name: '2:00 PM', value: '14:00:00' },
						{ name: '2:30 PM', value: '14:30:00' },
						{ name: '3:00 PM', value: '15:00:00' },
						{ name: '3:30 PM', value: '15:30:00' },
						{ name: '4:00 PM', value: '16:00:00' },
						{ name: '4:30 PM', value: '16:30:00' },
						{ name: '5:00 PM', value: '17:00:00' },
						{ name: '5:30 PM', value: '17:30:00' },
						{ name: '6:00 PM', value: '18:00:00' },
						{ name: '6:30 PM', value: '18:30:00' },
						{ name: '7:00 PM', value: '19:00:00' },
						{ name: '7:30 PM', value: '19:30:00' }
					)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in, type any to see all options')
					.addChoices(
						{ name: 'ANY', value: 'ANY' },
						{ name: 'BNSN', value: 'BNSN' },
						{ name: 'BRMB', value: 'BRMB' },
						{ name: 'CTB', value: 'CTB' },
						{ name: 'EB', value: 'EB' },
						{ name: 'ELLB', value: 'ELLB' },
						{ name: 'ESC', value: 'ESC' },
						{ name: 'HBLL', value: 'HBLL' },
						{ name: 'JFSB', value: 'JFSB' },
						{ name: 'JKB', value: 'JKB' },
						{ name: 'JRCB', value: 'JRCB' },
						{ name: 'JSB', value: 'JSB' },
						{ name: 'KMBL', value: 'KMBL' },
						{ name: 'LSB', value: 'LSB' },
						{ name: 'MARB', value: 'MARB' },
						{ name: 'MB', value: 'MB' },
						{ name: 'MCDB', value: 'MCDB' },
						{ name: 'MCKB', value: 'MCKB' },
						{ name: 'MSRB', value: 'MSRB' },
						{ name: 'SLC', value: 'SLC' },
						{ name: 'TLRB', value: 'TLRB' },
						{ name: 'TMCB', value: 'TMCB' },
						{ name: 'TNRB', value: 'TNRB' },
						{ name: 'WSC', value: 'WSC' },
						{ name: 'WVB', value: 'WVB' }
					)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('between')
			.setDescription('Finds you an available room on campus at a given time!')
			.addStringOption(option =>
				option
					.setName('start_time')
					.setDescription('What time would you like to search for?')
					.addChoices(
						{ name: '8:00 AM', value: '08:00:00' },
						{ name: '8:30 AM', value: '08:30:00' },
						{ name: '9:00 AM', value: '09:00:00' },
						{ name: '9:30 AM', value: '09:30:00' },
						{ name: '10:00 AM', value: '10:00:00' },
						{ name: '10:30 AM', value: '10:30:00' },
						{ name: '11:00 AM', value: '11:00:00' },
						{ name: '11:30 AM', value: '11:30:00' },
						{ name: '12:00 PM', value: '12:00:00' },
						{ name: '12:30 PM', value: '12:30:00' },
						{ name: '1:00 PM', value: '13:00:00' },
						{ name: '1:30 PM', value: '13:30:00' },
						{ name: '2:00 PM', value: '14:00:00' },
						{ name: '2:30 PM', value: '14:30:00' },
						{ name: '3:00 PM', value: '15:00:00' },
						{ name: '3:30 PM', value: '15:30:00' },
						{ name: '4:00 PM', value: '16:00:00' },
						{ name: '4:30 PM', value: '16:30:00' },
						{ name: '5:00 PM', value: '17:00:00' },
						{ name: '5:30 PM', value: '17:30:00' },
						{ name: '6:00 PM', value: '18:00:00' },
						{ name: '6:30 PM', value: '18:30:00' },
						{ name: '7:00 PM', value: '19:00:00' },
						{ name: '7:30 PM', value: '19:30:00' }
					)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('end_time')
					.setDescription('What time would you like to search for?')
					.addChoices(
						{ name: '8:00 AM', value: '08:00:00' },
						{ name: '8:30 AM', value: '08:30:00' },
						{ name: '9:00 AM', value: '09:00:00' },
						{ name: '9:30 AM', value: '09:30:00' },
						{ name: '10:00 AM', value: '10:00:00' },
						{ name: '10:30 AM', value: '10:30:00' },
						{ name: '11:00 AM', value: '11:00:00' },
						{ name: '11:30 AM', value: '11:30:00' },
						{ name: '12:00 PM', value: '12:00:00' },
						{ name: '12:30 PM', value: '12:30:00' },
						{ name: '1:00 PM', value: '13:00:00' },
						{ name: '1:30 PM', value: '13:30:00' },
						{ name: '2:00 PM', value: '14:00:00' },
						{ name: '2:30 PM', value: '14:30:00' },
						{ name: '3:00 PM', value: '15:00:00' },
						{ name: '3:30 PM', value: '15:30:00' },
						{ name: '4:00 PM', value: '16:00:00' },
						{ name: '4:30 PM', value: '16:30:00' },
						{ name: '5:00 PM', value: '17:00:00' },
						{ name: '5:30 PM', value: '17:30:00' },
						{ name: '6:00 PM', value: '18:00:00' },
						{ name: '6:30 PM', value: '18:30:00' },
						{ name: '7:00 PM', value: '19:00:00' },
						{ name: '7:30 PM', value: '19:30:00' }
					)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in, type any to see all options')
					.addChoices(
						{ name: 'ANY', value: 'ANY' },
						{ name: 'BNSN', value: 'BNSN' },
						{ name: 'BRMB', value: 'BRMB' },
						{ name: 'CTB', value: 'CTB' },
						{ name: 'EB', value: 'EB' },
						{ name: 'ELLB', value: 'ELLB' },
						{ name: 'ESC', value: 'ESC' },
						{ name: 'HBLL', value: 'HBLL' },
						{ name: 'JFSB', value: 'JFSB' },
						{ name: 'JKB', value: 'JKB' },
						{ name: 'JRCB', value: 'JRCB' },
						{ name: 'JSB', value: 'JSB' },
						{ name: 'KMBL', value: 'KMBL' },
						{ name: 'LSB', value: 'LSB' },
						{ name: 'MARB', value: 'MARB' },
						{ name: 'MB', value: 'MB' },
						{ name: 'MCDB', value: 'MCDB' },
						{ name: 'MCKB', value: 'MCKB' },
						{ name: 'MSRB', value: 'MSRB' },
						{ name: 'SLC', value: 'SLC' },
						{ name: 'TLRB', value: 'TLRB' },
						{ name: 'TMCB', value: 'TMCB' },
						{ name: 'TNRB', value: 'TNRB' },
						{ name: 'WSC', value: 'WSC' },
						{ name: 'WVB', value: 'WVB' }
					)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('when')
			.setDescription('Finds you information about when next a room is available!')
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in, type any to see all options')
					.addChoices(
						{ name: 'ANY', value: 'ANY' },
						{ name: 'BNSN', value: 'BNSN' },
						{ name: 'BRMB', value: 'BRMB' },
						{ name: 'CTB', value: 'CTB' },
						{ name: 'EB', value: 'EB' },
						{ name: 'ELLB', value: 'ELLB' },
						{ name: 'ESC', value: 'ESC' },
						{ name: 'HBLL', value: 'HBLL' },
						{ name: 'JFSB', value: 'JFSB' },
						{ name: 'JKB', value: 'JKB' },
						{ name: 'JRCB', value: 'JRCB' },
						{ name: 'JSB', value: 'JSB' },
						{ name: 'KMBL', value: 'KMBL' },
						{ name: 'LSB', value: 'LSB' },
						{ name: 'MARB', value: 'MARB' },
						{ name: 'MB', value: 'MB' },
						{ name: 'MCDB', value: 'MCDB' },
						{ name: 'MCKB', value: 'MCKB' },
						{ name: 'MSRB', value: 'MSRB' },
						{ name: 'SLC', value: 'SLC' },
						{ name: 'TLRB', value: 'TLRB' },
						{ name: 'TMCB', value: 'TMCB' },
						{ name: 'TNRB', value: 'TNRB' },
						{ name: 'WSC', value: 'WSC' },
						{ name: 'WVB', value: 'WVB' }
					)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('room')
					.setDescription('What room would you like to search for?')
					.setRequired(true)
			)
	);

export const findRoom: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, interaction }): Promise<void> {
		const input_bldg = interaction.options.getString('building');
		const input_room = interaction.options.getString('room');
		const input_timeA = interaction.options.getString('start_time');
		const input_timeB = interaction.options.getString('end_time');
		const type = interaction.options.getSubcommand();

		let embedTitle = '';
		let embedDescription = '';
		let embedThumbnail = 'https://pi.zyancey.com/img/room-finder-logo.png'; // not currently used, placeholder so that it doesn't show

		if (type === 'now') {
			if (input_bldg !== null) {
				const requestedComic = await _getRoomsNow('now', input_bldg);
				if (requestedComic.Rooms.length === 0) {
					embedTitle = `No rooms available now in the ${input_bldg}`;
					embedDescription = 'Try again later!';
				} else {
					const roomString = requestedComic.Rooms.map(room => room.reverse().join(', ')).join('\n');
					embedTitle = `Rooms available now in the ${input_bldg}`;
					embedDescription = roomString;
				}
			}
		}

		if (type === 'at') {
			if (input_bldg !== null && input_timeA !== null) {
				const requestedComic = await _getRoomsAt('at', input_bldg, input_timeA);
				if (requestedComic.Rooms.length === 0) {
					embedTitle = `No rooms available at ${convertTo12Hour(input_timeA)} in the ${input_bldg}`;
					embedDescription = 'Try again later!';
				} else {
					const roomString = requestedComic.Rooms.map(room => room.reverse().join(', ')).join('\n');
					embedTitle = `Rooms available in the ${input_bldg} at ${convertTo12Hour(input_timeA)}`;
					embedDescription = roomString;
				}
			}
		}

		if (type === 'between') {
			if (input_bldg !== null && input_timeA !== null && input_timeB !== null) {
				const requestedComic = await _getRoomsBetween(
					'between',
					input_bldg,
					input_timeA,
					input_timeB
				);
				if (requestedComic.Rooms.length === 0) {
					embedTitle = `No rooms available between ${convertTo12Hour(
						input_timeA
					)} and ${convertTo12Hour(input_timeB)}`;
					embedDescription = 'Try again later!';
				} else {
					const roomString = requestedComic.Rooms.map(room => room.reverse().join(', ')).join('\n');
					embedTitle = `Rooms available in the ${input_bldg} between ${convertTo12Hour(
						input_timeA
					)} and ${convertTo12Hour(input_timeB)}`;
					embedDescription = roomString;
				}
			}
		}

		if (type === 'when') {
			if (input_bldg !== null && input_room !== null) {
				const requestedComic = await _getWhenRoom(type, input_bldg, input_room);
				const busySince =
					requestedComic.busySince !== ''
						? requestedComic.busySince.slice(11, 19)
						: requestedComic.busySince;
				const busyUntil =
					requestedComic.busyUntil !== ''
						? requestedComic.busyUntil.slice(11, 19)
						: requestedComic.busyUntil;
				// FORMAT 2023-02-06T12:15:00-07:00
				const isInUse = requestedComic.isInUse;

				let roomString = '';

				if (busySince === '' || busyUntil === '') {
					roomString = `I couldn't find any information today for room ${input_room} in the ${input_bldg}, either it doesn't exist or it has no scheduled events for the remainder of the day.`;
				} else if (isInUse) {
					roomString = `This room is currently busy from ${convertTo12Hour(
						busySince
					)} to ${convertTo12Hour(busyUntil)}`;
				} else {
					roomString = `Room ${input_room} is currently free, with its next event scheduled from ${convertTo12Hour(
						busySince
					)} to ${convertTo12Hour(busyUntil)}`;
				}

				embedTitle = `Room ${input_room} in the ${input_bldg}`;
				embedThumbnail = `https://aim-classroom-img-prd.byu-oit-sis-prd.amazon.byu.edu/?id=${input_bldg}/${input_room}f.jpg`;
				embedDescription = roomString;
			}
		}

		// we should have the data in response, build the embed.
		const embed = new EmbedBuilder()
			.setTitle(embedTitle)
			.setThumbnail(embedThumbnail)
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter({
				text: 'BYU Room Finder',
				// Going to locally host this on my server soon, I'll make that change when I come back and add thumbnails for the building searches
				iconURL:
					'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Brigham_Young_University_medallion.svg/240px-Brigham_Young_University_medallion.svg.png',
			});

		// send the embed back to the client.
		await reply({
			embeds: [embed],
			ephemeral: false,
		});
	},
};
