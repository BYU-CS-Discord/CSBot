// See https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/64875 on why we need to use @types/node v18 while running Node v16
import { parseArgs as _parseArgs } from 'node:util';

const { values } = _parseArgs({
	options: {
		// Upload Discord commands, then exit
		deploy: { short: 'c', type: 'boolean', default: false },

		// Revoke Discord commands, then exit
		revoke: { short: 'C', type: 'boolean', default: false },
	},
	strict: true,
});

const args = {
	// Apply defaults, since the types aren't aware of them yet.
	// See https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/64868
	deploy: values.deploy ?? false,
	revoke: values.revoke ?? false,
} as const;

export type Args = typeof args;

/**
 * Returns the command-line arguments, or their default values if none were set.
 */
export function parseArgs(): Args {
	return args;
}
