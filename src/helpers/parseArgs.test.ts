import { describe, expect, test } from 'vitest';

import { parseArgs } from './parseArgs.js';

describe('Args parser', () => {
	test('defaults both flags to `false`', () => {
		expect(parseArgs()).toMatchObject({
			deploy: false,
			revoke: false,
		});
	});
});
