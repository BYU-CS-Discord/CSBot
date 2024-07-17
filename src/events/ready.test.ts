import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Create a mocked client to track 'setActivity' calls and provide basic info
const mockSetActivity = vi.fn<NonNullable<Client['user']>['setActivity']>();
const MockClient = vi.hoisted(() => {
	return class {
		user = {
			username: 'Ze Kaiser Jr.',
			setActivity: mockSetActivity,
		};

		destroy(): void {
			// nop
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

// Re-import Client (which is now MockedClient) so we can use it
import type { ClientPresence } from 'discord.js';
import { Client } from 'discord.js';
const client = new Client({ intents: [] });

// Mock parseArgs so we can control what the args are
import type { parseArgs } from '../helpers/parseArgs.js';
const mockParseArgs = vi.hoisted(() => vi.fn<typeof parseArgs>());
vi.mock('../helpers/parseArgs', () => ({ parseArgs: mockParseArgs }));

// Mock deployCommands so we can track it
vi.mock('../helpers/actions/deployCommands.js');
import { deployCommands } from '../helpers/actions/deployCommands.js';
const mockDeployCommands = deployCommands as Mock<typeof deployCommands>;

// Mock revokeCommands so we can track it
vi.mock('../helpers/actions/revokeCommands.js');
import { revokeCommands } from '../helpers/actions/revokeCommands.js';
const mockRevokeCommands = revokeCommands as Mock<typeof revokeCommands>;

// Mock verifyCommandDeployments so we can track it
vi.mock('../helpers/actions/verifyCommandDeployments.js');
import { verifyCommandDeployments } from '../helpers/actions/verifyCommandDeployments.js';
const mockVerifyCommandDeployments = verifyCommandDeployments as Mock<
	typeof verifyCommandDeployments
>;

// Mock the logger so nothing is printed
vi.mock('../logger.js');

// Import the code to test
import { ready } from './ready.js';

describe('once(ready)', () => {
	beforeEach(() => {
		// Default is no deploy, no revoke, no method behavior
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
		mockSetActivity.mockReturnValue({} as ClientPresence);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
