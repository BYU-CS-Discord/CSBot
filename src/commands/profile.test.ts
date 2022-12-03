import type { User } from 'discord.js';

jest.mock('../constants/meta', () => ({
	// Version changes frequently, so use a consistent version number to test with:
	appVersion: 'X.X.X',
	repo: jest.requireActual<typeof import('../constants/meta')>('../constants/meta').repo,
}));

import { profile } from './profile';

describe('profile', () => {
	const mockReply = jest.fn();
	const mockSendTyping = jest.fn();
	let context: TextInputCommandContext;
	const user = {} as unknown as User;

	beforeEach(() => {
		context = {
			reply: mockReply,
			sendTyping: mockSendTyping,
		} as unknown as TextInputCommandContext;
		user.username = 'BobJoe';
		user.id = '1234567890';
		user.avatarURL = jest
			.fn()
			.mockReturnValue('https://cdn.discordapp.com/avatars/1234567890/abcdef1234567890.png');
	});

	test('Returns an ephemeral error message when an invalid input is recieved', async () => {
		// they just need the number from the initial call

		context = { ...context, options: [{ value: 1 }] } as unknown as TextInputCommandContext;
		await expect(profile.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: "Something went wrong, There was an issue getting the user's avatar!",
			ephemeral: true,
		});
	});

	test('Returns the url of the supplied users pp', async () => {
		context = { ...context, options: [{ user }] } as unknown as TextInputCommandContext;
		await expect(profile.execute(context)).toResolve();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: 'https://cdn.discordapp.com/avatars/1234567890/abcdef1234567890.png',
			ephemeral: false,
		});
	});
});
