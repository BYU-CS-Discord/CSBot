import { describe, expect, test, vi } from 'vitest';

vi.mock('../constants/meta.js', async () => {
	const { repo } =
		await vi.importActual<typeof import('../constants/meta.js')>('../constants/meta.js');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

import { convertTo12Hour } from './findRoom.js';

describe('findRoom', () => {
	test('convertTo12Hour 8AM', () => {
		const time = '08:00:00';
		const result = convertTo12Hour(time);
		expect(result).toEqual('8:00 AM');
	});

	test('convertTo12Hour 8PM', () => {
		const time = '20:00:00';
		const result = convertTo12Hour(time);
		expect(result).toEqual('8:00 PM');
	});

	test('convertTo12Hour Truncate', () => {
		const time = '12:34:56';
		const result = convertTo12Hour(time);
		expect(result).toEqual('12:34 PM');
	});

	test('convertTo12Hour Err', () => {
		const time = '12:34';
		const result = convertTo12Hour(time);
		expect(result).toEqual('ERR');
	});
});
