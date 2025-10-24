import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

import { lookup } from './search.js';
import { db } from '../database/index.js';

vi.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

describe('roomFinder search', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock current time to be consistent
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-01-20T14:00:00.000Z')); // Monday 2pm UTC
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('lookup - now', () => {
		test('returns available rooms right now', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'CLASSROOM',
					building: mockBuilding,
				},
			];

			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'now',
				days: [],
			});

			expect(result).toEqual([{ roomNumber: '350', buildingName: 'TMCB' }]);
		});

		test('excludes rooms with conflicting events', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '13:00:00',
					endTime: '15:00:00',
					room: { id: 1 },
				},
			];

			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.events.findMany.mockResolvedValue(mockEvents);
			// After finding conflicting events, the final query should exclude room 1
			dbMock.rooms.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'now',
				days: [],
			});

			expect(result).toEqual([]);
		});

		test('searches all buildings when building is ANY', async () => {
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'CLASSROOM',
					building: { id: 1, name: 'TMCB' },
				},
				{
					id: 2,
					buildingId: 2,
					number: '110',
					description: 'CLASSROOM',
					building: { id: 2, name: 'BNSN' },
				},
			];

			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'ANY',
				timeType: 'now',
				days: [],
			});

			expect(result.length).toBe(2);
			// Results are returned in database order, sorted by building and room
			expect(result).toContainEqual({ roomNumber: '110', buildingName: 'BNSN' });
			expect(result).toContainEqual({ roomNumber: '350', buildingName: 'TMCB' });
		});

		test('returns empty array when building not found', async () => {
			dbMock.buildings.findFirst.mockResolvedValue(null);

			const result = await lookup({
				building: 'INVALID',
				timeType: 'now',
				days: [],
			});

			expect(result).toEqual([]);
		});
	});

	describe('lookup - at', () => {
		test('returns available rooms at specific time', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'CLASSROOM',
					building: mockBuilding,
				},
			];

			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'at',
				timeA: '14:00:00',
				days: ['M', 'W'],
			});

			expect(result).toEqual([{ roomNumber: '350', buildingName: 'TMCB' }]);
		});

		test('returns empty array when no days specified', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.rooms.findMany.mockResolvedValue([]);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'at',
				timeA: '14:00:00',
				days: [],
			});

			expect(result).toEqual([]);
		});

		test('throws error when timeA is missing', async () => {
			await expect(
				lookup({
					building: 'TMCB',
					timeType: 'at',
					days: ['M'],
				})
			).rejects.toThrow('Valid timeA is required');
		});

		test('throws error when timeA is invalid format', async () => {
			await expect(
				lookup({
					building: 'TMCB',
					timeType: 'at',
					timeA: 'invalid',
					days: ['M'],
				})
			).rejects.toThrow('Valid timeA is required');
		});
	});

	describe('lookup - between', () => {
		test('returns available rooms in time range', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			const mockRooms = [
				{
					id: 1,
					buildingId: 1,
					number: '350',
					description: 'CLASSROOM',
					building: mockBuilding,
				},
			];

			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.rooms.findMany.mockResolvedValue(mockRooms);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'between',
				timeA: '14:00:00',
				timeB: '16:00:00',
				days: ['M', 'W', 'F'],
			});

			expect(result).toEqual([{ roomNumber: '350', buildingName: 'TMCB' }]);
		});

		test('returns empty array when no days specified', async () => {
			const mockBuilding = { id: 1, name: 'TMCB' };
			dbMock.buildings.findFirst.mockResolvedValue(mockBuilding);
			dbMock.rooms.findMany.mockResolvedValue([]);
			dbMock.events.findMany.mockResolvedValue([]);

			const result = await lookup({
				building: 'TMCB',
				timeType: 'between',
				timeA: '14:00:00',
				timeB: '16:00:00',
				days: [],
			});

			expect(result).toEqual([]);
		});

		test('throws error when timeA is missing', async () => {
			await expect(
				lookup({
					building: 'TMCB',
					timeType: 'between',
					timeB: '16:00:00',
					days: ['M'],
				})
			).rejects.toThrow('Valid timeA and timeB are required');
		});

		test('throws error when timeB is missing', async () => {
			await expect(
				lookup({
					building: 'TMCB',
					timeType: 'between',
					timeA: '14:00:00',
					days: ['M'],
				})
			).rejects.toThrow('Valid timeA and timeB are required');
		});
	});

	describe('lookup - when', () => {
		test('returns current events for specific room', async () => {
			const mockEvents = [
				{
					id: 1,
					roomId: 1,
					name: 'CS 224',
					days: '["M","W","F"]',
					startTime: '14:00:00',
					endTime: '15:00:00',
					room: {
						id: 1,
						number: '350',
						building: { id: 1, name: 'TMCB' },
					},
				},
			];

			dbMock.events.findMany.mockResolvedValue(mockEvents);

			const result = await lookup({
				building: 'TMCB',
				room: '350',
				timeType: 'when',
				days: [],
			});

			expect(result).toEqual([
				{
					name: 'CS 224',
					startTime: '14:00:00',
					endTime: '15:00:00',
				},
			]);
		});

		test('throws error when building is missing', async () => {
			await expect(
				lookup({
					room: '350',
					timeType: 'when',
					days: [],
				})
			).rejects.toThrow('Building and room are required');
		});

		test('throws error when room is missing', async () => {
			await expect(
				lookup({
					building: 'TMCB',
					timeType: 'when',
					days: [],
				})
			).rejects.toThrow('Building and room are required');
		});
	});
});
