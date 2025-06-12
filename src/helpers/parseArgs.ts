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

export type Args = typeof values;

/**
 * Returns the command-line arguments, or their default values if none were set.
 */
export function parseArgs(): Args {
	return values;
}
