/**
 * Asserts (on import) that the running context is ts-node.
 *
 * @throws an {@link EvalError} if the `ts-node` Service instance is not found on the process.
 *
 * See https://github.com/TypeStrong/ts-node/issues/846
 */

import type { Service } from 'ts-node';

const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Process {
			[REGISTER_INSTANCE]?: Service;
		}
	}
}

let detectTSNode = false;

try {
	if (process[REGISTER_INSTANCE]) {
		detectTSNode = true;
	}
} catch {}

if (!detectTSNode) {
	throw new EvalError(
		"Couldn't detect the ts-node environment. Did you import this script as a module by mistake?"
	);
}
