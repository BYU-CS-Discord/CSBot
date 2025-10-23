/**
 * BYU Room Finder Scraper
 * 
 * Scrapes class schedule data from BYU's class schedule system and populates the database.
 * Port of the Python scraper from Roomfinder-SQLite.
 * 
 * USAGE:
 * - Via Discord: /scraperooms <year_term>
 * - Via code: scrapeRoomData('20251')
 * - Via cron: Schedule scrapeRoomData() to run automatically
 * 
 * YEAR_TERM format: YYYYT where T is term (1=Winter, 3=Spring, 4=Summer, 5=Fall)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from '../database/index.js';
import { error as logError, info as logInfo } from '../logger.js';

const COLUMNS = {
	course: 0,
	class_period: 7,
	days: 8,
};

// Scraper status tracking
let isScraperRunning = false;
let currentScrapeYearTerm: string | null = null;
let scrapeStartTime: Date | null = null;
const recentLogs: string[] = [];
const MAX_LOG_BUFFER = 10;

const TIME_FORMAT = /(\d{1,2}):(\d{2})(am|pm)/i;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds (BYU's server can be slow)

interface ClassInfo {
	name: string;
	start: { hours: number; minutes: number; seconds: number };
	end: { hours: number; minutes: number; seconds: number };
	days: string[];
}

interface RoomInfo {
	description: string;
	capacity: number;
	classes: ClassInfo[];
}

interface ScraperProgress {
	buildings: number;
	rooms: number;
	events: number;
	currentBuilding?: string;
}

/**
 * Helper function to add a log to the buffer
 */
function addLog(message: string): void {
	const timestamp = new Date().toLocaleTimeString();
	const logEntry = `[${timestamp}] ${message}`;
	recentLogs.push(logEntry);
	if (recentLogs.length > MAX_LOG_BUFFER) {
		recentLogs.shift(); // Remove oldest log
	}
}

/**
 * Check if a scrape is currently running
 */
export function isScraperActive(): boolean {
	return isScraperRunning;
}

/**
 * Get current scraper status
 */
export function getScraperStatus(): {
	isRunning: boolean;
	yearTerm: string | null;
	startTime: Date | null;
	recentLogs: string[];
} {
	return {
		isRunning: isScraperRunning,
		yearTerm: currentScrapeYearTerm,
		startTime: scrapeStartTime,
		recentLogs: [...recentLogs],
	};
}

/**
 * Determines the current semester automatically
 */
export function getCurrentYearTerm(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // 0-indexed

	let term: number;
	if (month >= 1 && month <= 4) {
		term = 1; // Winter
	} else if (month >= 5 && month <= 6) {
		term = 3; // Spring
	} else if (month >= 7 && month <= 8) {
		term = 4; // Summer
	} else {
		term = 5; // Fall
	}

	return `${year}${term}`;
}

/**
 * Sleep for a specified number of milliseconds
 */
async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	context: string,
	retries: number = MAX_RETRIES
): Promise<T> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err as Error;

			// Check if it's a network error that's worth retrying
			const isRetryable =
				err && typeof err === 'object' &&
				('code' in err && (
					err.code === 'ECONNRESET' ||
					err.code === 'ETIMEDOUT' ||
					err.code === 'ECONNREFUSED' ||
					err.code === 'ENOTFOUND'
				));

			if (!isRetryable || attempt === retries) {
				// Not retryable or out of retries
				throw err;
			}

			// Calculate backoff delay: 1s, 2s, 4s
			const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
			logInfo(`${context} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`);
			addLog(`Retry ${attempt + 1}/${retries + 1} for ${context} after ${delay}ms`);

			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Opens cached file or downloads it if not found
 */
async function openOrDownloadFile(
	yearTerm: string,
	filename: string,
	fetchFn: () => Promise<string>
): Promise<string> {
	const cacheDir = path.join(process.cwd(), 'scraper', 'out', yearTerm);
	const cachePath = path.join(cacheDir, filename);

	try {
		const html = await fs.readFile(cachePath, 'utf-8');
		return html;
	} catch (err) {
		// File doesn't exist, download it with retry logic
		logInfo(`Downloading ${filename}...`);

		const html = await retryWithBackoff(
			fetchFn,
			`Download ${filename}`
		);

		// Create cache directory
		await fs.mkdir(cacheDir, { recursive: true });

		// Save to cache
		await fs.writeFile(cachePath, html, 'utf-8');

		// Sleep to avoid overwhelming the server
		await sleep(150);

		return html;
	}
}

