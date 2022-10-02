import { _add, allEventHandlers } from './index';

describe('allCommands', () => {
	test('index is not empty', () => {
		expect(allEventHandlers.size).toBeGreaterThan(0);
	});

	test('fails to install another event handler with the same name', () => {
		expect(() => _add({ name: 'error' } as unknown as EventHandler)).toThrow(TypeError);
	});
});
