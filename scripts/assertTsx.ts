/**
 * Asserts (on import) that the running context is tsx.
 *
 * @throws an {@link EvalError} if the `tsx` preloaded module is not found on the Process.
 *
 * See https://github.com/privatenumber/tsx/issues/49
 */

import assert from 'node:assert';
import process from 'node:process';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Process {
			_preload_modules: Array<string>;
		}
	}
}

try {
	assert.ok(process._preload_modules.some(s => s.includes('tsx')));
} catch {
	throw new EvalError(
		"Couldn't detect the tsx environment. Did you import this script as a module by mistake?"
	);
}
