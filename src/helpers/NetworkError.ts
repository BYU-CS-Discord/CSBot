import { describeCode, HttpStatusCode } from './HttpStatusCode.js';

/**
 * An object that represents an HTTP status returned from an API request.
 */
export class NetworkError extends Error {
	readonly code: HttpStatusCode;
	readonly statusText: string;

	constructor(code: HttpStatusCode) {
		const statusText = describeCode(code);
		super(`HTTP ${code}: ${statusText}`);
		this.code = code;
		this.statusText = statusText;
		this.name = 'NetworkError';
	}
}
