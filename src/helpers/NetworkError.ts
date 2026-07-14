import type { HttpStatusCode } from './HttpStatusCode.ts';
import { describeCode } from './HttpStatusCode.ts';

/**
 * An object that represents an HTTP status returned from an API request.
 */
export class NetworkError extends Error {
	public readonly code: HttpStatusCode;
	public readonly statusText: string;

	public constructor(code: HttpStatusCode) {
		const statusText = describeCode(code);
		super(`HTTP ${code}: ${statusText}`);
		this.code = code;
		this.statusText = statusText;
		this.name = 'NetworkError';
	}
}
