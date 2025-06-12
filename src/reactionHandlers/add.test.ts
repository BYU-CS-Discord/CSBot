import { describe, expect, test } from 'vitest';

import { _add, addReactionHandlers } from './add.js';

describe('allReactionHandlers', () => {
	test('index is not empty', () => {
		expect(addReactionHandlers.size).toBeGreaterThan(0);
	});

	test('commands can be added', () => {
		expect(() => {
			_add({ execute: () => void 0 });
		}).not.toThrow(TypeError);
	});
});
