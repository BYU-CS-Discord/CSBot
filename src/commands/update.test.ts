import type { User } from 'discord.js';
// Mock the logger so nothing is printed
jest.mock('../logger');

// Overwrite the exec function
const mockExec = jest.fn((command: string, callback: () => void) => {
	callback();
});
const cp = jest.requireActual<typeof import('node:child_process')>('node:child_process');
jest.mock('node:child_process', () => ({
	...cp,
	exec: mockExec,
}));

import { update } from './update';

describe('update', () => {
	const ADMINISTRATORS_VARIABLE = 'ADMINISTRATORS';
	const adminUser: User = {
		username: 'TheHost',
		id: '1',
	} as unknown as User;
	const otherUser: User = {
		username: 'TheCitizen',
		id: '3',
	} as unknown as User;
	const mockReplyPrivately = jest.fn<Promise<void>, [content: string]>();
	const mockEditReply = jest.fn<Promise<void>, [content: string]>();

	let context: TextInputCommandContext;
	let originalAdministrators: string | undefined;

	beforeEach(() => {
		// Overwrite the environment variable for token
		const mockAdmins = '1,2';
		originalAdministrators = process.env[ADMINISTRATORS_VARIABLE];
		process.env[ADMINISTRATORS_VARIABLE] = mockAdmins;

		context = {
			replyPrivately: mockReplyPrivately,
			user: adminUser,
			interaction: {
				editReply: mockEditReply,
			},
		} as unknown as TextInputCommandContext;
	});

	afterEach(() => {
		process.env[ADMINISTRATORS_VARIABLE] = originalAdministrators;
	});

	test('can be used by Bot admins', async () => {
		await expect(update.execute(context)).resolves.toBeUndefined();
		expect(mockExec).toHaveBeenCalledTimes(2);
		expect(mockReplyPrivately).toHaveBeenCalledOnce();
		expect(mockEditReply).toHaveBeenCalledOnce();
	});

	test('cannot be used by Non-bot-admins', async () => {
		context = { ...context, user: otherUser };

		await expect(update.execute(context)).rejects.toThrow();
		expect(mockExec).not.toHaveBeenCalled();
		expect(mockReplyPrivately).not.toHaveBeenCalled();
		expect(mockEditReply).not.toHaveBeenCalled();
	});

	test('fails if the ADMINISTRATORS environment variable is not set', async () => {
		process.env[ADMINISTRATORS_VARIABLE] = undefined;

		await expect(update.execute(context)).rejects.toThrow();
		expect(mockExec).not.toHaveBeenCalled();
		expect(mockReplyPrivately).not.toHaveBeenCalled();
		expect(mockEditReply).not.toHaveBeenCalled();
	});

	test('fails if there is already an instance running', async () => {
		void update.execute(context);
		await expect(update.execute(context)).rejects.toThrow();
	});
});
