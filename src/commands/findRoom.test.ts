import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { EmbedBuilder } from 'discord.js';

import { findRoom, convertTo12Hour } from './findRoom.js';

// Mock the API module
vi.mock('../roomFinder/api.js', () => ({
	searchNow: vi.fn(() => Promise.resolve({ Rooms: [] })),
	searchAt: vi.fn(() => Promise.resolve({ Rooms: [] })),
	searchBetween: vi.fn(() => Promise.resolve({ Rooms: [] })),
	searchWhen: vi.fn(() =>
		Promise.resolve({
			isInUse: false,
			busySince: '',
			busyUntil: '',
		})
	),
}));

// Mock the logger
vi.mock('../logger.js', () => ({
	error: vi.fn(),
}));

import { searchNow, searchAt, searchBetween, searchWhen } from '../roomFinder/api.js';

describe('findRoom command', () => {
	const mockReply = vi.fn<TextInputCommandContext['reply']>();
	const mockGetString = vi.fn<TextInputCommandContext['options']['getString']>();
	const mockGetSubcommand = vi.fn<TextInputCommandContext['options']['getSubcommand']>();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			options: {
				getString: mockGetString,
				getSubcommand: mockGetSubcommand,
			},
		} as unknown as TextInputCommandContext;

		vi.clearAllMocks();
	});

	describe('convertTo12Hour', () => {
		test('converts morning time correctly', () => {
			expect(convertTo12Hour('09:30:00')).toBe('9:30 AM');
		});

		test('converts afternoon time correctly', () => {
			expect(convertTo12Hour('14:30:00')).toBe('2:30 PM');
		});

		test('converts midnight correctly', () => {
			expect(convertTo12Hour('00:00:00')).toBe('12:00 AM');
		});

		test('converts noon correctly', () => {
			expect(convertTo12Hour('12:00:00')).toBe('12:00 PM');
		});

		test('returns ERR for invalid time', () => {
			expect(convertTo12Hour('invalid')).toBe('ERR');
		});
	});

	describe('now subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('now');
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				return null;
			});
		});

		test('shows available rooms', async () => {
			vi.mocked(searchNow).mockResolvedValue({
				Rooms: [
					['TMCB', '350'],
					['TMCB', '360'],
				],
			});

			await findRoom.execute(context);

			expect(searchNow).toHaveBeenCalledWith('TMCB');
			expect(mockReply).toHaveBeenCalledOnce();

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('Rooms available now');
			expect(embed.data.description).toContain('350');
			expect(embed.data.description).toContain('360');
		});

		test('shows no rooms available message', async () => {
			vi.mocked(searchNow).mockResolvedValue({ Rooms: [] });

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('No rooms available');
			expect(embed.data.color).toBe(0xff_00_00); // Red
		});

		test('uses "anywhere on campus" when building is ANY', async () => {
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'ANY';
				return null;
			});
			vi.mocked(searchNow).mockResolvedValue({ Rooms: [] });

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('anywhere on campus');
		});
	});

	describe('at subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('at');
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				if (name === 'start_time') return '14:00:00';
				if (name === 'day1') return 'Mon';
				return null;
			});
		});

		test('shows available rooms at specific time', async () => {
			vi.mocked(searchAt).mockResolvedValue({
				Rooms: [['TMCB', '350']],
			});

			await findRoom.execute(context);

			expect(searchAt).toHaveBeenCalledWith('TMCB', '14:00:00', ['Mon']);
			expect(mockReply).toHaveBeenCalledOnce();

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('2:00 PM');
			expect(embed.data.description).toContain('Mon');
		});

		test('handles multiple days', async () => {
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				if (name === 'start_time') return '14:00:00';
				if (name === 'day1') return 'Mon';
				if (name === 'day2') return 'Wed';
				return null;
			});
			vi.mocked(searchAt).mockResolvedValue({ Rooms: [] });

			await findRoom.execute(context);

			expect(searchAt).toHaveBeenCalledWith('TMCB', '14:00:00', ['Mon', 'Wed']);
		});
	});

	describe('between subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('between');
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				if (name === 'start_time') return '14:00:00';
				if (name === 'end_time') return '16:00:00';
				return null;
			});
		});

		test('shows available rooms in time range', async () => {
			vi.mocked(searchBetween).mockResolvedValue({
				Rooms: [['TMCB', '350']],
			});

			await findRoom.execute(context);

			expect(searchBetween).toHaveBeenCalledWith('TMCB', '14:00:00', '16:00:00', []);
			expect(mockReply).toHaveBeenCalledOnce();

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('2:00 PM');
			expect(embed.data.title).toContain('4:00 PM');
		});
	});

	describe('when subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('when');
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				if (name === 'room') return '350';
				return null;
			});
		});

		test('shows room is currently busy', async () => {
			vi.mocked(searchWhen).mockResolvedValue({
				isInUse: true,
				busySince: '2025-01-20T14:00:00',
				busyUntil: '2025-01-20T15:00:00',
			});

			await findRoom.execute(context);

			expect(searchWhen).toHaveBeenCalledWith('TMCB', '350');
			expect(mockReply).toHaveBeenCalledOnce();

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toContain('Room 350 in the TMCB');
			expect(embed.data.description).toContain('currently busy');
			expect(embed.data.color).toBe(0xff_00_00); // Red
		});

		test('shows room is currently free', async () => {
			vi.mocked(searchWhen).mockResolvedValue({
				isInUse: false,
				busySince: '2025-01-20T15:00:00',
				busyUntil: '2025-01-20T16:00:00',
			});

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.description).toContain('currently free');
			expect(embed.data.color).toBe(0x00_ff_00); // Green
		});

		test('shows no information available', async () => {
			vi.mocked(searchWhen).mockResolvedValue({
				isInUse: false,
				busySince: '',
				busyUntil: '',
			});

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.description).toContain("couldn't find any information");
		});

		test('includes room image thumbnail', async () => {
			vi.mocked(searchWhen).mockResolvedValue({
				isInUse: false,
				busySince: '',
				busyUntil: '',
			});

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.thumbnail?.url).toContain('TMCB/350');
		});
	});

	describe('error handling', () => {
		test('handles API errors gracefully', async () => {
			mockGetSubcommand.mockReturnValue('now');
			mockGetString.mockImplementation(name => {
				if (name === 'building') return 'TMCB';
				return null;
			});
			vi.mocked(searchNow).mockRejectedValue(new Error('API Error'));

			await findRoom.execute(context);

			const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
			const embed = call[0].embeds[0];
			expect(embed.data.title).toBe('Error');
			expect(embed.data.description).toContain('API Error');
			expect(embed.data.color).toBe(0xff_00_00);
		});
	});

	test('command has correct metadata', () => {
		expect(findRoom.info.name).toBe('findroom');
		expect(findRoom.requiresGuild).toBe(false);
	});
});
