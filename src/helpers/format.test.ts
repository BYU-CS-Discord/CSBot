import { describe, expect, test } from 'vitest';

import { format } from './format.js';

describe('format template strings', () => {
	test('creates "foo bar baz" as documented', () => {
		const template = 'foo {0} {1}';
		const bar = 'bar';
		const baz = 'baz';
		expect(format(template, bar, baz)).toBe('foo bar baz');
	});
});
