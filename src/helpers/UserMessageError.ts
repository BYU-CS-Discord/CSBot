/**
 * UserMessageErrors should be thrown when an error is caused by some action
 * a user took and that user should be informed with a specific message.
 * While most errors are sanitized to prevent information leakage,
 * UserMessageErrors simply show the message argument to the user.
 */
export class UserMessageError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'UserMessageError';
	}
}
