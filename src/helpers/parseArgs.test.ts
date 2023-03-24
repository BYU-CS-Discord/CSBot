import { parseArgs } from './parseArgs';

describe('Args parser', () => {
	test('defaults both flags to `false`', () => {
		expect(parseArgs()).toContainEntries([
			['deploy', false],
			['revoke', false],
		]);
	});
});
