import type { RequestInfo, RequestInit } from 'undici';
import type { Struct, StructError } from 'superstruct'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { assert } from 'superstruct';
import { HttpStatusCode } from './HttpStatusCode';
import { fetch as _fetch } from 'undici';
import { NetworkError } from './NetworkError';

/**
 * Performs a network request.
 *
 * @param input The URL to request.
 * @param struct A schema that describes the type data to expect back.
 * @param init Additional information about the request.
 *
 * @throws a {@link NetworkError} if the response status is not `OK`,
 * a {@link StructError} if the data does not match the given schema,
 * or some Undici error otherwise.
 * @returns A promise that resolves with the requested data.
 */
export async function fetch<T, S>(
	input: RequestInfo,
	struct: Struct<T, S>,
	init?: RequestInit
): Promise<T> {
	const res = await _fetch(input, init);

	const status = res.status;
	if (status !== HttpStatusCode.OK) {
		throw new NetworkError(status);
	}

	const data = await res.json();
	assert(data, struct);
	return data;
}
