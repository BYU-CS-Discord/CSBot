import type { Message } from 'discord.js';

// Import the code to test
import { messageCreate } from './messageCreate';

describe('on(messageCreate)', () => {
	let message: Message;
	let mockReply: jest.Mock;

	beforeEach(() => {
		mockReply = jest.fn();

		message = {
			content: '',
			reply: mockReply,
		} as unknown as Message;
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('Does nothing if message does not contain a twitter link', async () => {
		message.content = 'Perfectly normal message';

		await expect(messageCreate.execute(message)).resolves.toBeUndefined();
		expect(mockReply).not.toHaveBeenCalled();
	});

	test('Replies with a warning if a message contains a twitter link', async () => {
		message.content = 'https://twitter.com/example';

		await expect(messageCreate.execute(message)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledTimes(1);
	});
});
