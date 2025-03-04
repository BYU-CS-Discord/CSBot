import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Create a mocked client to track 'setActivity' calls and provide basic info
const mockSetActivity = vi.fn<NonNullable<Client['user']>['setActivity']>();
const MockClient = vi.hoisted(() => {
	return class {
		public user = {
			username: 'Ze Kaiser Jr.',
			setActivity: mockSetActivity,
		};

		public destroy(): void {
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

// Mock ensureCommandDeployments so we can track it
vi.mock('../helpers/actions/ensureCommandDeployments.js');
import { ensureCommandDeployments } from '../helpers/actions/ensureCommandDeployments.js';
const mockEnsureCommandDeployments = ensureCommandDeployments as Mock<
	typeof ensureCommandDeployments
>;

// Mock the logger so nothing is printed
vi.mock('../logger.js');

// Import the code to test
import { ready } from './ready.js';

describe('once(ready)', () => {
	beforeEach(() => {
		mockSetActivity.mockReturnValue({} as ClientPresence);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('runs command deployments', async () => {
		await ready.execute(client);
		expect(mockEnsureCommandDeployments).toHaveBeenCalledWith(client);
	});

	test('sets user activity', async () => {
		await ready.execute(client);
		expect(mockSetActivity).toHaveBeenCalledOnce();
	});
});
