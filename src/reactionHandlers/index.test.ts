import { _add, allReactionHandlers } from './index';

describe('allReactionHandlers', () => {
	test('index is not empty', () => {
		expect(allReactionHandlers.size).toBeGreaterThan(0);
	});

	test('commands can be added', () => {
		// eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
		expect(() => _add({ execute: () => {} } as unknown as ReactionHandler)).not.toThrow(TypeError);
	});
});
