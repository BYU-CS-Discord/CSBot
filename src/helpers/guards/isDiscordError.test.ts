import 'jest-extended';
import { DiscordAPIError } from 'discord.js';
import { isDiscordError } from './isDiscordError';

class TestError extends Error {
	constructor() {
		super('This is an error');
		this.name = 'TestError';
	}
}

class TestNonError {
	readonly name: string;

	constructor() {
		this.name = 'TestNonError';
	}
}

describe('isDiscordError', () => {
	test('returns true for DiscordAPIError instances', () => {
		expect(
			isDiscordError(
				new DiscordAPIError({ code: 200, error: 'OK' }, 'OK', 200, 'GET', 'https://example.com', {})
			)
		).toBeTrue();
	});

	test('returns false for Error and other Error subclasses', () => {
		expect(isDiscordError(new Error('This is an error'))).toBeFalse();
		expect(isDiscordError(new EvalError('This is an error'))).toBeFalse();
		expect(isDiscordError(new RangeError('This is an error'))).toBeFalse();
		expect(isDiscordError(new ReferenceError('This is an error'))).toBeFalse();
		expect(isDiscordError(new SyntaxError('This is an error'))).toBeFalse();
		expect(isDiscordError(new TestError())).toBeFalse();
		expect(isDiscordError(new TypeError('This is an error'))).toBeFalse();
	});

	test.each`
		value
		${Number.NaN}
		${Number.POSITIVE_INFINITY}
		${0}
		${''}
		${'not an error'}
		${{}}
		${{ key: 'value' }}
		${new TestNonError()}
	`('returns false for non-error value: $value', ({ value }: { value: unknown }) => {
		expect(isDiscordError(value)).toBeFalse();
	});
});
