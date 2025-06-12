import { describe, expect, test } from 'vitest';

import { _add, removeReactionHandlers } from './remove.js';

describe('allReactionHandlers', () => {
	test('index is not empty', () => {
		expect(removeReactionHandlers.size).toBeGreaterThan(0);
	});

	test('commands can be added', () => {
		expect(() => {
			_add({ execute: () => void 0 });
		}).not.toThrow(TypeError);
	});
});
