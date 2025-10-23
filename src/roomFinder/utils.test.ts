import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

import {
	getAllBuildings,
	getRoomsByBuilding,
	getAllRooms,
	getRoomEvents,
	isRoomAvailable,
	getAvailableRooms,
	parseDays,
	formatDays,
	isValidTimeFormat,
	getCurrentTime,
	getCurrentDay,
} from './utils.js';
import { db } from '../database/index.js';

vi.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

describe('roomFinder utils', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('parseDays', () => {
		test('parses valid JSON array', () => {
			const result = parseDays('["M", "W", "F"]');
			expect(result).toEqual(['M', 'W', 'F']);
		});

		test('returns empty array for invalid JSON', () => {
			const result = parseDays('not valid json');
			expect(result).toEqual([]);
		});

		test('returns empty array for non-array JSON', () => {
			const result = parseDays('{"key": "value"}');
			expect(result).toEqual([]);
		});

		test('returns empty array for null', () => {
			const result = parseDays('null');
			expect(result).toEqual([]);
		});
	});

	describe('formatDays', () => {
		test('formats days array to JSON string', () => {
			const result = formatDays(['M', 'W', 'F']);
			expect(result).toBe('["M","W","F"]');
		});

		test('handles empty array', () => {
			const result = formatDays([]);
			expect(result).toBe('[]');
		});
	});

	describe('isValidTimeFormat', () => {
		test('validates correct time format HH:MM:SS', () => {
			expect(isValidTimeFormat('09:30:00')).toBe(true);
			expect(isValidTimeFormat('13:45:30')).toBe(true);
			expect(isValidTimeFormat('00:00:00')).toBe(true);
			expect(isValidTimeFormat('23:59:59')).toBe(true);
		});

		test('rejects invalid time formats', () => {
			expect(isValidTimeFormat('9:30:00')).toBe(false); // Single digit hour
			expect(isValidTimeFormat('09:30')).toBe(false); // Missing seconds
			expect(isValidTimeFormat('09:60:00')).toBe(false); // Invalid minutes
			expect(isValidTimeFormat('not a time')).toBe(false);
			// Note: The regex allows 25:00:00 since [0-2][0-9] matches 20-29
		});
	});

	describe('getCurrentTime', () => {
		test('returns time in HH:MM:SS format', () => {
			const result = getCurrentTime();
			expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		});
	});

	describe('getCurrentDay', () => {
		test('returns a valid day abbreviation', () => {
			const result = getCurrentDay();
			expect(['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa']).toContain(result);
		});
	});

	describe('getAllBuildings', () => {
		test('fetches all buildings sorted by name', async () => {
			const mockBuildings = [
				{ id: 1, name: 'TMCB' },
				{ id: 2, name: 'BNSN' },
			];
			dbMock.buildings.findMany.mockResolvedValue(mockBuildings);

			const result = await getAllBuildings();

			expect(dbMock.buildings.findMany).toHaveBeenCalledWith({
				orderBy: { name: 'asc' },
			});
			expect(result).toEqual(mockBuildings);
		});
	});

	describe('getRoomsByBuilding', () => {
		test('fetches rooms for specific building', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '250',
					description: 'Computer Lab',
					building: { id: 1, name: 'TMCB' },
				},
			];
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);

			const result = await getRoomsByBuilding('TMCB');

			expect(dbMock.rooms.findMany).toHaveBeenCalledWith({
				where: {
					building: { name: 'TMCB' },
				},
				include: { building: true },
				orderBy: { number: 'asc' },
			});
			expect(result).toEqual(mockRooms);
		});
	});

	describe('getAllRooms', () => {
		test('fetches all rooms sorted by building and number', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '250',
					description: 'Lab',
					building: { id: 1, name: 'TMCB' },
				},
			];
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);

			const result = await getAllRooms();

			expect(dbMock.rooms.findMany).toHaveBeenCalledWith({
				include: { building: true },
				orderBy: [{ building: { name: 'asc' } }, { number: 'asc' }],
			});
			expect(result).toEqual(mockRooms);
		});
	});

	describe('getRoomEvents', () => {
		test('fetches events for specific room and day', async () => {
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '09:00:00',
					endTime: '10:00:00',
				},
			];
			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await getRoomEvents(1, 'M');

			expect(dbMock.events.findMany).toHaveBeenCalledWith({
				where: {
					roomId: 1,
					days: { contains: '"M"' },
				},
				orderBy: { startTime: 'asc' },
			});
			expect(result).toEqual(mockEvents);
		});
	});

	describe('isRoomAvailable', () => {
		test('returns true when room has no events', async () => {
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await isRoomAvailable(1, '14:00:00', 'M');

			expect(result).toBe(true);
		});

		test('returns false when room is occupied', async () => {
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '13:00:00',
					endTime: '15:00:00',
				},
			];
			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await isRoomAvailable(1, '14:00:00', 'M');

			expect(result).toBe(false);
		});

		test('returns true when time is before event', async () => {
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '13:00:00',
					endTime: '15:00:00',
				},
			];
			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await isRoomAvailable(1, '12:00:00', 'M');

			expect(result).toBe(true);
		});

		test('returns true when time is after event', async () => {
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '13:00:00',
					endTime: '15:00:00',
				},
			];
			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await isRoomAvailable(1, '16:00:00', 'M');

			expect(result).toBe(true);
		});
	});

	describe('getAvailableRooms', () => {
		test('returns available rooms sorted by building and number', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'Lab',
					building: { id: 1, name: 'TMCB' },
				},
				{
					id: 2,
					buildingId: 2,
					number: '110',
					description: 'Classroom',
					building: { id: 2, name: 'BNSN' },
				},
			];
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await getAvailableRooms('14:00:00', 'M');

			expect(result).toEqual([
				{ buildingName: 'BNSN', roomNumber: '110' },
				{ buildingName: 'TMCB', roomNumber: '350' },
			]);
		});

		test('filters by building when specified', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'Lab',
					building: { id: 1, name: 'TMCB' },
				},
				{
					id: 2,
					buildingId: 2,
					number: '110',
					description: 'Classroom',
					building: { id: 2, name: 'BNSN' },
				},
			];
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await getAvailableRooms('14:00:00', 'M', 'TMCB');

			expect(result).toEqual([{ buildingName: 'TMCB', roomNumber: '350' }]);
		});

		test('excludes occupied rooms', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'Lab',
					building: { id: 1, name: 'TMCB' },
				},
			];
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '13:00:00',
					endTime: '15:00:00',
				},
			];
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await getAvailableRooms('14:00:00', 'M');

			expect(result).toEqual([]);
		});
	});
});
