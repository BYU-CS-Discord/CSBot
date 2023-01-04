import { allButtons, _add } from '.';

describe('allButtons', () => {
	// TODO: this can be removed when actual buttons are implemented
	beforeAll(() => {
		_add({ customId: 'test-button' } as unknown as Button);
	});

	test('index is not empty', () => {
		expect(allButtons.size).toBeGreaterThan(0);
	});

	test('fails to install another command with the same name', () => {
		// TODO: change this to actual button custom id once one is implemented
		expect(() => _add({ customId: 'test-button' } as unknown as Button)).toThrow(TypeError);
	});
});
