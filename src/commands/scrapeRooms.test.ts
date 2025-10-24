import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { EmbedBuilder } from 'discord.js';

import { scrapeRooms } from './scrapeRooms.js';

// Mock the scraper module
vi.mock('../roomFinder/scraper.js', () => ({
	getCurrentYearTerm: vi.fn(() => '20251'),
	isValidYearTerm: vi.fn((term: string) => /^\d{4}[1345]$/.test(term)),
	getScraperStatus: vi.fn(() => ({
		isRunning: false,
		yearTerm: null,
		startTime: null,
		recentLogs: [],
	})),
	scrapeRoomData: vi.fn(() =>
		Promise.resolve({
			buildings: 25,
			rooms: 2847,
			events: 18_392,
		})
	),
}));

// Mock the logger
vi.mock('../logger.js', () => ({
	info: vi.fn(),
	error: vi.fn(),
}));

import { getCurrentYearTerm, getScraperStatus, scrapeRoomData } from '../roomFinder/scraper.js';

describe('scrapeRooms command', () => {
	const mockReplyPrivately = vi.fn<TextInputCommandContext['replyPrivately']>();
	const mockGetString = vi.fn<TextInputCommandContext['options']['getString']>();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			replyPrivately: mockReplyPrivately,
			options: {
				getString: mockGetString,
			},
		} as unknown as TextInputCommandContext;

		mockGetString.mockReturnValue(null);
		vi.mocked(getScraperStatus).mockReturnValue({
			isRunning: false,
			yearTerm: null,
			startTime: null,
			recentLogs: [],
		});

		vi.clearAllMocks();
	});

	test('starts scraper with current term when no term provided', async () => {
		await scrapeRooms.execute(context);

		expect(getCurrentYearTerm).toHaveBeenCalled();
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(scrapeRoomData).toHaveBeenCalledWith('20251', expect.any(Function));

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.title).toContain('Room Scraper Started');
		expect(embed.data.description).toContain('20251');
	});

	test('starts scraper with specified term', async () => {
		mockGetString.mockReturnValue('20253');

		await scrapeRooms.execute(context);

		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(scrapeRoomData).toHaveBeenCalledWith('20253', expect.any(Function));

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.description).toContain('20253');
	});

	test('shows warning when scraper is already running', async () => {
		vi.mocked(getScraperStatus).mockReturnValue({
			isRunning: true,
			yearTerm: '20251',
			startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
			recentLogs: [
				'[7:00:00 PM] Starting scrape for 20251',
				'[7:01:00 PM] Processing TMCB (142 rooms)',
			],
		});

		await scrapeRooms.execute(context);

		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(scrapeRoomData).not.toHaveBeenCalled();

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.title).toContain('Scraper Already Running');
		expect(embed.data.description).toContain('20251');
		expect(embed.data.description).toContain('5 minutes');
		expect(embed.data.description).toContain('Processing TMCB');
	});

	test('shows error for invalid year/term format', async () => {
		mockGetString.mockReturnValue('invalid');

		await scrapeRooms.execute(context);

		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(scrapeRoomData).not.toHaveBeenCalled();

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.title).toContain('Invalid Year/Term');
		expect(embed.data.description).toContain('invalid');
		expect(embed.data.description).toContain('YYYYT');
	});

	test('shows error for year/term with invalid term number', async () => {
		mockGetString.mockReturnValue('20252'); // 2 is not a valid term

		await scrapeRooms.execute(context);

		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(scrapeRoomData).not.toHaveBeenCalled();

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.title).toContain('Invalid Year/Term');
	});

	test('handles scraper with no recent logs', async () => {
		vi.mocked(getScraperStatus).mockReturnValue({
			isRunning: true,
			yearTerm: '20251',
			startTime: new Date(),
			recentLogs: [],
		});

		await scrapeRooms.execute(context);

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.description).toContain('No recent logs available');
	});

	test('calculates elapsed time correctly', async () => {
		const startTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
		vi.mocked(getScraperStatus).mockReturnValue({
			isRunning: true,
			yearTerm: '20251',
			startTime,
			recentLogs: [],
		});

		await scrapeRooms.execute(context);

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.description).toContain('15 minutes');
	});

	test('handles null startTime gracefully', async () => {
		vi.mocked(getScraperStatus).mockReturnValue({
			isRunning: true,
			yearTerm: '20251',
			startTime: null,
			recentLogs: [],
		});

		await scrapeRooms.execute(context);

		const call = mockReplyPrivately.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.description).toContain('0 minutes');
	});

	test('command has correct metadata', () => {
		expect(scrapeRooms.info.name).toBe('scraperooms');
		expect(scrapeRooms.requiresGuild).toBe(false);
		expect(scrapeRooms.info.default_member_permissions).toBe('8'); // Administrator
	});
});
