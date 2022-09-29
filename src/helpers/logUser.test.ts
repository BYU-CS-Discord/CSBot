import type { User } from 'discord.js';
import { logUser } from './logUser';

describe('Log user ID', () => {
	const user = {} as unknown as User;

	beforeEach(() => {
		user.username = 'BobJoe';
		user.id = '1234567890';
	});

	test("shows the user's username", () => {
		expect(logUser(user)).toBe(`${user.id} (${user.username})`);
	});
});