/**
 * Parses time string like "10:00am" or "2:30pm" to hours/minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number; seconds: number } {
	const match = timeStr.match(TIME_FORMAT);
	if (!match) {
		logError(`Failed to parse time: ${timeStr}`);
		return { hours: 1, minutes: 0, seconds: 0 };
	}

	let hours = parseInt(match[1]!, 10);
	const minutes = parseInt(match[2]!, 10);
	const period = match[3]!.toLowerCase();

	// Convert to 24-hour format
	if (period === 'pm' && hours !== 12) {
		hours += 12;
	} else if (period === 'am' && hours === 12) {
		hours = 0;
	}

	return { hours, minutes, seconds: 0 };
}

/**
 * Formats time object to "HH:MM:SS" string
 */
function formatTime(time: { hours: number; minutes: number; seconds: number }): string {
	const h = String(time.hours).padStart(2, '0');
	const m = String(time.minutes).padStart(2, '0');
	const s = String(time.seconds).padStart(2, '0');
	return `${h}:${m}:${s}`;
}

/**
 * Extracts class information from a table row
 */
function getClassInfo($: cheerio.Root, row: cheerio.Element): ClassInfo {
	const cells = $(row).find('td');

	let start: { hours: number; minutes: number; seconds: number };
	let end: { hours: number; minutes: number; seconds: number };

	try {
		const timePeriod = $(cells[COLUMNS.class_period])
			.text()
			.trim()
			.replace(/a/gi, 'am')  // Replace ALL 'a' with 'am' (global)
			.replace(/p/gi, 'pm'); // Replace ALL 'p' with 'pm' (global)

		const [startStr, endStr] = timePeriod.split(' - ');

		if (!startStr || !endStr) {
			throw new Error('Invalid time format');
		}

		start = parseTime(startStr);
		end = parseTime(endStr);
	} catch (err) {
		logError(`Error parsing time: ${err}`);
		start = { hours: 1, minutes: 0, seconds: 0 };
		end = { hours: 1, minutes: 0, seconds: 0 };
	}

	const daysText = $(cells[COLUMNS.days]).text().trim();

	// Parse days - handle "Daily" or specific days like "MWF" or "T Th"
	let days: string[];
	if (daysText === 'Daily') {
		days = ['M', 'T', 'W', 'Th', 'F'];
	} else {
		// Match: Th, Sa, Su, M, T, W, F (in that order to match Th before T)
		const matches = daysText.match(/Th|Sa|Su|M|T|W|F/g);
		days = matches || [];
	}

	return {
		name: $(cells[COLUMNS.course]).text().trim(),
		start,
		end,
		days,
	};
}

/**
 * Fetches and parses room information
 */
async function getRoomInfo(yearTerm: string, building: string, room: string): Promise<RoomInfo> {
	const html = await openOrDownloadFile(
		yearTerm,
		`${building}-${room}.html`,
		async () => {
			const response = await axios.post(
				'https://y.byu.edu/class_schedule/cgi/classRoom2.cgi',
				new URLSearchParams({
					year_term: yearTerm,
					building: building,
					room: room,
				}),
				{ timeout: REQUEST_TIMEOUT }
			);
			return response.data;
		}
	);

	const $ = cheerio.load(html);

	const description = $('input[name="room_desc"]').val() as string || 'UNKNOWN';
	const capacityStr = $('input[name="capacity"]').val() as string || '0';
	const capacity = parseInt(capacityStr, 10) || 0;

	const classes: ClassInfo[] = [];

	// Find the schedule table (contains "Instructor" header)
	const scheduleHeader = $('th:contains("Instructor")');
	if (scheduleHeader.length > 0) {
		const table = scheduleHeader.closest('table');
		const rows = table.find('tr').slice(1); // Skip header row

		rows.each((_: number, row: cheerio.Element) => {
			classes.push(getClassInfo($, row));
		});
	}

	return {
		description,
		capacity,
		classes,
	};
}

/**
 * Fetches room list for a building
 */
async function* getBuildingsRooms(
	yearTerm: string,
	buildings: string[]
): AsyncGenerator<[string, string[]]> {
	for (const building of buildings) {
		const html = await openOrDownloadFile(
			yearTerm,
			`${building}-list.html`,
			async () => {
				const response = await axios.post(
					'https://y.byu.edu/class_schedule/cgi/classRoom2.cgi',
					new URLSearchParams({
						e: '@loadRooms',
						year_term: yearTerm,
						building: building,
					}),
					{ timeout: REQUEST_TIMEOUT }
				);
				return response.data;
			}
		);

		const $ = cheerio.load(html);
		const rooms = $('table a')
			.map((_: number, el: cheerio.Element) => $(el).text())
			.get();

		yield [building, rooms];
	}
}

