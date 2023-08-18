import { fetchJson } from './fetch';
import { HttpStatusCode } from './HttpStatusCode';
import { NetworkError } from './NetworkError';
import { string, type as schema, StructError } from 'superstruct';
import { URL } from 'node:url';

const mockFetch = jest.spyOn(global, 'fetch');

describe('fetchJson', () => {
	const url = new URL('https://example.com');
	const struct = schema({
		foo: string(),
	});

	beforeEach(() => {
		mockFetch.mockRejectedValue(new Error('This is a test'));
	});

	test('returns well-formed data with 200 response', async () => {
		const res = { foo: 'bar' };
		mockFetch.mockResolvedValueOnce({
			status: HttpStatusCode.OK,
			statusText: '',
			json: () => Promise.resolve(res),
		} as unknown as Response);

		const data = await fetchJson(url, struct);
		expect(mockFetch).toHaveBeenCalledOnceWith(url);
		expect(data).toStrictEqual(res);
	});

	test('throws a NetworkError with non-200 response', async () => {
		mockFetch.mockResolvedValueOnce({
			status: HttpStatusCode.BAD_REQUEST,
			statusText: '',
			json: () => Promise.reject(new Error('bad')),
		} as unknown as Response);

		await expect(() => fetchJson(url, struct)).rejects.toStrictEqual(
			new NetworkError(HttpStatusCode.BAD_REQUEST)
		);
		expect(mockFetch).toHaveBeenCalledOnceWith(url);
	});

	test('throws a StructError with malformed data', async () => {
		const res = { foo: 42, bar: 'baz' };
		mockFetch.mockResolvedValueOnce({
			status: HttpStatusCode.OK,
			statusText: '',
			json: () => Promise.resolve(res),
		} as unknown as Response);

		await expect(() => fetchJson(url, struct)).rejects.toThrow(StructError);
		expect(mockFetch).toHaveBeenCalledOnceWith(url);
	});
});
