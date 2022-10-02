const mockConstructClient = jest.fn();
const mockLogin = jest.fn();
const mockSetActivity = jest.fn();
const mockInteractionIsCommand = jest.fn();

const mockClientError = new Error('This is a test error');

const mockInteraction = {
	isCommand: mockInteractionIsCommand,
};

const mockToken = 'TEST_TOKEN';
process.env['DISCORD_TOKEN'] = mockToken;

class MockClient {
	login = mockLogin;

	user = {
		username: 'Ze Kaiser Jr.',
		setActivity: mockSetActivity,
	};

	constructor(...args: Array<unknown>) {
		mockConstructClient(...args);
	}

	on(eventName: string | symbol, listener: (...args: Array<unknown>) => void): this {
		switch (eventName) {
			case 'ready':
				listener(this);
				return this;
			case 'error':
				listener(mockClientError);
				return this;
			case 'interactionCreate':
				listener(mockInteraction);
				return this;
			default:
				return this;
		}
	}

	destroy(): void {
		// nop
	}
}

const { ActivityType, GatewayIntentBits, Partials, ApplicationCommandOptionType } =
	jest.requireActual<typeof import('discord.js')>('discord.js');

jest.mock('discord.js', () => ({
	ActivityType,
	Client: MockClient,
	GatewayIntentBits,
	Partials,
	ApplicationCommandOptionType,
}));

jest.mock('./helpers/actions/deployCommands');
import { deployCommands } from './helpers/actions/deployCommands';
const mockDeployCommands = deployCommands as jest.Mock;

jest.mock('./handleInteraction');
import { handleInteraction } from './handleInteraction';
const mockHandleInteraction = handleInteraction as jest.Mock;

import type { Args } from './helpers/parseArgs';
const mockParseArgs = jest.fn<Args, []>();
jest.mock('./helpers/parseArgs', () => ({ parseArgs: mockParseArgs }));

jest.mock('./helpers/actions/revokeCommands');
import { revokeCommands } from './helpers/actions/revokeCommands';
const mockRevokeCommands = revokeCommands as jest.Mock;

jest.mock('./helpers/actions/verifyCommandDeployments');
import { verifyCommandDeployments } from './helpers/actions/verifyCommandDeployments';
const mockVerifyCommandDeployments = verifyCommandDeployments as jest.Mock;

import { _main } from './main';

describe('main', () => {
	let mockConsoleError: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(global.console, 'debug').mockImplementation(() => undefined);
		jest.spyOn(global.console, 'info').mockImplementation(() => undefined);
		mockConsoleError = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);

		mockConstructClient.mockReturnValue(undefined);
		mockLogin.mockResolvedValue('TEST');
		mockSetActivity.mockReturnValue({});
		mockInteractionIsCommand.mockReturnValue(true);
		mockHandleInteraction.mockResolvedValue(undefined);
		mockDeployCommands.mockResolvedValue(undefined);
		mockRevokeCommands.mockResolvedValue(undefined);
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('disables @everyone pings', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockConstructClient).toHaveBeenCalledOnce();
		expect(mockConstructClient).toHaveBeenCalledWith(
			expect.objectContaining({
				allowedMentions: {
					parse: ['roles', 'users'],
					repliedUser: true,
				},
			})
		);
	});

	test("doesn't touch commands if the `deploy` and `revoke` flags are not set", async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
		await expect(_main()).resolves.toBeUndefined();
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('deploys commands if the `deploy` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: false,
		});
		await expect(_main()).resolves.toBeUndefined();
		expect(mockDeployCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('revokes commands if the `revoke` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: true,
		});
		await expect(_main()).resolves.toBeUndefined();
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
	});

	test('deploys commands if both the `revoke` and `deploy` flags are set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: true,
		});
		await expect(_main()).resolves.toBeUndefined();
		expect(mockDeployCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('verifies command deployments', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockVerifyCommandDeployments).toHaveBeenCalledOnce();
	});

	test("doesn't call interaction handler if the interaction isn't a command", async () => {
		mockInteractionIsCommand.mockReturnValue(false);
		await expect(_main()).resolves.toBeUndefined();
		expect(mockHandleInteraction).not.toHaveBeenCalled();
	});

	test('calls login', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockLogin).toHaveBeenCalledOnce();
		expect(mockLogin).toHaveBeenCalledWith(mockToken);
	});

	test('reports login errors', async () => {
		const loginError = new Error('Failed to log in. This is a test.');
		mockLogin.mockRejectedValueOnce(loginError);
		await expect(_main()).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('log in'), //
			loginError
		);
	});

	test('reports interaction errors', async () => {
		const interactionError = new Error('Failed to handle ineracion. This is a test.');
		mockHandleInteraction.mockRejectedValueOnce(interactionError);
		await expect(_main()).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('handle interaction'),
			interactionError
		);
	});

	test('reports client errors', async () => {
		await expect(_main()).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('client error'),
			mockClientError
		);
	});
});
