import type { HttpStatusCode } from './HttpStatusCode.js';
import { describeCode } from './HttpStatusCode.js';

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
