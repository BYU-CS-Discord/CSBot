import { db } from '../database/index.js';
import { type RoomSearchParams, type RoomAvailabilityResult, type EventInfo, DAY_MAP } from './types.js';
import { Prisma } from '@prisma/client';

export async function lookup(params: RoomSearchParams): Promise<RoomAvailabilityResult[] | EventInfo[]> {
	const { building, room, timeType, timeA, timeB, days } = params;

	// Fetch building record if building is specified
	let buildingRecord = null;
	if (building && building !== 'ANY') {
		buildingRecord = await db.buildings.findFirst({
			where: { name: building }
		});

		if (!buildingRecord) {
			return [];
		}
	}

	// Start with all classroom rooms
	let query = db.rooms.findMany({
		where: {
			description: 'CLASSROOM'
		},
		include: {
			building: true
		}
	});

	// Filter by building if specified
	if (building && building !== 'ANY' && buildingRecord) {
		query = db.rooms.findMany({
			where: {
				description: 'CLASSROOM',
				buildingId: buildingRecord.id
			},
			include: {
				building: true
			}
		});
	}

	// Get current date/time information in US/Mountain timezone
	// Python uses: datetime.now(timezone('US/Mountain'))
	const now = new Date();
	const mountainTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
	const currentTime = mountainTime.toTimeString().slice(0, 8); // HH:MM:SS format
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const currentDayAbbrev = dayNames[mountainTime.getDay()];
	const currentDay = DAY_MAP[currentDayAbbrev || 'Mon'] || 'M';

	let conflictingEventsQuery = db.events.findMany({
		include: {
			room: true
		}
	});

	let currentEventsQuery = db.events.findMany({
		include: {
			room: {
				include: {
					building: true
				}
			}
		}
	});

	if (timeType === 'now') {
		// Check for conflicting events right now
		// Python: .where(SQL("EXISTS (SELECT 1 FROM json_each(days) WHERE value = ?)", (day,)))
		conflictingEventsQuery = db.events.findMany({
			where: {
				AND: [
					{
						days: {
							contains: `"${currentDay}"`
						}
					},
					{
						startTime: { lte: currentTime }
					},
					{
						endTime: { gt: currentTime }
					}
				]
			},
			include: {
				room: true
			}
		});
	} else if (timeType === 'when') {
		// Get current events for specific room
		if (!building || !room) {
			throw new Error('Building and room are required for "when" queries');
		}

		currentEventsQuery = db.events.findMany({
			where: {
				AND: [
					{
						room: {
							building: {
								name: building
							},
							number: room
						}
					},
					{
						endTime: {
							gte: currentTime
						}
					},
					{
						days: {
							contains: `"${currentDay}"`
						}
					}
				]
			},
			include: {
				room: {
					include: {
						building: true
					}
				}
			},
			orderBy: {
				startTime: 'asc'
			},
			take: 5
		});
	} else if (timeType === 'at') {
		if (!timeA || !isValidTimeFormat(timeA)) {
			throw new Error('Valid timeA is required for "at" queries');
		}

		// Check for conflicting events at specific time
		// Python uses: .where(SQL("EXISTS (SELECT 1 FROM json_each(days) WHERE value IN (...))", days))
		// For SQLite JSON arrays, we need to check if any of the input days are in the JSON array
		if (days.length === 0) {
			// No days specified, return empty
			conflictingEventsQuery = db.events.findMany({
				where: { id: -1 }, // No results
				include: { room: true }
			});
		} else {
			conflictingEventsQuery = db.events.findMany({
				where: {
					AND: [
						{
							OR: days.map(day => ({
								days: { contains: `"${day}"` }
							}))
						},
						{
							startTime: { lte: timeA }
						},
						{
							endTime: { gt: timeA }
						}
					]
				},
				include: {
					room: true
				}
			});
		}
	} else if (timeType === 'between') {
		if (!timeA || !timeB || !isValidTimeFormat(timeA) || !isValidTimeFormat(timeB)) {
			throw new Error('Valid timeA and timeB are required for "between" queries');
		}

		// Check for conflicting events in time range
		// Python uses: .where(SQL("EXISTS (SELECT 1 FROM json_each(days) WHERE value IN (...))", days))
		// For SQLite JSON arrays, we need to check if any of the input days are in the JSON array
		if (days.length === 0) {
			// No days specified, return empty
			conflictingEventsQuery = db.events.findMany({
				where: { id: -1 }, // No results
				include: { room: true }
			});
		} else {
			conflictingEventsQuery = db.events.findMany({
				where: {
					AND: [
						{
							OR: days.map(day => ({
								days: { contains: `"${day}"` }
							}))
						},
						{
							OR: [
								{
									AND: [
										{ startTime: { lte: timeA } },
										{ endTime: { gt: timeA } }
									]
								},
								{
									AND: [
										{ startTime: { lt: timeB } },
										{ endTime: { gte: timeB } }
									]
								},
								{
									AND: [
										{ startTime: { gte: timeA } },
										{ endTime: { lte: timeB } }
									]
								}
							]
						}
					]
				},
				include: {
					room: true
				}
			});
		}
	}

	if (timeType === 'when') {
		// Return current events for the room
		const currentEvents = await currentEventsQuery;
		return currentEvents.map((event: { name: any; startTime: any; endTime: any; }) => ({
			name: event.name,
			startTime: event.startTime,
			endTime: event.endTime
		}));
	} else {
		// Get conflicting room IDs
		const conflictingEvents = await conflictingEventsQuery;
		const conflictingRoomIds = conflictingEvents.map((event: { roomId: any; }) => event.roomId);

		// Get available rooms (not in conflicting events)
		const availableRooms = await db.rooms.findMany({
			where: {
				id: {
					notIn: conflictingRoomIds.length > 0 ? conflictingRoomIds : [-1]
				},
				description: 'CLASSROOM',
				...(building && building !== 'ANY' && buildingRecord ? { buildingId: buildingRecord.id } : {})
			},
			include: {
				building: true
			},
			orderBy: [
				{ building: { name: 'asc' } },
				{ number: 'asc' }
			]
		});

		return availableRooms.map((room: { number: any; building: { name: any; }; }) => ({
			roomNumber: room.number,
			buildingName: room.building.name
		}));
	}
}

function isValidTimeFormat(time: string): boolean {
	return /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/.test(time);
}
