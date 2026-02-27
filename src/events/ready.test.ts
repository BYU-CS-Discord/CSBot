import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Client } from 'discord.js';

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
	const client = {
		user: { username: 'Ze Kaiser Jr.' },
		destroy() {
			// nop
		},
	} as Client<true>;

	beforeEach(() => {
		// Default is no deploy, no revoke, no method behavior
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("doesn't touch commands if the `deploy` and `revoke` flags are not set", async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: false,
		});
		await ready.execute(client);
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('deploys commands if the `deploy` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: false,
		});
		await ready.execute(client);
		expect(mockDeployCommands).toHaveBeenCalledWith(client);
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('revokes commands if the `revoke` flag is set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: false,
			revoke: true,
		});
		await ready.execute(client);
		expect(mockDeployCommands).not.toHaveBeenCalled();
		expect(mockRevokeCommands).toHaveBeenCalledWith(client);
	});

	test('deploys commands if both the `revoke` and `deploy` flags are set', async () => {
		mockParseArgs.mockReturnValue({
			deploy: true,
			revoke: true,
		});
		await ready.execute(client);
		expect(mockDeployCommands).toHaveBeenCalledWith(client);
		expect(mockRevokeCommands).not.toHaveBeenCalled();
	});

	test('verifies command deployments', async () => {
		await ready.execute(client);
		expect(mockVerifyCommandDeployments).toHaveBeenCalledWith(client);
	});
});
