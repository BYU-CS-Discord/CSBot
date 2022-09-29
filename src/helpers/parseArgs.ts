import { hideBin } from 'yargs/helpers';
import { version } from '../version';
import yargs from 'yargs';

export interface Args {
	deploy: boolean;
	revoke: boolean;
}

/**
 * Gets the command-line arguments, if any.
 */
export function parseArgs(): Args {
	return yargs(hideBin(process.argv))
		.option('deploy', {
			alias: 'c',
			description: 'Upload Discord commands, then exit',
			type: 'boolean',
			default: false,
		})
		.option('revoke', {
			alias: 'C',
			description: 'Revoke Discord commands, then exit',
			type: 'boolean',
			default: false,
		})
		.version(version)
		.help()
		.alias('help', 'h')
		.alias('version', 'v')
		.parseSync();
}
