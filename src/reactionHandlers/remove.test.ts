import { describe, expect, test } from 'vitest';

import { _add, allReactionHandlers } from './remove.js';

describe('allReactionHandlers', () => {
	test('index is not empty', () => {
		expect(allReactionHandlers.size).toBeGreaterThan(0);
	});

	test('commands can be added', () => {
		expect(() => _add({ execute: () => undefined })).not.toThrow(TypeError);
	});
});
