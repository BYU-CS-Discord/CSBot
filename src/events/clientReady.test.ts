import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Worker } from 'node:worker_threads';

import type { Client } from 'discord.js';

import { registerCommands } from '../helpers/actions/registerCommands.ts';
import { clientReady } from './clientReady.ts';

vi.mock(import('../helpers/actions/registerCommands.ts'));

vi.mock('../logger.ts');

const mockWorkerConstructor = vi.fn();
vi.mock(import('node:worker_threads'), () => ({
	// eslint-disable-next-line @typescript-eslint/no-extraneous-class
	Worker: class {
		public constructor() {
			mockWorkerConstructor();
		}
	} as unknown as typeof Worker,
}));

describe('once(clientReady)', () => {
	const client = {
		user: { username: 'mock_user' },
	} as Client<true>;

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test('syncs commands', async () => {
		await clientReady.execute(client);
		expect(vi.mocked(registerCommands)).toHaveBeenCalled();
	});

	test('starts uptime ping worker if UPTIME_URL is set', async () => {
		vi.stubEnv('UPTIME_URL', 'https://example.com');
		await clientReady.execute(client);
		expect(mockWorkerConstructor).toHaveBeenCalled();
		mockWorkerConstructor.mockClear();
	});
});
