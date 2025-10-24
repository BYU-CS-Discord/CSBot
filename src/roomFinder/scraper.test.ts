import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
	getCurrentYearTerm,
	isValidYearTerm,
	isScraperActive,
	getScraperStatus,
} from './scraper.js';

describe('roomFinder scraper utilities', () => {
	describe('getCurrentYearTerm', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		test('returns correct term for January (Winter)', () => {
			vi.setSystemTime(new Date('2025-01-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20251');
		});

		test('returns correct term for March (still Winter)', () => {
			vi.setSystemTime(new Date('2025-03-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20251'); // March is still Winter term
		});

		test('returns correct term for May (Spring)', () => {
			vi.setSystemTime(new Date('2025-05-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20253');
		});

		test('returns correct term for July (Summer)', () => {
			vi.setSystemTime(new Date('2025-07-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20254');
		});

		test('returns correct term for September (Fall)', () => {
			vi.setSystemTime(new Date('2025-09-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20255');
		});

		test('returns correct term for December (Fall)', () => {
			vi.setSystemTime(new Date('2025-12-15'));
			const result = getCurrentYearTerm();
			expect(result).toBe('20255');
		});
	});

	describe('isValidYearTerm', () => {
		test('accepts valid Winter term', () => {
			expect(isValidYearTerm('20251')).toBe(true);
		});

		test('accepts valid Spring term', () => {
			expect(isValidYearTerm('20253')).toBe(true);
		});

		test('accepts valid Summer term', () => {
			expect(isValidYearTerm('20254')).toBe(true);
		});

		test('accepts valid Fall term', () => {
			expect(isValidYearTerm('20255')).toBe(true);
		});

		test('rejects invalid term numbers', () => {
			expect(isValidYearTerm('20252')).toBe(false); // 2 is not valid
			expect(isValidYearTerm('20256')).toBe(false); // 6 is not valid
			expect(isValidYearTerm('20250')).toBe(false); // 0 is not valid
		});

		test('rejects invalid year formats', () => {
			expect(isValidYearTerm('251')).toBe(false); // Too short
			expect(isValidYearTerm('202551')).toBe(false); // Too long
			expect(isValidYearTerm('abcd1')).toBe(false); // Not numeric
		});

		test('rejects empty or invalid strings', () => {
			expect(isValidYearTerm('')).toBe(false);
			expect(isValidYearTerm('invalid')).toBe(false);
		});
	});

	describe('isScraperActive', () => {
		test('returns boolean', () => {
			const result = isScraperActive();
			expect(typeof result).toBe('boolean');
		});
	});

	describe('getScraperStatus', () => {
		test('returns status object with correct structure', () => {
			const status = getScraperStatus();

			expect(status).toHaveProperty('isRunning');
			expect(status).toHaveProperty('yearTerm');
			expect(status).toHaveProperty('startTime');
			expect(status).toHaveProperty('recentLogs');

			expect(typeof status.isRunning).toBe('boolean');
			expect(Array.isArray(status.recentLogs)).toBe(true);
		});

		test('returns correct types', () => {
			const status = getScraperStatus();

			if (status.yearTerm !== null) {
				expect(typeof status.yearTerm).toBe('string');
			}

			if (status.startTime !== null) {
				expect(status.startTime).toBeInstanceOf(Date);
			}
		});
	});
});
