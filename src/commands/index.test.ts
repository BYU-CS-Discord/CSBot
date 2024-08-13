import { describe, expect, test } from 'vitest';

import { _add, allCommands } from './index.js';

describe('allCommands', () => {
	test('index is not empty', () => {
		expect(allCommands.size).toBeGreaterThan(0);
	});

	test('fails to install another command with the same name', () => {
		expect(() => {
			_add({ name: 'help' } as unknown as Command);
		}).toThrow(TypeError);
	});
});
