// Create a mocked client to track 'setActivity' calls and provide basic info
const mockSetActivity = jest.fn();
class MockClient {
	user = {
		username: 'Ze Kaiser Jr.',
		setActivity: mockSetActivity,
	};

	destroy(): void {
		// nop
	}
}

// Overwrite discord.js to use the MockClient instead of Client
const Discord = jest.requireActual<typeof import('discord.js')>('discord.js');
jest.mock('discord.js', () => ({
	...Discord,
	Client: MockClient,
}));

// Re-import Client (which is now MockedClient) so we can use it
import { Client } from 'discord.js';
const client = new Client({ intents: [] });

// Mock parseArgs so we can control what the args are
import type { Args } from '../helpers/parseArgs';
const mockParseArgs = jest.fn<Args, []>();
jest.mock('../helpers/parseArgs', () => ({ parseArgs: mockParseArgs }));

// Mock deployCommands so we can track it
jest.mock('../helpers/actions/deployCommands');
import { deployCommands } from '../helpers/actions/deployCommands';
const mockDeployCommands = deployCommands as jest.Mock;

// Mock revokeCommands so we can track it
jest.mock('../helpers/actions/revokeCommands');
import { revokeCommands } from '../helpers/actions/revokeCommands';
const mockRevokeCommands = revokeCommands as jest.Mock;

// Mock verifyCommandDeployments so we can track it
jest.mock('../helpers/actions/verifyCommandDeployments');
import { verifyCommandDeployments } from '../helpers/actions/verifyCommandDeployments';
const mockVerifyCommandDeployments = verifyCommandDeployments as jest.Mock;

// Mock the logger so nothing is printed
jest.mock('../logger');

// Import the code to test
import { ready } from './ready';

describe('once(ready)', () => {
	beforeEach(() => {
		// Default is no deploy, no revoke, no method behavior
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
		mockDeployCommands.mockResolvedValue(undefined);
		mockRevokeCommands.mockResolvedValue(undefined);
		mockSetActivity.mockReturnValue({});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("doesn't touch commands if the `deploy` and `revoke` flags are not set", async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('deploys commands if the `deploy` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: false,
		});
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockDeployCommands).toHaveBeenCalledWith(client);
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('revokes commands if the `revoke` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: true,
		});
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).toHaveBeenCalledWith(client);
	});

	test('deploys commands if both the `revoke` and `deploy` flags are set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: true,
		});
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockDeployCommands).toHaveBeenCalledWith(client);
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('verifies command deployments', async () => {
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockVerifyCommandDeployments).toHaveBeenCalledWith(client);
	});

	test('sets user activity', async () => {
		await expect(ready.execute(client)).resolves.toBeUndefined();
		expect(mockSetActivity).toHaveBeenCalledOnce();
	});
});
