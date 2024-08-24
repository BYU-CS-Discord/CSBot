import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Client } from 'discord.js';

// Create a mocked client to track constructor and 'login' calls
const mockConstructClient = vi.fn<(...args: ReadonlyArray<unknown>) => void>();
const mockLogin = vi.fn<Client['login']>();

const MockClient = vi.hoisted(() => {
	return class {
		public login = mockLogin;

		public constructor(...args: ReadonlyArray<unknown>) {
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
vi.mock('./events/index.js');
import { registerEventHandlers } from './events/index.js';
const mockRegisterEventHandlers = registerEventHandlers as Mock<typeof registerEventHandlers>;

// Mock the logger to track output
vi.mock('./logger.js');
import { error as mockLoggerError } from './logger.js';

// Import the code to test
import { _main } from './main.js';

// A basic error to test with
const loginError = new Error('Failed to log in. This is a test.');

describe('main', () => {
	beforeEach(() => {
		mockLogin.mockResolvedValue(mockToken);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('disables @everyone pings', async () => {
		await _main();
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
		await _main();
		expect(mockRegisterEventHandlers).toHaveBeenCalledWith(new MockClient());
	});

	test('calls login', async () => {
		await _main();
		expect(mockLogin).toHaveBeenCalledWith(mockToken);
	});

	test('reports login errors', async () => {
		mockLogin.mockRejectedValueOnce(loginError);
		await _main();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('log in'), loginError);
	});
});
