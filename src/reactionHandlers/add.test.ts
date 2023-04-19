import { _add, allReactionHandlers } from './add';

describe('allReactionHandlers', () => {
	test('index is not empty', () => {
		expect(allReactionHandlers.size).toBeGreaterThan(0);
	});

	test('commands can be added', () => {
		expect(() => _add({ execute: () => undefined })).not.toThrow(TypeError);
	});
});
