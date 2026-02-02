import { db } from '../database/index.js';
import type { Building, Room, Event, RoomAvailabilityResult } from './types.js';

/**
 * Get all available buildings
 */
export async function getAllBuildings(): Promise<Array<Building>> {
	return await db.buildings.findMany({
		orderBy: {
			name: 'asc',
		},
	});
}

/**
 * Get all rooms for a specific building
 */
export async function getRoomsByBuilding(buildingName: string): Promise<Array<Room>> {
	return await db.rooms.findMany({
		where: {
			building: {
				name: buildingName,
			},
		},
		include: {
			building: true,
		},
		orderBy: {
			number: 'asc',
		},
	});
}

/**
 * Get all rooms
 */
export async function getAllRooms(): Promise<Array<Room>> {
	return await db.rooms.findMany({
		include: {
			building: true,
		},
		orderBy: [{ building: { name: 'asc' } }, { number: 'asc' }],
	});
}

/**
 * Get events for a specific room on a specific day
 */
export async function getRoomEvents(
	roomId: number,
	day: string
): Promise<Array<Omit<Event, 'room'>>> {
	return await db.events.findMany({
		where: {
			roomId: roomId,
			days: {
				contains: `"${day}"`,
			},
		},
		orderBy: {
			startTime: 'asc',
		},
	});
}

/**
 * Check if a room is available at a specific time
 */
export async function isRoomAvailable(roomId: number, time: string, day: string): Promise<boolean> {
	const events = await getRoomEvents(roomId, day);

	for (const event of events) {
		if (event.startTime <= time && event.endTime > time) {
			return false; // Room is occupied
		}
	}

	return true; // Room is available
}

/**
 * Get available rooms at a specific time
 */
export async function getAvailableRooms(
	time: string,
	day: string,
	buildingName?: string
): Promise<Array<RoomAvailabilityResult>> {
	const allRooms = await getAllRooms();
	const availableRooms: Array<RoomAvailabilityResult> = [];

	for (const room of allRooms) {
		// Skip if building filter is specified and doesn't match
		if (buildingName && room.building.name !== buildingName) {
			continue;
		}

		const isAvailable = await isRoomAvailable(room.id, time, day);
		if (isAvailable) {
			availableRooms.push({
				roomNumber: room.number,
				buildingName: room.building.name,
			});
		}
	}

	return availableRooms.toSorted((a, b) => {
		if (a.buildingName !== b.buildingName) {
			return a.buildingName.localeCompare(b.buildingName);
		}
		return a.roomNumber.localeCompare(b.roomNumber);
	});
}

/**
 * Parse days array from JSON string
 */
export function parseDays(daysJson: string): Array<string> {
	try {
		const parsed = JSON.parse(daysJson) as Array<string>;
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/**
 * Format days array to JSON string
 */
export function formatDays(days: Array<string>): string {
	return JSON.stringify(days);
}

/**
 * Validate time format (HH:MM:SS)
 */
export function isValidTimeFormat(time: string): boolean {
	return /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/.test(time);
}

/**
 * Get current time in HH:MM:SS format
 */
export function getCurrentTime(): string {
	return new Date().toTimeString().slice(0, 8);
}

/**
 * Get current day abbreviation
 */
export function getCurrentDay(): string {
	const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
	return days[new Date().getDay()] ?? '';
}