/**
 * Main scraper function
 */
export async function scrapeRoomData(
	yearTerm?: string,
	onProgress?: (progress: ScraperProgress) => void
): Promise<ScraperProgress> {
	const term = yearTerm || getCurrentYearTerm();

	// Check if scraper is already running
	if (isScraperRunning) {
		throw new Error(`Scraper is already running for year_term: ${currentScrapeYearTerm}`);
	}

	// Set running status
	isScraperRunning = true;
	currentScrapeYearTerm = term;
	scrapeStartTime = new Date();
	recentLogs.length = 0; // Clear old logs

	logInfo(`Starting scrape for year_term: ${term}`);
	addLog(`Starting scrape for ${term}`);

	const progress: ScraperProgress = {
		buildings: 0,
		rooms: 0,
		events: 0,
	};

	try {
		// Create cache directory
		const cacheDir = path.join(process.cwd(), 'scraper', 'out', term);
		await fs.mkdir(cacheDir, { recursive: true });

		// Clear existing data
		logInfo('Clearing existing data...');
		addLog('Clearing existing database data...');
		await db.events.deleteMany({});
		await db.rooms.deleteMany({});
		await db.buildings.deleteMany({});

		// Fetch building list from main page
		logInfo('Fetching building list...');
		addLog('Fetching building list from BYU...');
		const indexHtml = await openOrDownloadFile(
			term,
			'classRoom2.cgi',
			async () => {
				const response = await axios.post(
					'https://y.byu.edu/class_schedule/cgi/classRoom2.cgi',
					new URLSearchParams({ year_term: term }),
					{ timeout: REQUEST_TIMEOUT }
				);
				return response.data;
			}
		);

		const $ = cheerio.load(indexHtml);
		const buildings = $('select[name="Building"] option')
			.map((_: number, el: cheerio.Element) => $(el).val() as string)
			.get()
			.filter((val: string) => val && val.trim()); // Remove empty values

		logInfo(`Found ${buildings.length} buildings`);
		addLog(`Found ${buildings.length} buildings to process`);

		// Iterate through buildings and rooms
		for await (const [building, rooms] of getBuildingsRooms(term, buildings)) {
			progress.currentBuilding = building;
			logInfo(`Processing building: ${building} (${rooms.length} rooms)`);
			addLog(`Processing ${building} (${rooms.length} rooms)`);

			// Insert building
			const buildingRecord = await db.buildings.create({
				data: { name: building },
			});
			progress.buildings++;

			for (const room of rooms) {
				const roomInfo = await getRoomInfo(term, building, room);

				// Insert room
				const roomRecord = await db.rooms.create({
					data: {
						buildingId: buildingRecord.id,
						number: room,
						description: roomInfo.description,
					},
				});
				progress.rooms++;

				// Insert events/classes
				for (const classInfo of roomInfo.classes) {
					await db.events.create({
						data: {
							roomId: roomRecord.id,
							name: classInfo.name,
							days: JSON.stringify(classInfo.days),
							startTime: formatTime(classInfo.start),
							endTime: formatTime(classInfo.end),
						},
					});
					progress.events++;

					if (progress.events % 100 === 0) {
						logInfo(`  Processed ${progress.events} events...`);
					}
				}
			}

			if (onProgress) {
				onProgress(progress);
			}
		}

		logInfo(`Scrape complete! Buildings: ${progress.buildings}, Rooms: ${progress.rooms}, Events: ${progress.events}`);
		addLog(`✅ Complete! ${progress.buildings} buildings, ${progress.rooms} rooms, ${progress.events} events`);

		return progress;

	} catch (err) {
		logError('Scraper error:');
		logError(err);
		addLog(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		throw err;
	} finally {
		// Always clear running status when done
		isScraperRunning = false;
		currentScrapeYearTerm = null;
		scrapeStartTime = null;
	}
}

/**
 * Validates year_term format (YYYYT where T is 1, 3, 4, or 5)
 */
export function isValidYearTerm(yearTerm: string): boolean {
	return /^\d{4}[1345]$/.test(yearTerm);
}
