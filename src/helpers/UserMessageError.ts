export class UserMessageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserMessageError';
	}
}
