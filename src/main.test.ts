import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Create a mocked client to track constructor and 'login' calls
const mockConstructClient = vi.fn();
const mockLogin = vi.fn();

const MockClient = vi.hoisted(() => {
	return class {
		login = mockLogin;

		constructor(...args: ReadonlyArray<unknown>) {
			mockConstructClient(...args);
		}
	};
});

// Overwrite discord.js to use the MockClient instead of Client
vi.mock('discord.js', async () => {
	const Discord = await vi.importActual<typeof import('discord.js')>('discord.js');
	return {
		...Discord,
		Client: MockClient,
	};
});

// Overwrite the environment variable for token
const mockToken = 'TEST_TOKEN';
process.env['DISCORD_TOKEN'] = mockToken;

// Mock the event handler index so we can track it
vi.mock('./events');
import { registerEventHandlers } from './events';
const mockRegisterEventHandlers = registerEventHandlers as Mock<
	Parameters<typeof registerEventHandlers>,
	ReturnType<typeof registerEventHandlers>
>;

// Mock the logger to track output
vi.mock('./logger');
import { error as mockLoggerError } from './logger';

// Import the code to test
import { _main } from './main';

// A basic error to test with
const loginError = new Error('Failed to log in. This is a test.');

describe('main', () => {
	beforeEach(() => {
		// eslint-disable-next-line unicorn/no-useless-undefined
		mockConstructClient.mockReturnValue(undefined);
		mockLogin.mockResolvedValue(mockToken);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('disables @everyone pings', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockConstructClient).toHaveBeenCalledWith(
			expect.objectContaining({
				allowedMentions: {
					parse: ['roles', 'users'],
					repliedUser: true,
				},
			})
		);
	});

	test('calls registerEventHandlers', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockRegisterEventHandlers).toHaveBeenCalledWith(new MockClient());
	});

	test('calls login', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockLogin).toHaveBeenCalledWith(mockToken);
	});

	test('reports login errors', async () => {
		mockLogin.mockRejectedValueOnce(loginError);
		await expect(_main()).resolves.toBeUndefined();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('log in'), loginError);
	});
});
