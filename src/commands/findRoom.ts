import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { searchNow, searchAt, searchBetween, searchWhen } from '../roomFinder/api.js';
import { error } from '../logger.js';

const timeChoices = [
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
	{ name: '7:30 PM', value: '19:30:00' },
] as const;

const bldgChoices = [
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
	{ name: 'WVB', value: 'WVB' },
] as const;

const dayChoices = [
	{ name: 'Monday', value: 'Mon' },
	{ name: 'Tuesday', value: 'Tue' },
	{ name: 'Wednesday', value: 'Wed' },
	{ name: 'Thursday', value: 'Thu' },
	{ name: 'Friday', value: 'Fri' },
	{ name: 'Saturday', value: 'Sat' },
	{ name: 'Sunday', value: 'Sun' },
] as const;

export function convertTo12Hour(time: string): string {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	if (hours !== undefined && minutes !== undefined && seconds !== undefined) {
		const suffix = hours >= 12 ? 'PM' : 'AM';
		const convertedHours = hours % 12 || 12;
		return `${convertedHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
	}
	return 'ERR';
}

const builder = new SlashCommandBuilder()
	.setName('findroom')
	.setDescription('Finds rooms available at a given time')
	.addSubcommand(subcommand =>
		subcommand
			.setName('now')
			.setDescription('Finds you an available room on campus right now!')
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in')
					.addChoices(...bldgChoices)
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
					.addChoices(...timeChoices)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in')
					.addChoices(...bldgChoices)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('day1')
					.setDescription('First day to search (optional)')
					.addChoices(...dayChoices)
					.setRequired(false)
			)
			.addStringOption(option =>
				option
					.setName('day2')
					.setDescription('Second day to search (optional)')
					.addChoices(...dayChoices)
					.setRequired(false)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('between')
			.setDescription('Finds you an available room on campus during a time range!')
			.addStringOption(option =>
				option
					.setName('start_time')
					.setDescription('Start time')
					.addChoices(...timeChoices)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('end_time')
					.setDescription('End time')
					.addChoices(...timeChoices)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in')
					.addChoices(...bldgChoices)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('day1')
					.setDescription('First day to search (optional)')
					.addChoices(...dayChoices)
					.setRequired(false)
			)
			.addStringOption(option =>
				option
					.setName('day2')
					.setDescription('Second day to search (optional)')
					.addChoices(...dayChoices)
					.setRequired(false)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('when')
			.setDescription('Finds you information about when next a room is available!')
			.addStringOption(option =>
				option
					.setName('building')
					.setDescription('The building acronym to search in')
					.addChoices(...bldgChoices)
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
	async execute({ reply, options }): Promise<void> {
		const input_bldg = options.getString('building');
		const input_room = options.getString('room');
		const input_timeA = options.getString('start_time');
		const input_timeB = options.getString('end_time');
		const day1 = options.getString('day1');
		const day2 = options.getString('day2');
		const type = options.getSubcommand();

		let embedTitle = '';
		let embedDescription = '';
		let embedThumbnail =
			'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Brigham_Young_University_medallion.svg/240px-Brigham_Young_University_medallion.svg.png';
		let embedColor = 0x00_66_cc;

		try {
			switch (type) {
				case 'now': {
					if (input_bldg !== null) {
						const requestedList = await searchNow(input_bldg);
						const locationText =
							input_bldg === 'ANY' ? 'anywhere on campus' : `in the ${input_bldg}`;
						if (requestedList.Rooms.length === 0) {
							embedTitle = `No rooms available now ${locationText}`;
							embedDescription = 'Try again later!';
							embedColor = 0xff_00_00; // Red
						} else {
							const roomString = requestedList.Rooms.map(room => `${room[1]}, ${room[0]}`).join(
								'\n'
							);
							embedTitle = `Rooms available now ${locationText}`;
							embedDescription = roomString;
						}
					}
					break;
				}

				case 'at': {
					if (input_bldg !== null && input_timeA !== null) {
						const days = [day1, day2].filter(d => d !== null);
						const requestedList = await searchAt(input_bldg, input_timeA, days);
						const locationText =
							input_bldg === 'ANY' ? 'anywhere on campus' : `in the ${input_bldg}`;
						if (requestedList.Rooms.length === 0) {
							embedTitle = `No rooms available at ${convertTo12Hour(input_timeA)} ${locationText}`;
							embedDescription =
								days.length > 0 ? `Days: ${days.join(', ')}\nTry again later!` : 'Try again later!';
							embedColor = 0xff_00_00;
						} else {
							const roomString = requestedList.Rooms.map(room => `${room[1]}, ${room[0]}`).join(
								'\n'
							);
							embedTitle = `Rooms available ${locationText} at ${convertTo12Hour(input_timeA)}`;
							embedDescription =
								days.length > 0 ? `Days: ${days.join(', ')}\n\n${roomString}` : roomString;
						}
					}
					break;
				}

				case 'between': {
					if (input_bldg !== null && input_timeA !== null && input_timeB !== null) {
						const days = [day1, day2].filter(d => d !== null);
						const requestedList = await searchBetween(input_bldg, input_timeA, input_timeB, days);
						const locationText =
							input_bldg === 'ANY' ? 'anywhere on campus' : `in the ${input_bldg}`;
						if (requestedList.Rooms.length === 0) {
							embedTitle = `No rooms available between ${convertTo12Hour(
								input_timeA
							)} and ${convertTo12Hour(input_timeB)}`;
							embedDescription =
								days.length > 0 ? `Days: ${days.join(', ')}\nTry again later!` : 'Try again later!';
							embedColor = 0xff_00_00;
						} else {
							const roomString = requestedList.Rooms.map(room => `${room[1]}, ${room[0]}`).join(
								'\n'
							);
							embedTitle = `Rooms available ${locationText} between ${convertTo12Hour(
								input_timeA
							)} and ${convertTo12Hour(input_timeB)}`;
							embedDescription =
								days.length > 0 ? `Days: ${days.join(', ')}\n\n${roomString}` : roomString;
						}
					}
					break;
				}

				case 'when': {
					if (input_bldg !== null && input_room !== null) {
						const requestedList = await searchWhen(input_bldg, input_room);
						const busySince =
							requestedList.busySince === ''
								? requestedList.busySince
								: requestedList.busySince.slice(11, 19);
						const busyUntil =
							requestedList.busyUntil === ''
								? requestedList.busyUntil
								: requestedList.busyUntil.slice(11, 19);
						const isInUse = requestedList.isInUse;

						let roomString = '';

						if (busySince === '' || busyUntil === '') {
							roomString = `I couldn't find any information today for room ${input_room} in the ${input_bldg}, either it doesn't exist or it has no scheduled events for the remainder of the day.`;
						} else if (isInUse) {
							roomString = `This room is currently busy from ${convertTo12Hour(
								busySince
							)} to ${convertTo12Hour(busyUntil)}`;
							embedColor = 0xff_00_00;
						} else {
							roomString = `Room ${input_room} is currently free, with its next event scheduled from ${convertTo12Hour(
								busySince
							)} to ${convertTo12Hour(busyUntil)}`;
							embedColor = 0x00_ff_00; // Green
						}

						embedTitle = `Room ${input_room} in the ${input_bldg}`;
						embedThumbnail = `https://aim-classroom-img-prd.byu-oit-sis-prd.amazon.byu.edu/?id=${input_bldg}/${input_room}f.jpg`;
						embedDescription = roomString;
					}
					break;
				}
			}
		} catch (error_) {
			error('Error in room finder:');
			error(error_);
			embedTitle = 'Error';
			embedDescription = `An error occurred: ${error_ instanceof Error ? error_.message : 'Unknown error'}`;
			embedColor = 0xff_00_00;
		}

		// Build the embed
		const embed = new EmbedBuilder()
			.setTitle(embedTitle)
			.setThumbnail(embedThumbnail)
			.setDescription(embedDescription)
			.setColor(embedColor)
			.setTimestamp()
			.setFooter({
				text: 'BYU Room Finder',
				iconURL:
					'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Brigham_Young_University_medallion.svg/240px-Brigham_Young_University_medallion.svg.png',
			});

		// Send the embed back to the client
		await reply({
			embeds: [embed],
		});
	},
};
