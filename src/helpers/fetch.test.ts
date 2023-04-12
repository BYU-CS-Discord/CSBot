import type { Response } from 'undici';
import { fetch } from './fetch';
import { fetch as _fetch } from 'undici';
import { HttpStatusCode } from './HttpStatusCode';
import { NetworkError } from './NetworkError';
import { string, type as schema, StructError } from 'superstruct';
import { URL } from 'node:url';

jest.mock('undici', () => ({ fetch: jest.fn() }));

const mockUndici = _fetch as jest.Mock<ReturnType<typeof _fetch>, Parameters<typeof _fetch>>;

describe('fetch', () => {
	const url = new URL('https://example.com');
	const struct = schema({
		foo: string(),
	});

	beforeEach(() => {
		mockUndici.mockRejectedValue(new Error('This is a test'));
	});

	test('returns well-formed data with 200 response', async () => {
		const res = { foo: 'bar' };
		mockUndici.mockResolvedValueOnce({
			status: HttpStatusCode.OK,
			statusText: '',
			json: () => Promise.resolve(res),
		} as unknown as Response);

		const data = await fetch(url, struct);
		expect(mockUndici).toHaveBeenCalledOnceWith(url);
		expect(data).toStrictEqual(res);
	});

	test('throws a NetworkError with non-200 response', async () => {
		mockUndici.mockResolvedValueOnce({
			status: HttpStatusCode.BAD_REQUEST,
			statusText: '',
			json: () => Promise.reject(new Error('bad')),
		} as unknown as Response);

		await expect(() => fetch(url, struct)).rejects.toStrictEqual(
			new NetworkError(HttpStatusCode.BAD_REQUEST)
		);
		expect(mockUndici).toHaveBeenCalledOnceWith(url);
	});

	test('throws a StructError with malformed data', async () => {
		const res = { foo: 42, bar: 'baz' };
		mockUndici.mockResolvedValueOnce({
			status: HttpStatusCode.OK,
			statusText: '',
			json: () => Promise.resolve(res),
		} as unknown as Response);

		await expect(() => fetch(url, struct)).rejects.toThrow(StructError);
		expect(mockUndici).toHaveBeenCalledOnceWith(url);
	});
});
