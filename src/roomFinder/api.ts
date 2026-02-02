import { lookup } from './search.js';
import { type RoomSearchParams, type RoomAvailabilityResult, type EventInfo } from './types.js';

/**
 * API handlers matching the Python FastAPI server
 * These functions can be used with Express, Fastify, or directly in Discord commands
 */

export interface RoomsResponse {
	Rooms: Array<[string, string]>; // [room_number, building_name]
}

export interface WhenResponse {
	busySince: string;
	busyUntil: string;
	isInUse: boolean;
}

/**
 * GET /now/{building}
 * Finds available rooms right now in the specified building
 */
export async function searchNow(building: string): Promise<RoomsResponse> {
	const params: RoomSearchParams = {
		building: building.toUpperCase(),
		timeType: 'now',
		days: [],
	};

	const result = await lookup(params);

	// Convert to Python format: [(room_number, building_name), ...]
	// Type guard: 'now' returns RoomAvailabilityResult[]
	const rooms = (result as Array<RoomAvailabilityResult>).map(
		r => [r.roomNumber, r.buildingName] as [string, string]
	);

	// Handle 'ANY' building special case - return max 24 random rooms sorted by building
	if (building.toUpperCase() === 'ANY' && rooms.length > 0) {
		const shuffled = rooms
			.map(value => ({ value, sort: Math.random() }))
			.toSorted((a, b) => a.sort - b.sort)
			.map(({ value }) => value)
			.slice(0, Math.min(24, rooms.length));

		// Sort by building name, then room number
		const sorted = shuffled.toSorted((a, b) => {
			if (a[1] !== b[1]) return a[1].localeCompare(b[1]);
			return a[0].localeCompare(b[0]);
		});

		return { Rooms: sorted };
	}

	return { Rooms: rooms };
}

/**
 * GET /at/{building}/{time}?d=Mon&d=Wed
 * Finds available rooms at a specific time on specified days
 */
export async function searchAt(
	building: string,
	time: string,
	days: Array<string> = []
): Promise<RoomsResponse> {
	// Python capitalizes the days: [x.capitalize() for x in d]
	const capitalizedDays = days.map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase());

	const params: RoomSearchParams = {
		building: building.toUpperCase(),
		timeType: 'at',
		timeA: time,
		days: capitalizedDays,
	};

	const result = await lookup(params);
	// Type guard: 'at' returns RoomAvailabilityResult[]
	const rooms = (result as Array<RoomAvailabilityResult>).map(
		r => [r.roomNumber, r.buildingName] as [string, string]
	);

	return { Rooms: rooms };
}

/**
 * GET /between/{building}/{timeA}/{timeB}?d=Mon&d=Wed
 * Finds available rooms between two times on specified days
 */
export async function searchBetween(
	building: string,
	timeA: string,
	timeB: string,
	days: Array<string> = []
): Promise<RoomsResponse> {
	// Python capitalizes the days: [x.capitalize() for x in d]
	const capitalizedDays = days.map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase());

	const params: RoomSearchParams = {
		building: building.toUpperCase(),
		timeType: 'between',
		timeA,
		timeB,
		days: capitalizedDays,
	};

	const result = await lookup(params);
	// Type guard: 'between' returns RoomAvailabilityResult[]
	const rooms = (result as Array<RoomAvailabilityResult>).map(
		r => [r.roomNumber, r.buildingName] as [string, string]
	);

	return { Rooms: rooms };
}

/**
 * GET /when/{building}/{room}
 * Checks when a specific room is busy/available
 */
export async function searchWhen(building: string, room: string): Promise<WhenResponse> {
	const params: RoomSearchParams = {
		building: building.toUpperCase(),
		room: room,
		timeType: 'when',
		days: [],
	};

	const result = await lookup(params);
	// Type guard: 'when' returns EventInfo[]
	const events = result as Array<EventInfo>;

	// No events found
	if (events.length === 0) {
		return {
			busySince: '',
			busyUntil: '',
			isInUse: false,
		};
	}

	// Get current Mountain time to check if room is in use
	const now = new Date();
	const mountainTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));

	// Get today's date for building datetime objects
	const today = mountainTime;
	const dayEvents = events.map(e => ({
		name: e.name,
		start: parseTimeToDate(today, e.startTime),
		end: parseTimeToDate(today, e.endTime),
	}));

	// Python logic: Find first event and determine busy_until based on gap between events
	const busySince = dayEvents[0]?.start;
	let busyUntil = dayEvents[0]?.end;

	if (dayEvents.length > 1) {
		// Check for gaps > 15 minutes between consecutive events
		for (let i = 0; i < dayEvents.length - 1; i++) {
			const endTime = dayEvents[i]?.end;
			const nextStartTime = dayEvents[i + 1]?.start;
			const gapMinutes =
				!!nextStartTime && !!endTime
					? (nextStartTime.getTime() - endTime.getTime()) / (1000 * 60)
					: 0;

			if (gapMinutes > 15) {
				busyUntil = endTime;
				break;
			}
			busyUntil = dayEvents[i + 1]?.end;
		}
	}

	// Check if currently in use: busy_until > my_date > busy_since
	const isInUse =
		!!busySince && !!busyUntil && mountainTime > busySince && mountainTime < busyUntil;

	// Format dates to match Python format: '2023-02-06T12:15:00-07:00'
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-07:00`;
	};

	return {
		busySince: busySince ? formatDate(busySince) : '',
		busyUntil: busyUntil ? formatDate(busyUntil) : '',
		isInUse,
	};
}

/**
 * Helper function to parse time string (HH:MM:SS) into a Date object for today
 */
function parseTimeToDate(baseDate: Date, timeStr: string): Date {
	const [hours, minutes, seconds] = timeStr.split(':').map(Number);
	const date = new Date(baseDate);
	date.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);
	return date;
}
