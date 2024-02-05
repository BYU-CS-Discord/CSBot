import { describe, expect, test } from 'vitest';

import { allButtons, _add } from './index';

describe('allButtons', () => {
	test('index is not empty', () => {
		expect(allButtons.size).toBeGreaterThan(0);
	});

	test('fails to install another command with the same name', () => {
		expect(() => _add({ customId: 'hangmanMoreButton' } as unknown as Button)).toThrow(TypeError);
	});
});
