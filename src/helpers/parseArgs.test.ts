import { parsedArgs } from './parseArgs';

describe('Args parser', () => {
	test('defaults both flags to `false`', () => {
		expect(parsedArgs).toContainEntries([
			['deploy', false],
			['revoke', false],
		]);
	});
});
