import { appVersion } from '../constants/meta';
import { hideBin } from 'yargs/helpers';
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
		.version(appVersion)
		.help()
		.alias('h', 'help')
		.alias('v', 'version')
		.parseSync();
}
