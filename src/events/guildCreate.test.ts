import type { Logger } from '../logger.js';
import { describe, expect, type Mock, test, vi } from 'vitest';

const mockLogError = vi.fn<Logger['error']>();
const logger = {
	debug: vi.fn<Logger['debug']>(),
	error: mockLogError,
} as unknown as Logger;

vi.mock('../helpers/actions/ensureCommandDeployments.js', () => ({
	ensureCommandDeploymentsForGuild: vi.fn(),
}));
import { ensureCommandDeploymentsForGuild } from '../helpers/actions/ensureCommandDeployments.js';
const mockEnsureCommandDeploymentsForGuild = ensureCommandDeploymentsForGuild as Mock<
	typeof ensureCommandDeploymentsForGuild
>;

// Import the unit under test
import { guildCreate } from './guildCreate.js';
import { Guild } from 'discord.js';

describe('on(guildCreate)', () => {
	const guild = {
		id: 'test-guild-1',
		name: 'Test Guild',
	} as unknown as Guild;

	test('deploys commands to guild', async () => {
		await expect(guildCreate.execute(guild, logger)).resolves.toBeUndefined();
		expect(mockEnsureCommandDeploymentsForGuild).toHaveBeenCalledWith(guild, logger);
		expect(mockLogError).not.toHaveBeenCalled();
	});

	test('logs an error if deployment fails', async () => {
		const msg = 'Example failure';
		mockEnsureCommandDeploymentsForGuild.mockRejectedValueOnce(new Error(msg));
		await expect(guildCreate.execute(guild, logger)).resolves.toBeUndefined();
		expect(mockLogError).toHaveBeenCalledOnce();
		expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining(msg));
	});
});
