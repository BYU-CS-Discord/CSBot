import { describe, expect, test } from 'vitest';

import { isError } from './isError';

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

describe('isError', () => {
	test('returns true for Error instances', () => {
		expect(isError(new Error('This is an error'))).toBeTruthy();
	});

	test('returns true for Error subclasses', () => {
		expect(isError(new EvalError('This is an error'))).toBeTruthy();
		expect(isError(new RangeError('This is an error'))).toBeTruthy();
		expect(isError(new ReferenceError('This is an error'))).toBeTruthy();
		expect(isError(new SyntaxError('This is an error'))).toBeTruthy();
		expect(isError(new TestError())).toBeTruthy();
		expect(isError(new TypeError('This is an error'))).toBeTruthy();
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
		expect(isError(value)).toBeFalsy();
	});
});
